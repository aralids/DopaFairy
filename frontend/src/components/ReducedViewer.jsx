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
	EDA_PATH_POINTS,
	DAT_CURVE_POINTS,
} from "../config/config";
import {
	TYR_CO,
	LDOPA_CO,
	CDA_CO,
	VDA_CO,
	EDA_CO,
	TYR_TO_LDOPA_CO,
	LDOPA_TO_CDA_CO,
	LOST_CDA_CO,
	REUPTAKEN_CO,
	CDA_TO_VDA_CO,
	DESTROYED_CO,
	LOST_EDA,
} from "../config/circadianOscillation";
import {
	TYR_SS,
	LDOPA_SS,
	CDA_SS,
	VDA_SS,
	EDA_SS,
	MIN_VALUE_SS,
	MAX_VALUE_SS,
} from "../config/steadyState";

import Depot from "./Depot";
import MoleculeMover from "./MoleculeMover";
import MoleculeMoverAlongCurve from "./MoleculeMoverAlongCurve";
import { minOf, maxOf } from "../utils/helper_functions";

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
				<Model url={modelUrl} />
				{simMode === "circadian" ? (
					<SimClockDisplay useSimTime={useSimTime} />
				) : (
					<></>
				)}
				<Depot
					name={"tyr"}
					pos={CHECKPOINT_POSITIONS[1]}
					tEvol={simMode === "steady" ? TYR_SS : TYR_CO}
					useSimTime={useSimTime}
					minGlobalValue={MIN_VALUE_SS}
					maxGlobalValue={MAX_VALUE_SS}
				/>
				<Depot
					name={"ldopa"}
					pos={CHECKPOINT_POSITIONS[2]}
					tEvol={simMode === "steady" ? LDOPA_SS : LDOPA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(LDOPA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(LDOPA_CO)}
				/>
				<Depot
					name={"cda"}
					pos={CHECKPOINT_POSITIONS[3]}
					tEvol={simMode === "steady" ? CDA_SS : CDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(CDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(CDA_CO)}
				/>
				<Depot
					name={"vda"}
					pos={CHECKPOINT_POSITIONS[4]}
					tEvol={simMode === "steady" ? VDA_SS : VDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
				/>
				<Depot
					name={"eda"}
					pos={CHECKPOINT_POSITIONS[5]}
					tEvol={simMode === "steady" ? EDA_SS : EDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(EDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(EDA_CO)}
				/>
				<MoleculeMover
					name={"btyr"}
					pos={[CHECKPOINT_POSITIONS[0], CHECKPOINT_POSITIONS[1]]}
					tEvol={LDOPA_TO_CDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : 0}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : 126}
				/>
				<MoleculeMover
					name={"tyr"}
					pos={[CHECKPOINT_POSITIONS[1], CHECKPOINT_POSITIONS[2]]}
					tEvol={LDOPA_TO_CDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : 0}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : 126}
				/>
				<MoleculeMover
					name={"ldopa"}
					pos={[CHECKPOINT_POSITIONS[2], CHECKPOINT_POSITIONS[3]]}
					tEvol={LDOPA_TO_CDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(CDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(CDA_CO)}
				/>
				<MoleculeMover
					name={"cda"}
					pos={[CHECKPOINT_POSITIONS[3], CHECKPOINT_POSITIONS[4]]}
					tEvol={CDA_TO_VDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
				/>
				<MoleculeMover
					name={"vda"}
					pos={[CHECKPOINT_POSITIONS[4], CHECKPOINT_POSITIONS[5]]}
					tEvol={VDA_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
				/>
				<MoleculeMover
					name={"eda-mao"}
					pos={[EDA_PATH_POINTS[0], EDA_PATH_POINTS[1]]}
					tEvol={DESTROYED_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
				/>
				<MoleculeMoverAlongCurve
					name={"eda-dat"}
					pos={DAT_CURVE_POINTS}
					tEvol={REUPTAKEN_CO}
					useSimTime={useSimTime}
					minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
					maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
				/>
			</SimClock>
		</Canvas>
	);
};

export default Viewer;
