import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	DAT_CURVE_POINTS,
} from "../config/config";

function DatMover({ label = "223 mM", useSimTime }) {
	const p = DAT_CURVE_POINTS;
	const offset = 0;
	const moveDuration = MOVE_DURATION_IN_SIM_SEC;
	const endPause = PAUSE_DURATION_IN_SIM_SEC;

	const ref = useRef();
	const { simTime } = useSimTime(); // ✅ NEW

	const path = useMemo(() => {
		const pts = p.map((pt) => new THREE.Vector3(...pt));
		const n = Math.max(0, pts.length - 1);

		if (n === 0) return { pts, segTimes: [], segEndTimes: [], totalLen: 0 };

		const segLens = new Array(n);
		let totalLen = 0;
		for (let i = 0; i < n; i++) {
			const len = pts[i].distanceTo(pts[i + 1]);
			segLens[i] = len;
			totalLen += len;
		}

		const segTimes = new Array(n);
		if (totalLen === 0) {
			for (let i = 0; i < n; i++) segTimes[i] = moveDuration / n;
		} else {
			for (let i = 0; i < n; i++)
				segTimes[i] = (segLens[i] / totalLen) * moveDuration;
		}

		const segEndTimes = new Array(n);
		let acc = 0;
		for (let i = 0; i < n; i++) {
			acc += segTimes[i];
			segEndTimes[i] = acc;
		}
		segEndTimes[n - 1] = moveDuration;

		return { pts, segTimes, segEndTimes, totalLen };
	}, [p, moveDuration]);

	const cycle = moveDuration + endPause;

	useFrame(() => {
		const obj = ref.current;
		if (!obj) return;

		const { pts, segTimes, segEndTimes } = path;
		const n = pts.length - 1;

		if (pts.length <= 1 || n <= 0) {
			obj.position.copy(pts[0] ?? new THREE.Vector3());
			return;
		}

		const t = simTime.current + offset; // ✅ SIM TIME
		const localT = ((t % cycle) + cycle) % cycle;

		if (localT >= moveDuration) {
			obj.position.copy(pts[pts.length - 1]);
			return;
		}

		let i = 0;
		while (i < n - 1 && localT > segEndTimes[i]) i++;

		const segEnd = segEndTimes[i];
		const segStart = i === 0 ? 0 : segEndTimes[i - 1];
		const segLenT = Math.max(1e-9, segTimes[i]);

		const u = (localT - segStart) / segLenT;
		obj.position.lerpVectors(pts[i], pts[i + 1], u);
	});

	const start = path.pts[0] ?? new THREE.Vector3();

	return (
		<group ref={ref} name="DatMover" position={start}>
			<mesh>
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

export default DatMover;
