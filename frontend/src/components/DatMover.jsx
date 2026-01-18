import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function DatMover({
	p = [
		[0.000059, 0.529464, 0.001682],
		[-0.040968, 0.549783, 0.135849],
		[-0.068187, 0.639589, 0.240136],
		[-0.101567, 0.897333, 0.258814],
		[-0.041837, 1.03926, 0.10928],
		[0.019215, 1.06271, -0.028969],
	],
	offset = 0,
	label = "223 mM",
	moveDuration = 3 / (p.length - 1),
	pauseDuration = 0,
	endPauseDuration = 0.3, // ✅ added
}) {
	const ref = useRef();

	const points = useMemo(() => p.map((pt) => new THREE.Vector3(...pt)), [p]);

	const segCount = Math.max(0, points.length - 1);
	const segDuration = moveDuration + pauseDuration;

	const movePhase = segCount * segDuration; // ✅ time for all segments
	const cycle = movePhase + endPauseDuration; // ✅ include end pause

	useFrame((state) => {
		if (!ref.current) return;
		if (points.length === 0) return;
		if (points.length === 1 || segCount === 0 || cycle === 0) {
			ref.current.position.copy(points[0]);
			return;
		}

		const globalT = state.clock.getElapsedTime() + offset;
		const localT = ((globalT % cycle) + cycle) % cycle;

		// ✅ final pause at last point
		if (localT >= movePhase) {
			ref.current.position.copy(points[points.length - 1]);
			return;
		}

		const segIndex = Math.floor(localT / segDuration);
		const segT = localT - segIndex * segDuration;

		const a = points[segIndex];
		const b = points[segIndex + 1];

		if (segT < moveDuration) {
			const u = segT / moveDuration;
			ref.current.position.lerpVectors(a, b, u);
		} else {
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

export default DatMover;
