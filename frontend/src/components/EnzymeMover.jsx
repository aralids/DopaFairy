import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	ENZYME_OFFSET_IN_SIM_SEC,
} from "../config/config";

function EnzymeMover({ p0, p1, p2, useSimTime }) {
	const offset = ENZYME_OFFSET_IN_SIM_SEC;
	const move1 = MOVE_DURATION_IN_SIM_SEC / 2;
	const pause = PAUSE_DURATION_IN_SIM_SEC;
	const move2 = MOVE_DURATION_IN_SIM_SEC / 2;

	const ref = useRef();
	const { simTime } = useSimTime(); // ✅ CHANGED

	const v0 = useRef(new THREE.Vector3(...p0));
	const v1 = useRef(new THREE.Vector3(...p1));
	const v2 = useRef(new THREE.Vector3(...p2));

	const cycle = move1 + pause + move2;

	useFrame(() => {
		if (!ref.current) return;

		const globalT = simTime.current + offset; // ✅ CHANGED
		const localT = ((globalT % cycle) + cycle) % cycle;

		if (localT < move1) {
			// p0 -> p1
			const u = localT / move1;
			ref.current.position.lerpVectors(v0.current, v1.current, u);
			return;
		}

		if (localT < move1 + pause) {
			// hold at p1
			ref.current.position.copy(v1.current);
			return;
		}

		// p1 -> p2
		const u = (localT - move1 - pause) / move2;
		ref.current.position.lerpVectors(v1.current, v2.current, u);
	});

	return (
		<mesh ref={ref} name="TH" position={p0}>
			<boxGeometry args={[0.03, 0.03, 0.03]} />
			<meshStandardMaterial color="#7CFFCB" />
		</mesh>
	);
}

export default EnzymeMover;
