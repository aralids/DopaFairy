import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	CHECKPOINT_POSITIONS,
	MIN_SPHERE_SIZE,
	MAX_SPHERE_SIZE,
	MIN_LDOPA_AMOUNT,
	MAX_LDOPA_AMOUNT,
	MIN_CDA_AMOUNT,
	MAX_CDA_AMOUNT,
	MIN_VDA_AMOUNT,
	MAX_VDA_AMOUNT,
} from "../config/config";
import { btyr, tyr, ldopa, cda, vda } from "../config/steadyState";

function SphereMover({ offset, index, useSimTime }) {
	const p = CHECKPOINT_POSITIONS;
	const moveDuration = MOVE_DURATION_IN_SIM_SEC;
	const pauseDuration = PAUSE_DURATION_IN_SIM_SEC;

	const ref = useRef();
	const meshRef = useRef(); // ✅ NEW: scale this mesh
	const { simTime } = useSimTime();

	const [label, setLabel] = useState("");
	const lastLabelKey = useRef(null);

	const points = useMemo(() => p.map((pt) => new THREE.Vector3(...pt)), [p]);

	const segCount = Math.max(0, points.length - 1);
	const segDuration = moveDuration + pauseDuration;
	const cycle = segCount * segDuration;

	// ✅ NEW: mapping helper
	const clamp01 = (x) => Math.max(0, Math.min(1, x));
	const mapAmountToRadius = (amount, minA, maxA) => {
		// if we can't map, fall back to current minimum size
		if (amount === "" || amount === null || amount === undefined)
			return MIN_SPHERE_SIZE;
		const a = Number(amount);
		if (
			!Number.isFinite(a) ||
			!Number.isFinite(minA) ||
			!Number.isFinite(maxA) ||
			maxA === minA
		) {
			return MIN_SPHERE_SIZE;
		}
		const t = clamp01((a - minA) / (maxA - minA));
		return MIN_SPHERE_SIZE + t * (MAX_SPHERE_SIZE - MIN_SPHERE_SIZE);
	};

	// ✅ NEW: get amount + min/max for a segment
	const getAmountAndRangeForSeg = (segIndex, baseIdx) => {
		const pickVal = (arr) => {
			if (!Array.isArray(arr) || arr.length === 0) return "";
			if (baseIdx < 0 || baseIdx >= arr.length) return "";
			return arr[baseIdx];
		};

		// NOTE: you only provided MIN/MAX for ldopa/cda/vda.
		// For btyr/tyr we keep MIN_SPHERE_SIZE (no resizing) unless you add MIN/MAX for them.
		if (segIndex === 0)
			return { amount: pickVal(btyr), minA: null, maxA: null, name: "btyr" };
		if (segIndex === 1)
			return { amount: pickVal(tyr), minA: null, maxA: null, name: "tyr" };
		if (segIndex === 2)
			return {
				amount: pickVal(ldopa),
				minA: MIN_LDOPA_AMOUNT,
				maxA: MAX_LDOPA_AMOUNT,
				name: "ldopa",
			};
		if (segIndex === 3)
			return {
				amount: pickVal(cda),
				minA: MIN_CDA_AMOUNT,
				maxA: MAX_CDA_AMOUNT,
				name: "cda",
			};
		if (segIndex === 4)
			return {
				amount: pickVal(vda),
				minA: MIN_VDA_AMOUNT,
				maxA: MAX_VDA_AMOUNT,
				name: "vda",
			};

		return { amount: "", minA: null, maxA: null, name: "" };
	};

	useFrame(() => {
		if (!ref.current) return;
		if (points.length === 0) return;

		if (points.length === 1 || segCount === 0 || cycle === 0) {
			ref.current.position.copy(points[0]);
			return;
		}

		const globalT = simTime.current + offset;

		const k = Math.floor(globalT / cycle);
		const localT = ((globalT % cycle) + cycle) % cycle;

		const segIndex = Math.floor(localT / segDuration); // 0..segCount-1
		const segT = localT - segIndex * segDuration;

		const a = points[segIndex];
		const b = points[segIndex + 1];

		// position
		if (segT < moveDuration) {
			const u = segT / moveDuration;
			ref.current.position.lerpVectors(a, b, u);
		} else {
			ref.current.position.copy(b);
		}

		// ✅ label + amount
		const baseIdx = index - 1 + 5 * k;

		const cur = getAmountAndRangeForSeg(segIndex, baseIdx);
		const nextSeg = (segIndex + 1) % segCount; // next segment in cycle
		const nxt = getAmountAndRangeForSeg(nextSeg, baseIdx);

		let nextLabel = "";
		if (cur.name) nextLabel = `${cur.name}\n${cur.amount}`;

		const key = `${k}:${segIndex}:${nextLabel}`;
		if (lastLabelKey.current !== key) {
			lastLabelKey.current = key;
			setLabel(nextLabel);
		}

		// ✅ size animation during pause (the last 0.3s of the segment)
		// During move: hold "current" size.
		// During pause: interpolate current -> next segment size.
		let curRadius = MIN_SPHERE_SIZE;
		let nxtRadius = MIN_SPHERE_SIZE;

		// only map when we have a valid range (ldopa/cda/vda); otherwise keep min size
		if (cur.minA != null && cur.maxA != null)
			curRadius = mapAmountToRadius(cur.amount, cur.minA, cur.maxA);
		if (nxt.minA != null && nxt.maxA != null)
			nxtRadius = mapAmountToRadius(nxt.amount, nxt.minA, nxt.maxA);

		let radius = curRadius;

		if (pauseDuration > 0 && segT >= moveDuration) {
			const w = (segT - moveDuration) / pauseDuration; // 0..1 over pause
			const ww = Math.max(0, Math.min(1, w));
			radius = curRadius + (nxtRadius - curRadius) * ww;
		}

		// apply scaling to mesh
		if (meshRef.current) {
			const baseGeomRadius = 0.015; // your sphereGeometry radius
			const s = baseGeomRadius > 0 ? radius / baseGeomRadius : 1;
			meshRef.current.scale.setScalar(s);
		}
	});

	const start = points[0] ?? new THREE.Vector3();

	return (
		<group ref={ref} name={`Sphere${offset / moveDuration}`} position={start}>
			<mesh ref={meshRef} name={`Sphere${offset / moveDuration}`}>
				<sphereGeometry args={[0.015, 32, 32]} />
				<meshStandardMaterial color="hotpink" />
			</mesh>

			<Text
				position={[0, -0.04, 0]}
				fontSize={0.02}
				anchorX="center"
				anchorY="top"
				billboard
				scale={[-1, 1, 1]}
			>
				{label === "" ? "" : `${label}mM`}
			</Text>
		</group>
	);
}

export default SphereMover;
