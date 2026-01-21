import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SIM_SECONDS_PER_DAY } from "../config/config";

function clamp01(x) {
	return Math.max(0, Math.min(1, x));
}

// smoothstep-ish
function smooth01(x) {
	x = clamp01(x);
	return x * x * (3 - 2 * x);
}

export default function CircadianLights({ useSimTime }) {
	const { simTime } = useSimTime();

	const dirRef = useRef();
	const ambRef = useRef();

	// Reusable colors (no allocations each frame)
	const nightColor = useRef(new THREE.Color("#0b1020")); // deep blue
	const dayColor = useRef(new THREE.Color("#ffffff")); // neutral day

	useFrame(() => {
		const t = simTime.current;
		const phase =
			((t % SIM_SECONDS_PER_DAY) + SIM_SECONDS_PER_DAY) / SIM_SECONDS_PER_DAY; // 0..1

		// Daylight curve: bright around noon, dark at midnight
		// cos gives 1 at midnight -> we invert it
		const daylightRaw = 0.5 - 0.5 * Math.cos(2 * Math.PI * phase); // 0..1
		const daylight = smooth01(daylightRaw);

		if (ambRef.current) {
			ambRef.current.intensity = 0.2 + 1.0 * daylight;
			ambRef.current.color
				.copy(nightColor.current)
				.lerp(dayColor.current, daylight);
		}

		if (dirRef.current) {
			dirRef.current.intensity = 0.3 + 2.2 * daylight;
			dirRef.current.color
				.copy(nightColor.current)
				.lerp(dayColor.current, daylight);

			// Optional: move "sun" around a bit
			dirRef.current.position.set(
				5 * Math.cos(2 * Math.PI * phase),
				5,
				5 * Math.sin(2 * Math.PI * phase),
			);
		}
	});

	return (
		<>
			<ambientLight ref={ambRef} />
			<directionalLight ref={dirRef} />
		</>
	);
}
