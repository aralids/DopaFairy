import {
	SIM_SECONDS_PER_DAY,
	REAL_SECONDS_PER_SIM_DAY,
} from "../config/config";

export const realSec2SimSec = (sec) => {
	return sec * (SIM_SECONDS_PER_DAY / REAL_SECONDS_PER_SIM_DAY);
};

export function downsampleByNearestMultiple(data, period, tMax = null) {
	const t = data?.t ?? [];
	if (!Array.isArray(t) || t.length === 0) return data;

	const maxT = tMax ?? t[t.length - 1];

	// Build target times: 0, period, 2*period, ...
	const targets = [];
	for (let x = 0; x <= maxT + 1e-12; x += period) targets.push(x);

	// For each target, find closest index in t (monotone scan)
	const keepIdx = [];
	let i = 0;

	for (const target of targets) {
		while (i + 1 < t.length && t[i + 1] < target) i++;

		// choose closer of i and i+1
		let best = i;
		if (i + 1 < t.length) {
			const d0 = Math.abs(t[i] - target);
			const d1 = Math.abs(t[i + 1] - target);
			best = d1 < d0 ? i + 1 : i;
		}

		// avoid duplicates when two targets map to same index
		if (keepIdx.length === 0 || keepIdx[keepIdx.length - 1] !== best) {
			keepIdx.push(best);
		}
	}

	const pick1D = (arr) =>
		Array.isArray(arr) ? keepIdx.map((j) => arr[j]) : arr;

	const pick2D = (arr2d) =>
		Array.isArray(arr2d)
			? arr2d.map((series) =>
					Array.isArray(series) ? keepIdx.map((j) => series[j]) : series,
				)
			: arr2d;

	console.log("y[3]: ", JSON.stringify(pick2D(data.y)[3]));

	return {
		...data,
		t: keepIdx.map((j) => t[j]),
		y: pick2D(data.y),
		x_dose: pick1D(data.x_dose),
		reuptaken: pick1D(data.reuptaken),
		destroyed: pick1D(data.destroyed),
	};
}

export function mapValuesToSizes(
	values,
	minSize,
	maxSize,
	fallback = (minSize + maxSize) / 2,
) {
	if (!values || values.length === 0) {
		return [fallback];
	}

	let minVal = Infinity;
	let maxVal = -Infinity;

	for (const v of values) {
		if (v < minVal) minVal = v;
		if (v > maxVal) maxVal = v;
	}

	// all values identical → constant size
	if (minVal === maxVal) {
		return values.map(() => fallback);
	}

	const span = maxVal - minVal;

	return values.map(
		(v) => minSize + ((v - minVal) / span) * (maxSize - minSize),
	);
}

export function formatNumber(x, decimals = 3) {
	if (!Number.isFinite(x)) return "";

	// round to fixed decimals, then strip trailing zeros and optional dot
	return x.toFixed(decimals).replace(/\.?0+$/, "");
}
