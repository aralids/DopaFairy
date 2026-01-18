import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

function Model({ url, mode }) {
	const { scene } = useGLTF(url);
	const ref = useRef();

	useFrame((state, delta) => {
		const FREQUENCY = 2; // was 2
		const AMPLITUDE = 1;
		const SMOOTHNESS = 1; // inertia

		const t = state.clock.getElapsedTime();
		const lerpFactor = 1 - Math.exp(-delta * SMOOTHNESS);

		const targetX = mode === "side" ? Math.sin(t * FREQUENCY) * AMPLITUDE : 0;
		const targetY = mode === "bounce" ? Math.sin(t * FREQUENCY) * AMPLITUDE : 0;

		ref.current.position.x += (targetX - ref.current.position.x) * lerpFactor;
		ref.current.position.y += (targetY - ref.current.position.y) * lerpFactor;
	});

	return <primitive ref={ref} object={scene} />;
}

function CameraController({ position, target, enabled, resetId }) {
	const { camera } = useThree();
	const desiredPos = useRef(new THREE.Vector3());
	const desiredTarget = useRef(new THREE.Vector3());

	// 🔑 Reset desired state when auto-camera resumes
	useEffect(() => {
		if (!enabled) return;

		desiredPos.current.copy(camera.position);
		desiredTarget.current.set(...target);
	}, [enabled, resetId]);

	useFrame((_, delta) => {
		if (!enabled) return; // 🔑 THIS IS THE KEY

		const lerpFactor = 1 - Math.exp(-delta * 2);

		desiredPos.current.set(...position);
		desiredTarget.current.set(...target);

		camera.position.lerp(desiredPos.current, lerpFactor);
		camera.lookAt(desiredTarget.current);
	});
}

const Viewer = ({
	modelUrl,
	mode,
	cameraPos,
	cameraTarget,
	autoCamera,
	setAutoCamera,
	cameraResetId,
}) => {
	return (
		<Canvas camera={{ position: [3, 3, 3], fov: 50 }}>
			<CameraController
				position={cameraPos}
				target={cameraTarget}
				enabled={autoCamera}
				resetId={cameraResetId}
			/>
			<ambientLight intensity={1.2} />
			<directionalLight position={[5, 5, 5]} intensity={2} />
			<Environment preset="sunset" />
			<OrbitControls enableDamping onStart={() => setAutoCamera(false)} />
			<Model url={modelUrl} mode={mode} />
		</Canvas>
	);
};

export default Viewer;
