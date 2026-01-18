import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function EnzymeMover({
	p0,
	p1,
	p2,
	moveDuration = 1.5,
	pauseDuration = 0.3,
	offset = 1.5,
}) {
	const move1 = moveDuration;
	const pause = pauseDuration;
	const move2 = moveDuration;

	const ref = useRef();

	const v0 = useRef(new THREE.Vector3(...p0));
	const v1 = useRef(new THREE.Vector3(...p1));
	const v2 = useRef(new THREE.Vector3(...p2));

	const cycle = move1 + pause + move2;

	useFrame((state) => {
		if (!ref.current) return;

		const globalT = state.clock.getElapsedTime() + offset;
		const localT = ((globalT % cycle) + cycle) % cycle; // safe modulo

		if (localT < move1) {
			// p0 -> p1
			const u = localT / move1; // 0..1 in exactly 3s
			ref.current.position.lerpVectors(v0.current, v1.current, u);
			return;
		}

		if (localT < move1 + pause) {
			// hold at p1
			ref.current.position.copy(v1.current);
			return;
		}

		// p1 -> p2
		const u = (localT - move1 - pause) / move2; // 0..1 in exactly 3s
		ref.current.position.lerpVectors(v1.current, v2.current, u);
	});

	return (
		<mesh ref={ref} name="TH" position={p0}>
			<boxGeometry args={[0.03, 0.03, 0.03]} />
			<meshStandardMaterial color="#7CFFCB" /> {/* minty dopamine vibe */}
		</mesh>
	);
}

export default EnzymeMover;
