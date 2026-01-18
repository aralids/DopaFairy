import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Text } from "@react-three/drei";
import { useRef, useEffect, createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import SphereMover from "./SphereMover";
import EnzymeMover from "./EnzymeMover";
import EdaMover from "./EdaMover";
import DatMover from "./DatMover";
import SimClockDisplay from "./SimClockDisplay";
// (you already import useRef/useEffect, so just add createContext/useContext/useMemo)

const REAL_SECONDS_PER_SIM_DAY = 288; // <-- pick your value
const SIM_SECONDS_PER_DAY = 24 * 60 * 60;

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

const checkpointPositions = [
	[0.550804, 1.37743, -1.07188],
	[0.330904, 1.37743, -0.555198],
	[0.148127, 1.29878, -0.225056],
	[0.019215, 1.06271, -0.028969],
	[0.000059, 0.771847, 0.001682],
	[0.000059, 0.529464, 0.001682],
];

const edaDestructionPosition = [0.113718, 0.529464, -0.248264];

function Model({ url, mode }) {
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
	const controlsRef = useRef();
	return (
		<Canvas camera={{ position: [-3, 3, 3], fov: 50 }}>
			<SimClock>
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
				<group name={`tyr-storage`} position={checkpointPositions[1]}>
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
				{...checkpointPositions.map((pos, index) =>
					index > 0 ? (
						<SphereMover
							key={`molecule-${index}`}
							p={checkpointPositions}
							offset={(index - 1) * 3.3}
						/>
					) : (
						<></>
					),
				)}
				{...checkpointPositions.map((pos, index) =>
					index > 1 && index !== 5 ? (
						<EnzymeMover
							key={`enzyme-${index}`}
							p0={[pos[0], pos[1] + 0.03, pos[2]]}
							p1={[pos[0], pos[1], pos[2]]}
							p2={[pos[0], pos[1] + 0.03, pos[2]]}
							offset={1.3}
						/>
					) : (
						<></>
					),
				)}
				<EdaMover p={[checkpointPositions[5], edaDestructionPosition]} />
				<DatMover />
				<Model url={modelUrl} mode={mode} />
				<SimClockDisplay
					useSimTime={useSimTime}
					SIM_SECONDS_PER_DAY={SIM_SECONDS_PER_DAY}
				/>
			</SimClock>
		</Canvas>
	);
};

export default Viewer;
