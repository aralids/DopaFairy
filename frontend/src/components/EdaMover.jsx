import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function EdaMover({ p, offset = 0, label = "223 mM" }) {
	const p0 = p[0];
	const p1 = p[1];

	const pause1 = 0;
	const move1 = 3;
	const pause2 = 0.3;

	const beat = move1 + pause2; // ✅ same unit as your other movers (3.3)
	const syncedOffset = offset * beat; // ✅ offset is now in "beats"

	const ref = useRef();

	const v0 = useRef(new THREE.Vector3(...p0));
	const v1 = useRef(new THREE.Vector3(...p1));

	const t1 = pause1;
	const t2 = t1 + move1;
	const t3 = t2 + pause2;
	const cycle = t3;

	useFrame((state) => {
		if (!ref.current) return;

		const globalT = state.clock.getElapsedTime() + syncedOffset; // ✅ change here
		const localT = ((globalT % cycle) + cycle) % cycle;

		if (localT < t1) {
			ref.current.position.copy(v0.current);
			return;
		}

		if (localT < t2) {
			const u = (localT - t1) / move1;
			ref.current.position.lerpVectors(v0.current, v1.current, u);
			return;
		}

		ref.current.position.copy(v1.current);
	});

	return (
		<group ref={ref} name={`Sphere${offset}`} position={p0}>
			<mesh name={`Sphere${offset}`}>
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

export default EdaMover;
