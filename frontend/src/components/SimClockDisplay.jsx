import { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

function SimClockDisplay({
	position = [0, 0, 0], // ignored when overlay=true
	overlay = true,
	useSimTime,
	SIM_SECONDS_PER_DAY,
}) {
	const { simTime, speed } = useSimTime();
	const [label, setLabel] = useState("Day 0 00:00:00");

	useFrame(() => {
		const t = simTime.current; // sim-seconds
		const day = Math.floor(t / SIM_SECONDS_PER_DAY);
		const secOfDay =
			((t % SIM_SECONDS_PER_DAY) + SIM_SECONDS_PER_DAY) % SIM_SECONDS_PER_DAY;

		const hh = Math.floor(secOfDay / 3600);
		const mm = Math.floor((secOfDay % 3600) / 60);
		const ss = Math.floor(secOfDay % 60);

		const pad = (n) => String(n).padStart(2, "0");
		setLabel(
			`Day ${day} ${pad(hh)}:${pad(mm)}:${pad(ss)}  (x${speed.toFixed(1)})`,
		);
	});

	const style = {
		fontFamily: "monospace",
		fontSize: 14,
		padding: "8px 10px",
		borderRadius: 8,
		background: "rgba(0,0,0,0.55)",
		color: "white",
		userSelect: "none",
	};

	// Overlay HUD (top-left)
	if (overlay) {
		return (
			<Html fullscreen>
				<div style={{ position: "absolute", top: 12, left: 12, ...style }}>
					{label}
				</div>
			</Html>
		);
	}

	// In-world label
	return (
		<group position={position}>
			<Html center>
				<div style={style}>{label}</div>
			</Html>
		</group>
	);
}

export default SimClockDisplay;
