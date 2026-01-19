import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	EDA_PATH_POINTS,
	K_EDA,
	MIN_DESTROYED_AMOUNT,
	MAX_DESTROYED_AMOUNT,
	MIN_SPHERE_SIZE,
	MAX_SPHERE_SIZE,
} from "../config/config";
import { DESTROYED_SS, VDA_SS } from "../config/steadyState";
import { DESTROYED_CO, VDA_CO } from "../config/circadianOscillation";

function EdaMover({ label: _label = "223 mM", useSimTime, simMode }) {
	const destroyed = simMode === "steady" ? DESTROYED_SS : DESTROYED_CO;
	const vda = simMode === "steady" ? VDA_SS : VDA_CO;

	const p = EDA_PATH_POINTS;

	const offset = 5 * (MOVE_DURATION_IN_SIM_SEC + PAUSE_DURATION_IN_SIM_SEC);

	const p0 = p[0];
	const p1 = p[1];

	const moveDuration = MOVE_DURATION_IN_SIM_SEC;
	const pauseDuration = PAUSE_DURATION_IN_SIM_SEC;

	const ref = useRef();
	const meshRef = useRef(); // ✅ NEW
	const { simTime } = useSimTime();

	const [label, setLabel] = useState("");
	const lastLabelKey = useRef(null);

	const v0 = useRef(new THREE.Vector3(...p0));
	const v1 = useRef(new THREE.Vector3(...p1));

	const cycle = moveDuration + pauseDuration;

	// ✅ NEW: helpers for size mapping
	const clamp01 = (x) => Math.max(0, Math.min(1, x));
	const amountToRadius = (amount) => {
		const a = Number(amount);
		if (!Number.isFinite(a)) return MIN_SPHERE_SIZE;
		const denom = MAX_DESTROYED_AMOUNT - MIN_DESTROYED_AMOUNT;
		if (!Number.isFinite(denom) || denom === 0) return MIN_SPHERE_SIZE;
		const t = clamp01((a - MIN_DESTROYED_AMOUNT) / denom);
		return MIN_SPHERE_SIZE + t * (MAX_SPHERE_SIZE - MIN_SPHERE_SIZE);
	};

	useFrame(() => {
		if (!ref.current) return;

		const globalT = simTime.current + offset;
		const localT = ((globalT % cycle) + cycle) % cycle;

		// ✅ advance once per cycle, starting at destroyed[5]
		const k = Math.floor(globalT / cycle);
		const idx = 5 + k;

		// amounts
		const A0 =
			idx >= 0 && idx < (destroyed?.length ?? 0) ? Number(destroyed[idx]) : NaN;

		const VDA = idx >= 0 && idx < (vda?.length ?? 0) ? Number(vda[idx]) : NaN;

		const A1 =
			Number.isFinite(A0) && Number.isFinite(VDA) ? A0 - K_EDA * VDA : NaN;

		// interpolate during travel, hold during pause
		let A = A0;
		if (localT < moveDuration) {
			const uAmt = moveDuration > 0 ? localT / moveDuration : 1;
			if (Number.isFinite(A0) && Number.isFinite(A1)) {
				A = A0 + (A1 - A0) * uAmt;
			}
		} else {
			A = A1;
		}

		// ✅ label changes accordingly (x.xxx)
		const nextLabel = Number.isFinite(A) ? A.toFixed(3) : "";
		const key = `${k}:${idx}:${nextLabel}`;
		if (lastLabelKey.current !== key) {
			lastLabelKey.current = key;
			setLabel(nextLabel);
		}

		// ✅ size follows A
		const radius = amountToRadius(A);
		if (meshRef.current) {
			const baseGeomRadius = 0.015;
			const s = baseGeomRadius > 0 ? radius / baseGeomRadius : 1;
			meshRef.current.scale.setScalar(s);
		}

		// move, then pause at end
		if (localT < moveDuration) {
			const u = localT / moveDuration;
			ref.current.position.lerpVectors(v0.current, v1.current, u);
		} else {
			ref.current.position.copy(v1.current);
		}
	});

	return (
		<group ref={ref} name={`Sphere${offset}`} position={p0}>
			<mesh ref={meshRef} name={`Sphere${offset}`}>
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
				{label === "" ? "" : `${label}mM`}
			</Text>
		</group>
	);
}

export default EdaMover;
