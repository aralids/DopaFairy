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

const MoleculeMoverAlongCurve = ({
	name,
	pos = [], // array of points: [[x,y,z], [x,y,z], ...]
	tEvol = [],
	tEvolDrug, // ✅ optional
	useSimTime,
	minGlobalValue,
	maxGlobalValue,
	moveDuration = MOVE_DURATION_IN_SIM_SEC,
	pauseDuration = PAUSE_DURATION_IN_SIM_SEC,
	offset = 0,
}) => {
	// base sizes
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

	// drug sizes (only if provided)
	let sizesDrug = useMemo(() => {
		if (!Array.isArray(tEvolDrug) || tEvolDrug.length === 0) return [];
		return mapValuesToSizes(
			tEvolDrug,
			MIN_SPHERE_SIZE,
			MAX_SPHERE_SIZE,
			minGlobalValue,
			maxGlobalValue,
		);
	}, [tEvolDrug, minGlobalValue, maxGlobalValue]);
	sizesDrug = Array(tEvol.length).fill(MIN_SPHERE_SIZE);

	const hasDrug = sizesDrug.length > 0;

	const groupRef = useRef();
	const meshRef = useRef();

	const { simTime } = useSimTime();

	// Precompute vectors for points
	const points = useMemo(() => {
		if (!Array.isArray(pos) || pos.length < 2) return [];
		return pos.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
	}, [pos]);

	// Precompute segment lengths + total length (for constant speed along polyline)
	const { segLens, cumLens, totalLen } = useMemo(() => {
		const n = points.length;
		if (n < 2) return { segLens: [], cumLens: [0], totalLen: 0 };

		const seg = [];
		const cum = [0];
		let tot = 0;

		for (let i = 0; i < n - 1; i++) {
			const L = points[i].distanceTo(points[i + 1]);
			seg.push(L);
			tot += L;
			cum.push(tot);
		}

		return { segLens: seg, cumLens: cum, totalLen: tot };
	}, [points]);

	const cycle = moveDuration + pauseDuration;

	// temp refs to avoid allocations in useFrame
	const tmp = useRef(new THREE.Vector3());

	useFrame(() => {
		if (!groupRef.current || !meshRef.current) return;
		if (!points || points.length < 2) return;

		const t = simTime.current + offset;
		const localT = ((t % cycle) + cycle) % cycle;

		// global step counter (how many cycles have passed)
		const globalStep = Math.floor(t / cycle);

		// ✅ choose active track:
		// - first play drug track ONCE (0..sizesDrug.length-1)
		// - then loop base track forever
		let activeSizes = sizesBase;
		let idx = 0;

		if (hasDrug && globalStep < sizesDrug.length) {
			activeSizes = sizesDrug;
			idx = globalStep; // play once, no wrap
		} else {
			const baseN = sizesBase.length;
			if (baseN === 0) return;

			const baseStep = globalStep - (hasDrug ? sizesDrug.length : 0);
			idx = ((baseStep % baseN) + baseN) % baseN; // wrap base forever
		}

		meshRef.current.scale.setScalar(activeSizes[idx]);

		// movement along full polyline during moveDuration
		if (localT < moveDuration && totalLen > 0) {
			const u = moveDuration > 0 ? localT / moveDuration : 1; // 0..1
			const dist = u * totalLen;

			let segIdx = 0;
			while (segIdx < cumLens.length - 1 && dist > cumLens[segIdx + 1]) {
				segIdx++;
			}
			segIdx = Math.min(segIdx, points.length - 2);

			const segStart = cumLens[segIdx];
			const segEnd = cumLens[segIdx + 1];
			const segLen = segEnd - segStart;

			const segU = segLen > 0 ? (dist - segStart) / segLen : 1;

			tmp.current.lerpVectors(points[segIdx], points[segIdx + 1], segU);
			groupRef.current.position.copy(tmp.current);
		} else {
			groupRef.current.position.copy(points[points.length - 1]);
		}
	});

	// initial position
	const initialPos = pos?.[0] ?? [0, 0, 0];

	// ✅ initial scale: if we have drug, start from drug[0], else base[0]
	const initialScale = hasDrug ? (sizesDrug?.[0] ?? 1) : (sizesBase?.[0] ?? 1);

	return (
		<group ref={groupRef} name={`${name}-molecule`} position={initialPos}>
			<mesh ref={meshRef} scale={initialScale}>
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

export default MoleculeMoverAlongCurve;
