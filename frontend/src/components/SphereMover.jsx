import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react"; // ✅ CHANGED
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	CHECKPOINT_POSITIONS,
} from "../config/config";
import { btyr, tyr, ldopa, cda, vda } from "../config/steadyState";

function SphereMover({ offset, index, useSimTime }) {
	const p = CHECKPOINT_POSITIONS;
	const moveDuration = MOVE_DURATION_IN_SIM_SEC;
	const pauseDuration = PAUSE_DURATION_IN_SIM_SEC;

	const ref = useRef();
	const { simTime } = useSimTime();

	// ✅ NEW: label state (updates only when needed)
	const [label, setLabel] = useState("");
	const lastLabelKey = useRef(null);

	// Prebuild vectors once per p
	const points = useMemo(() => p.map((pt) => new THREE.Vector3(...pt)), [p]);

	// For N points, we have (N-1) move segments + (N-1) pause segments (pause at each arrival)
	const segCount = Math.max(0, points.length - 1);
	const segDuration = moveDuration + pauseDuration;
	const cycle = segCount * segDuration;

	useFrame(() => {
		if (!ref.current) return;
		if (points.length === 0) return;
		if (points.length === 1 || segCount === 0 || cycle === 0) {
			ref.current.position.copy(points[0]);
			return;
		}

		const globalT = simTime.current + offset;

		// ✅ NEW: round k (0,1,2,...) based on how many full cycles have elapsed
		const k = Math.floor(globalT / cycle);

		const localT = ((globalT % cycle) + cycle) % cycle;

		const segIndex = Math.floor(localT / segDuration); // 0..segCount-1
		const segT = localT - segIndex * segDuration;

		const a = points[segIndex];
		const b = points[segIndex + 1];

		if (segT < moveDuration) {
			const u = segT / moveDuration;
			ref.current.position.lerpVectors(a, b, u);
		} else {
			ref.current.position.copy(b);
		}

		// ✅ NEW: compute label for this segment + round
		const baseIdx = index - 1 + 5 * k;

		const pick = (arr) => {
			if (!Array.isArray(arr) || arr.length === 0) return "";
			if (baseIdx < 0) return "";
			if (baseIdx >= arr.length) return ""; // "until end reached" → blank once out of range
			return arr[baseIdx];
		};

		let nextLabel = "";
		if (segIndex === 0) nextLabel = pick(btyr);
		else if (segIndex === 1) nextLabel = pick(tyr);
		else if (segIndex === 2) nextLabel = pick(ldopa);
		else if (segIndex === 3) nextLabel = pick(cda);
		else if (segIndex === 4) nextLabel = pick(vda);

		// update state only when it actually changes
		const key = `${k}:${segIndex}:${nextLabel}`;
		if (lastLabelKey.current !== key) {
			lastLabelKey.current = key;
			setLabel(nextLabel);
		}
	});

	const start = points[0] ?? new THREE.Vector3();

	return (
		<group ref={ref} name={`Sphere${offset / moveDuration}`} position={start}>
			<mesh name={`Sphere${offset / moveDuration}`}>
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
