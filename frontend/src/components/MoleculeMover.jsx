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
	tEvolDrug = null, // ✅ NEW: optional drug track (finite)
	useSimTime,
	minGlobalValue,
	maxGlobalValue,
	moveDuration = MOVE_DURATION_IN_SIM_SEC,
	pauseDuration = PAUSE_DURATION_IN_SIM_SEC,
	offset = 0,
}) => {
	// ✅ baseline sizes (loop forever)
	let sizesBase = useMemo(
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

	sizesBase = Array(tEvol.length).fill(MIN_SPHERE_SIZE);

	// ✅ drug sizes (play once, then stop using)
	let sizesDrug = useMemo(
		() =>
			tEvolDrug
				? mapValuesToSizes(
						tEvolDrug,
						MIN_SPHERE_SIZE,
						MAX_SPHERE_SIZE,
						minGlobalValue,
						maxGlobalValue,
					)
				: null,
		[tEvolDrug, minGlobalValue, maxGlobalValue],
	);
	sizesDrug = Array(tEvol.length).fill(MIN_SPHERE_SIZE);

	// ⚠️ You had this line forcing everything to MIN_SPHERE_SIZE.
	// That would make BOTH baseline + drug invisible. Removed.
	// sizes = Array(tEvol.length).fill(MIN_SPHERE_SIZE);

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

		const nBase = sizesBase?.length ?? 0;
		if (nBase === 0) return;

		const nDrug = sizesDrug?.length ?? 0;

		// global step index (same clock for everyone)
		const step = Math.floor(t / cycle);

		// ============================================================
		// ======================= SIZE SNAP ==========================
		// Drug: finite, no wrap
		// Baseline: loops forever after drug ends
		// ============================================================
		let size;

		if (sizesDrug && step < nDrug) {
			// drug phase: no modulo (finite)
			size = sizesDrug[step];
		} else {
			// baseline phase: loop with modulo
			const baseStep = sizesDrug ? step - nDrug : step;
			const idx = ((baseStep % nBase) + nBase) % nBase;
			size = sizesBase[idx];
		}

		meshRef.current.scale.setScalar(size);
		// ============================================================

		// movement (unchanged)
		if (localT < moveDuration) {
			const u = moveDuration > 0 ? localT / moveDuration : 1;
			groupRef.current.position.lerpVectors(v0.current, v1.current, u);
		} else {
			groupRef.current.position.copy(v1.current);
		}
	});

	return (
		<group ref={groupRef} name={`${name}-depot`} position={pos[0]}>
			<mesh ref={meshRef} scale={sizesBase?.[0] ?? 1}>
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
