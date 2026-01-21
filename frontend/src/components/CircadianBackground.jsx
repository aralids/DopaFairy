import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import { SIM_SECONDS_PER_DAY } from "../config/config";

function CircadianBackground({ useSimTime }) {
	const { scene } = useThree();
	const { simTime } = useSimTime();

	const night = useRef(new THREE.Color("#0A1B2E"));
	const day = useRef(new THREE.Color("#FFF1C1"));

	useFrame(() => {
		const phase =
			((simTime.current % SIM_SECONDS_PER_DAY) + SIM_SECONDS_PER_DAY) /
			SIM_SECONDS_PER_DAY;
		const daylight = 0.5 - 0.5 * Math.cos(2 * Math.PI * phase);

		scene.background = night.current.clone().lerp(day.current, daylight); // (small alloc)
	});

	return null;
}

export default CircadianBackground;
