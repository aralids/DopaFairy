import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

import {
	MIN_SPHERE_SIZE,
	MAX_SPHERE_SIZE,
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
} from "../config/config";

import { mapValuesToSizes } from "../utils/helper_functions";

const MoleculeMover = ({
	name,
	pos,
	tEvol,
	useSimTime,
	minGlobalValue,
	maxGlobalValue,
	moveDuration = MOVE_DURATION_IN_SIM_SEC,
	pauseDuration = PAUSE_DURATION_IN_SIM_SEC,
	offset = 0,
}) => {
	// sizes derived from your value track
	const sizes = useMemo(
		() =>
			mapValuesToSizes(
				tEvol,
				MIN_SPHERE_SIZE,
				MAX_SPHERE_SIZE,
				minGlobalValue,
				maxGlobalValue,
			),
		[tEvol, minGlobalValue, maxGlobalValue],
	);

	// refs
	const groupRef = useRef();
	const meshRef = useRef();

	// global sim time
	const { simTime } = useSimTime();

	// path endpoints
	const v0 = useRef(new THREE.Vector3(...pos[0]));
	const v1 = useRef(new THREE.Vector3(...pos[1]));

	const cycle = moveDuration + pauseDuration;

	useFrame(() => {
		if (!groupRef.current || !meshRef.current) return;

		const t = simTime.current + offset;
		const localT = ((t % cycle) + cycle) % cycle;

		// current index
		const n = sizes?.length ?? 0;
		if (n === 0) return;

		const step = Math.floor(t / cycle);
		const idx = ((step % n) + n) % n;

		// ============================================================
		// ======================= SIZE SNAP ==========================
		// Size is defined ONLY by sizes[idx]
		// ============================================================
		meshRef.current.scale.setScalar(sizes[idx]);
		// ============================================================

		// movement
		if (localT < moveDuration) {
			const u = moveDuration > 0 ? localT / moveDuration : 1;
			groupRef.current.position.lerpVectors(v0.current, v1.current, u);
		} else {
			groupRef.current.position.copy(v1.current);
		}
	});

	return (
		<group ref={groupRef} name={`${name}-depot`} position={pos[0]}>
			<mesh ref={meshRef} scale={sizes?.[0] ?? 1}>
				<sphereGeometry args={[1, 32, 32]} />
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
				{name}
			</Text>
		</group>
	);
};

export default MoleculeMover;
