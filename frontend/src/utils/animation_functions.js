import * as THREE from "three";

export function clamp01(x) {
	return Math.min(1, Math.max(0, x));
}

// Hold v0 for holdSec, then interpolate to v1 over lerpSec
export function holdThenLerp(t, holdSec, lerpSec, v0, v1) {
	if (t <= holdSec) return v0;
	const u = (t - holdSec) / Math.max(lerpSec, 1e-9);
	return v0 + (v1 - v0) * clamp01(u);
}

// Useful for looping arrays like sizes[i] -> sizes[i+1]
export function loopStepInfo(t, cycleSec, n) {
	// returns { step, phase, i, j }
	const step = Math.floor(t / cycleSec);
	const phase = t - step * cycleSec;

	const i = ((step % n) + n) % n;
	const j = (i + 1) % n;

	return { step, phase, i, j };
}

export function sampleScalarTrack({
	t, // current time (sim seconds)
	values, // array of scalar values: [s0, s1, s2...]
	holdSec, // how long to stay at value[i]
	lerpSec, // how long to interpolate to value[i+1]
}) {
	const n = values?.length ?? 0;
	if (n === 0) return 0;
	if (n === 1) return values[0];

	const cycleSec = holdSec + lerpSec;
	const { phase, i, j } = loopStepInfo(t, cycleSec, n);

	return holdThenLerp(phase, holdSec, lerpSec, values[i], values[j]);
}
