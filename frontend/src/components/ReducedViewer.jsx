import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Text } from "@react-three/drei";
import { useRef, useEffect, createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import SphereMover from "./SphereMover";
import EnzymeMover from "./EnzymeMover";
import EdaMover from "./EdaMover";
import DatMover from "./DatMover";
import SimClockDisplay from "./SimClockDisplay";
import {
	REAL_SECONDS_PER_SIM_DAY,
	SIM_SECONDS_PER_DAY,
	CHECKPOINT_POSITIONS,
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
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

function Model({ url }) {
	const { scene, nodes } = useGLTF(url);
	useEffect(() => {
		const presynapse = nodes.Presynapse;
		if (!presynapse) return;

		// 1️⃣ Clone the material so it's NOT shared
		const transparentMat = presynapse.material.clone();

		// 2️⃣ Make ONLY this material transparent
		transparentMat.transparent = true;
		transparentMat.opacity = 0.3;

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

						const cam = controls.object;
						const t = controls.target;

						// console.log("cameraPos:", [cam.position.x, cam.position.y, cam.position.z]);
						// console.log("cameraTarget:", [t.x, t.y, t.z]);
					}}
				/>
				<group name={`tyr-storage`} position={CHECKPOINT_POSITIONS[1]}>
					<mesh name={`tyr-storage`}>
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
						{"tyr"}
					</Text>
				</group>
				{...CHECKPOINT_POSITIONS.map((pos, index) =>
					index > 0 ? (
						<SphereMover
							key={`molecule-${index}`}
							index={index}
							offset={
								(index - 1) *
								(MOVE_DURATION_IN_SIM_SEC + PAUSE_DURATION_IN_SIM_SEC)
							}
							useSimTime={useSimTime}
							simMode={simMode}
						/>
					) : (
						<></>
					),
				)}
				{...CHECKPOINT_POSITIONS.map((pos, index) =>
					index > 1 && index !== 5 ? (
						<EnzymeMover
							key={`enzyme-${index}`}
							p0={[pos[0], pos[1] + 0.03, pos[2]]}
							p1={[pos[0], pos[1], pos[2]]}
							p2={[pos[0], pos[1] + 0.03, pos[2]]}
							useSimTime={useSimTime}
						/>
					) : (
						<></>
					),
				)}
				<EdaMover useSimTime={useSimTime} simMode={simMode} />
				<DatMover useSimTime={useSimTime} simMode={simMode} />
				<Model url={modelUrl} />
				{simMode === "circadian" ? (
					<SimClockDisplay useSimTime={useSimTime} />
				) : (
					<></>
				)}
			</SimClock>
		</Canvas>
	);
};

export default Viewer;
