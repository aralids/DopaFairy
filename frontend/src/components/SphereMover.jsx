import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function SphereMover({ p, offset = 0, label = "223 mM" }) {
	const p0 = p[0];
	const p1 = p[1];
	const p2 = p[2];
	const p3 = p[3];
	const p4 = p[4];
	const p5 = p[5];

	const move1 = 3;
	const pause1 = 0.3;
	const move2 = 3;
	const pause2 = 0.3;
	const move3 = 3;
	const pause3 = 0.3;
	const move4 = 3;
	const pause4 = 0.3;
	const move5 = 3;
	const pause5 = 0.3;

	const ref = useRef();

	const v0 = useRef(new THREE.Vector3(...p0));
	const v1 = useRef(new THREE.Vector3(...p1));
	const v2 = useRef(new THREE.Vector3(...p2));
	const v3 = useRef(new THREE.Vector3(...p3));
	const v4 = useRef(new THREE.Vector3(...p4));
	const v5 = useRef(new THREE.Vector3(...p5));

	// ✅ Compute boundaries once (end times of each segment)
	const t1 = move1; // end move1
	const t2 = t1 + pause1; // end pause1
	const t3 = t2 + move2; // end move2
	const t4 = t3 + pause2; // end pause2
	const t5 = t4 + move3; // end move3
	const t6 = t5 + pause3; // end pause3
	const t7 = t6 + move4; // end move4
	const t8 = t7 + pause4; // end pause4
	const t9 = t8 + move5; // end move5
	const t10 = t9 + pause5; // end pause5

	const cycle = t10;

	useFrame((state) => {
		if (!ref.current) return;

		const globalT = state.clock.getElapsedTime() + offset;
		const localT = ((globalT % cycle) + cycle) % cycle;

		// move1: p0 -> p1
		if (localT < t1) {
			const u = localT / move1;
			ref.current.position.lerpVectors(v0.current, v1.current, u);
			return;
		}

		// pause1: hold at p1
		if (localT < t2) {
			ref.current.position.copy(v1.current);
			return;
		}

		// move2: p1 -> p2
		if (localT < t3) {
			const u = (localT - t2) / move2;
			ref.current.position.lerpVectors(v1.current, v2.current, u);
			return;
		}

		// pause2: hold at p2
		if (localT < t4) {
			ref.current.position.copy(v2.current);
			return;
		}

		// move3: p2 -> p3
		if (localT < t5) {
			const u = (localT - t4) / move3;
			ref.current.position.lerpVectors(v2.current, v3.current, u);
			return;
		}

		// pause3: hold at p3
		if (localT < t6) {
			ref.current.position.copy(v3.current);
			return;
		}

		// move4: p3 -> p4
		if (localT < t7) {
			const u = (localT - t6) / move4;
			ref.current.position.lerpVectors(v3.current, v4.current, u);
			return;
		}

		// pause4: hold at p4
		if (localT < t8) {
			ref.current.position.copy(v4.current);
			return;
		}

		// move5: p4 -> p5
		if (localT < t9) {
			const u = (localT - t8) / move5;
			ref.current.position.lerpVectors(v4.current, v5.current, u);
			return;
		}

		// pause5: hold at p5
		ref.current.position.copy(v5.current);
	});

	return (
		<group ref={ref} name={`Sphere${offset / 3}`} position={p0}>
			<mesh name={`Sphere${offset / 3}`}>
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
