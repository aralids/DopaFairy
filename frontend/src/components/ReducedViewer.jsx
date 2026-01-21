import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useRef, useEffect, createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import Enzymes from "./Enzymes";
import Molecules from "./Molecules";
import Depots from "./Depots";
import SimClockDisplay from "./SimClockDisplay";
import {
	REAL_SECONDS_PER_SIM_DAY,
	SIM_SECONDS_PER_DAY,
} from "../config/config";

// shared clock context
const SimClockContext = createContext({ simTime: { current: 0 }, speed: 1 });

export function useSimTime() {
	return useContext(SimClockContext);
}

function SimClock({ children }) {
	const simTime = useRef(0);

	// sim-seconds per real-second
	const speed = useMemo(
		() => SIM_SECONDS_PER_DAY / REAL_SECONDS_PER_SIM_DAY,
		[],
	);

	useFrame((_, delta) => {
		simTime.current += delta * speed;
	});

	// provide a stable object so consumers can read simTime.current
	const value = useMemo(() => ({ simTime, speed }), [speed]);

	return (
		<SimClockContext.Provider value={value}>
			{children}
		</SimClockContext.Provider>
	);
}

function Model({ url, presynapseOpacity }) {
	const { scene, nodes } = useGLTF(url);
	useEffect(() => {
		const presynapse = nodes.Presynapse;
		if (!presynapse) return;

		// 1️⃣ Clone the material so it's NOT shared
		const transparentMat = presynapse.material.clone();

		// 2️⃣ Make ONLY this material transparent
		transparentMat.transparent = true;
		transparentMat.opacity = presynapseOpacity;

		// 3️⃣ Important transparency fix
		transparentMat.depthWrite = false;

		// (optional but often helps)
		transparentMat.side = THREE.DoubleSide;

		// 4️⃣ Assign it back ONLY to the presynapse
		presynapse.material = transparentMat;
	}, [nodes]);

	return <primitive object={scene} />;
}

function CameraController({ position, target, enabled, resetId }) {
	const { camera } = useThree();
	const desiredPos = useRef(new THREE.Vector3());
	const desiredTarget = useRef(new THREE.Vector3());

	useEffect(() => {
		if (!enabled) return;

		desiredPos.current.copy(camera.position);
		desiredTarget.current.set(...target);
	}, [enabled, resetId]);

	useFrame((_, delta) => {
		if (!enabled) return;

		const lerpFactor = 1 - Math.exp(-delta * 2);

		desiredPos.current.set(...position);
		desiredTarget.current.set(...target);

		camera.position.lerp(desiredPos.current, lerpFactor);
		camera.lookAt(desiredTarget.current);
	});
}

const Viewer = ({
	modelUrl,
	cameraPos,
	cameraTarget,
	autoCamera,
	setAutoCamera,
	cameraResetId,
	simMode,
	presynapseOpacity,
}) => {
	const controlsRef = useRef();

	return (
		<Canvas camera={{ position: [-3, 3, 3], fov: 50 }}>
			<SimClock key={simMode}>
				<CameraController
					position={cameraPos}
					target={cameraTarget}
					enabled={autoCamera}
					resetId={cameraResetId}
				/>
				<ambientLight intensity={1.2} />
				<directionalLight position={[5, 5, 5]} intensity={2} />
				<Environment preset="sunset" />
				<OrbitControls
					ref={controlsRef}
					enableDamping
					enablePan
					screenSpacePanning
					onStart={() => setAutoCamera(false)}
					onEnd={() => {
						const controls = controlsRef.current;
						if (!controls) return;

						setTimeout(() => {
							const cam = controls.object;
							const t = controls.target;

							console.log("cameraPos:", cam.position.toArray());
							console.log("cameraTarget:", t.toArray());
						}, 200); // 150–300ms is perfect
					}}
				/>
				<Model
					url={modelUrl}
					presynapseOpacity={presynapseOpacity}
					key={presynapseOpacity}
				/>
				{simMode === "circadian" ? (
					<SimClockDisplay useSimTime={useSimTime} />
				) : (
					<></>
				)}
				<Depots simMode={simMode} useSimTime={useSimTime} />
				<Molecules simMode={simMode} useSimTime={useSimTime} />
				<Enzymes useSimTime={useSimTime} />
			</SimClock>
		</Canvas>
	);
};

export default Viewer;
