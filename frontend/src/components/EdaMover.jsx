import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	EDA_PATH_POINTS,
} from "../config/config";
import { destroyed } from "../config/steadyState";

function EdaMover({ label: _label = "223 mM", useSimTime }) {
	const p = EDA_PATH_POINTS;

	// same offset scheme as others
	const offset = 5 * (MOVE_DURATION_IN_SIM_SEC + PAUSE_DURATION_IN_SIM_SEC);

	const p0 = p[0];
	const p1 = p[1];

	const moveDuration = MOVE_DURATION_IN_SIM_SEC;
	const pauseDuration = PAUSE_DURATION_IN_SIM_SEC;

	const ref = useRef();
	const { simTime } = useSimTime();

	// ✅ label state driven by array (same as DatMover)
	const [label, setLabel] = useState("");
	const lastLabelKey = useRef(null);

	const v0 = useRef(new THREE.Vector3(...p0));
	const v1 = useRef(new THREE.Vector3(...p1));

	const cycle = moveDuration + pauseDuration;

	useFrame(() => {
		if (!ref.current) return;

		const globalT = simTime.current + offset;
		const localT = ((globalT % cycle) + cycle) % cycle;

		// ✅ advance label once per cycle, starting at destroyed[5]
		const k = Math.floor(globalT / cycle);
		const idx = 5 + k;

		const nextLabel =
			idx >= 0 && idx < (destroyed?.length ?? 0) ? destroyed[idx] : "";

		const key = `${k}:${idx}:${nextLabel}`;
		if (lastLabelKey.current !== key) {
			lastLabelKey.current = key;
			setLabel(nextLabel);
		}

		// move, then pause at end
		if (localT < moveDuration) {
			const u = localT / moveDuration;
			ref.current.position.lerpVectors(v0.current, v1.current, u);
		} else {
			ref.current.position.copy(v1.current);
		}
	});

	return (
		<group ref={ref} name={`Sphere${offset}`} position={p0}>
			<mesh name={`Sphere${offset}`}>
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

export default EdaMover;
