import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	DAT_CURVE_POINTS,
	K_CDA,
	MIN_REUPTAKEN_AMOUNT,
	MAX_REUPTAKEN_AMOUNT,
	MIN_SPHERE_SIZE,
	MAX_SPHERE_SIZE,
} from "../config/config";
import { cda, reuptaken } from "../config/steadyState";

function DatMover({ label: _label = "223 mM", useSimTime }) {
	const p = DAT_CURVE_POINTS;
	const offset = 5 * (MOVE_DURATION_IN_SIM_SEC + PAUSE_DURATION_IN_SIM_SEC);
	const moveDuration = MOVE_DURATION_IN_SIM_SEC;
	const endPause = PAUSE_DURATION_IN_SIM_SEC;

	const ref = useRef();
	const meshRef = useRef(); // ✅ NEW
	const { simTime } = useSimTime();

	const [label, setLabel] = useState("");
	const lastLabelKey = useRef(null);

	const path = useMemo(() => {
		const pts = p.map((pt) => new THREE.Vector3(...pt));
		const n = Math.max(0, pts.length - 1);

		if (n === 0) return { pts, segTimes: [], segEndTimes: [], totalLen: 0 };

		const segLens = new Array(n);
		let totalLen = 0;
		for (let i = 0; i < n; i++) {
			const len = pts[i].distanceTo(pts[i + 1]);
			segLens[i] = len;
			totalLen += len;
		}

		const segTimes = new Array(n);
		if (totalLen === 0) {
			for (let i = 0; i < n; i++) segTimes[i] = moveDuration / n;
		} else {
			for (let i = 0; i < n; i++)
				segTimes[i] = (segLens[i] / totalLen) * moveDuration;
		}

		const segEndTimes = new Array(n);
		let acc = 0;
		for (let i = 0; i < n; i++) {
			acc += segTimes[i];
			segEndTimes[i] = acc;
		}
		segEndTimes[n - 1] = moveDuration;

		return { pts, segTimes, segEndTimes, totalLen };
	}, [p, moveDuration]);

	const cycle = moveDuration + endPause;

	// ✅ NEW: helpers for size mapping
	const clamp01 = (x) => Math.max(0, Math.min(1, x));
	const amountToRadius = (amount) => {
		const a = Number(amount);
		if (!Number.isFinite(a)) return MIN_SPHERE_SIZE;
		const denom = MAX_REUPTAKEN_AMOUNT - MIN_REUPTAKEN_AMOUNT;
		if (!Number.isFinite(denom) || denom === 0) return MIN_SPHERE_SIZE;
		const t = clamp01((a - MIN_REUPTAKEN_AMOUNT) / denom);
		return MIN_SPHERE_SIZE + t * (MAX_SPHERE_SIZE - MIN_SPHERE_SIZE);
	};

	useFrame(() => {
		const obj = ref.current;
		if (!obj) return;

		const { pts, segTimes, segEndTimes } = path;
		const n = pts.length - 1;

		if (pts.length <= 1 || n <= 0) {
			obj.position.copy(pts[0] ?? new THREE.Vector3());
			return;
		}

		const t = simTime.current + offset;
		const localT = ((t % cycle) + cycle) % cycle;

		// index into arrays
		const k = Math.floor(t / cycle);
		const idx = 5 + k;

		// amounts
		const A0 =
			idx >= 0 && idx < (reuptaken?.length ?? 0) ? Number(reuptaken[idx]) : NaN;

		const CDA = idx >= 0 && idx < (cda?.length ?? 0) ? Number(cda[idx]) : NaN;

		const A1 =
			Number.isFinite(A0) && Number.isFinite(CDA) ? A0 - K_CDA * CDA : NaN;

		// interpolate amount during travel, hold during pause
		let A = A0;
		if (localT < moveDuration) {
			const uAmt = moveDuration > 0 ? localT / moveDuration : 1;
			if (Number.isFinite(A0) && Number.isFinite(A1)) {
				A = A0 + (A1 - A0) * uAmt;
			}
		} else {
			A = A1;
		}

		// ✅ label changes accordingly (continuous during travel)
		const nextLabel = Number.isFinite(A) ? A.toFixed(3) : "";
		const key = `${k}:${idx}:${nextLabel}`;
		if (lastLabelKey.current !== key) {
			lastLabelKey.current = key;
			setLabel(nextLabel);
		}

		// ✅ size follows the same A
		const radius = amountToRadius(A);
		if (meshRef.current) {
			const baseGeomRadius = 0.015; // sphereGeometry radius
			const s = baseGeomRadius > 0 ? radius / baseGeomRadius : 1;
			meshRef.current.scale.setScalar(s);
		}

		// position along path (unchanged)
		if (localT >= moveDuration) {
			obj.position.copy(pts[pts.length - 1]);
			return;
		}

		let i = 0;
		while (i < n - 1 && localT > segEndTimes[i]) i++;

		const segStart = i === 0 ? 0 : segEndTimes[i - 1];
		const segLenT = Math.max(1e-9, segTimes[i]);
		const u = (localT - segStart) / segLenT;

		obj.position.lerpVectors(pts[i], pts[i + 1], u);
	});

	const start = path.pts[0] ?? new THREE.Vector3();

	return (
		<group ref={ref} name="DatMover" position={start}>
			<mesh ref={meshRef}>
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

export default DatMover;
