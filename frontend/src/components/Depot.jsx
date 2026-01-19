import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import {
	MIN_SPHERE_SIZE,
	MAX_SPHERE_SIZE,
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
} from "../config/config";

import { mapValuesToSizes } from "../utils/helper_functions";
import { sampleScalarTrack } from "../utils/animation_functions";

const Depot = ({ name, pos, tEvol = [], useSimTime }) => {
	const sizes = useMemo(
		() => mapValuesToSizes(tEvol, MIN_SPHERE_SIZE, MAX_SPHERE_SIZE),
		[tEvol],
	);

	const meshRef = useRef();
	const { simTime } = useSimTime();

	useFrame(() => {
		if (!meshRef.current) return;

		const s = sampleScalarTrack({
			t: simTime.current,
			values: sizes,
			holdSec: MOVE_DURATION_IN_SIM_SEC,
			lerpSec: PAUSE_DURATION_IN_SIM_SEC,
		});

		meshRef.current.scale.setScalar(s);
	});

	return (
		<group name={`${name}-depot`} position={pos}>
			<mesh ref={meshRef} scale={sizes[0]}>
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
				{`${name}`}
			</Text>
		</group>
	);
};

export default Depot;
