import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function DatMover({
	p = [
		[0.000059, 0.529464, 0.001682],
		[-0.040968, 0.549783, 0.135849],
		[-0.068187, 0.639589, 0.240136],
		[-0.101567, 0.897333, 0.258814],
		[-0.041837, 1.03926, 0.10928],
		[0.019215, 1.06271, -0.028969],
	],
	offsetSeconds = 0,
	label = "223 mM",
	moveDuration = 3, // TOTAL time p[0] -> p[last]
	endPause = 0.3,
}) {
	const ref = useRef();

	const path = useMemo(() => {
		const pts = p.map((pt) => new THREE.Vector3(...pt));
		const n = Math.max(0, pts.length - 1);

		if (n === 0) return { pts, segTimes: [], segEndTimes: [], totalLen: 0 };

		// segment lengths
		const segLens = new Array(n);
		let totalLen = 0;
		for (let i = 0; i < n; i++) {
			const len = pts[i].distanceTo(pts[i + 1]);
			segLens[i] = len;
			totalLen += len;
		}

		// segment times proportional to length; sum == moveDuration
		const segTimes = new Array(n);
		if (totalLen === 0) {
			// all points identical: avoid NaNs
			for (let i = 0; i < n; i++) segTimes[i] = moveDuration / n;
		} else {
			for (let i = 0; i < n; i++)
				segTimes[i] = (segLens[i] / totalLen) * moveDuration;
		}

		// cumulative end times per segment: [tEnd0, tEnd1, ...] where last == moveDuration
		const segEndTimes = new Array(n);
		let acc = 0;
		for (let i = 0; i < n; i++) {
			acc += segTimes[i];
			segEndTimes[i] = acc;
		}
		// force exact end to be moveDuration (avoids floating drift)
		segEndTimes[n - 1] = moveDuration;

		return { pts, segTimes, segEndTimes, totalLen };
	}, [p, moveDuration]);

	const cycle = moveDuration + endPause;

	useFrame((state) => {
		const obj = ref.current;
		if (!obj) return;

		const { pts, segTimes, segEndTimes } = path;
		const n = pts.length - 1;

		if (pts.length <= 1 || n <= 0) {
			obj.position.copy(pts[0] ?? new THREE.Vector3());
			return;
		}

		const t = state.clock.getElapsedTime() + offsetSeconds;
		const localT = ((t % cycle) + cycle) % cycle;

		// pause at end (and also snap to end exactly)
		if (localT >= moveDuration) {
			obj.position.copy(pts[pts.length - 1]);
			return;
		}

		// find active segment by time
		let i = 0;
		while (i < n - 1 && localT > segEndTimes[i]) i++;

		const segEnd = segEndTimes[i];
		const segStart = i === 0 ? 0 : segEndTimes[i - 1];
		const segLenT = Math.max(1e-9, segTimes[i]); // prevent divide by zero

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
