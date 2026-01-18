import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function SphereMover({
	p,
	offset = 0,
	label = "223 mM",
	moveDuration = 3,
	pauseDuration = 0.3,
	useSimTime,
}) {
	const ref = useRef();
	const { simTime } = useSimTime(); // ✅ NEW

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

		const globalT = simTime.current + offset; // ✅ CHANGED (was state.clock...)
		const localT = ((globalT % cycle) + cycle) % cycle;

		const segIndex = Math.floor(localT / segDuration); // 0..segCount-1
		const segT = localT - segIndex * segDuration; // time within this segment

		const a = points[segIndex];
		const b = points[segIndex + 1];

		if (segT < moveDuration) {
			const u = segT / moveDuration; // 0..1
			ref.current.position.lerpVectors(a, b, u);
		} else {
			// pause: hold at the arrival point
			ref.current.position.copy(b);
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
				{label}
			</Text>
		</group>
	);
}

export default SphereMover;
