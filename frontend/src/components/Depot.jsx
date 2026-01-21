import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import {
	MIN_SPHERE_SIZE,
	MAX_SPHERE_SIZE,
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
} from "../config/config";

import { mapValuesToSizes, formatNumber } from "../utils/helper_functions";
import { sampleScalarTrack } from "../utils/animation_functions";

const BASE_GEOM_RADIUS = 0.015; // ✅ same idea as SphereMover

const Depot = ({
	name,
	pos,
	tEvol = [],
	useSimTime,
	minGlobalValue,
	maxGlobalValue,
	textColor = "white",
}) => {
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

	const meshRef = useRef();
	const textRef = useRef();
	const lastText = useRef("");
	const { simTime } = useSimTime();

	useFrame(() => {
		if (!meshRef.current) return;

		// radius in world units (MIN_SPHERE_SIZE..MAX_SPHERE_SIZE)
		const radius = sampleScalarTrack({
			t: simTime.current,
			values: sizes,
			holdSec: MOVE_DURATION_IN_SIM_SEC,
			lerpSec: PAUSE_DURATION_IN_SIM_SEC,
		});

		// ✅ convert radius -> scale factor relative to geometry radius
		const s = BASE_GEOM_RADIUS > 0 ? radius / BASE_GEOM_RADIUS : 1;
		meshRef.current.scale.setScalar(s);

		// label (unchanged)
		const val = sampleScalarTrack({
			t: simTime.current,
			values: tEvol,
			holdSec: MOVE_DURATION_IN_SIM_SEC,
			lerpSec: PAUSE_DURATION_IN_SIM_SEC,
		});

		const next = `${name}\n${formatNumber(val, 3)} mM`;
		if (textRef.current && next !== lastText.current) {
			lastText.current = next;
			textRef.current.text = next;
		}
	});

	// ✅ initial scale should also be radius/baseRadius
	const initialRadius = sizes?.[0] ?? (MIN_SPHERE_SIZE + MAX_SPHERE_SIZE) / 2;
	const initialScale =
		BASE_GEOM_RADIUS > 0 ? initialRadius / BASE_GEOM_RADIUS : 1;

	return (
		<group name={`${name}-depot`} position={pos}>
			<mesh ref={meshRef} scale={initialScale}>
				{/* ✅ was radius=1; now match SphereMover */}
				<sphereGeometry args={[BASE_GEOM_RADIUS, 32, 32]} />
				<meshStandardMaterial color="hotpink" />
			</mesh>

			<Text
				ref={textRef}
				position={[0, -0.04, 0]}
				fontSize={0.04}
				anchorX="center"
				anchorY="top"
				textAlign="center"
				billboard
				scale={[-1, 1, 1]}
				color={textColor}
				fillOpacity={0.85}
				outlineWidth={0.002}
				outlineColor="#ffffff"
				outlineOpacity={0.12}
			>
				{`${name}`}
			</Text>
		</group>
	);
};

export default Depot;
