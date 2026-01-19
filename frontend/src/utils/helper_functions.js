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

	// Ensure last index is included so interval sums cover the full kept range
	if (keepIdx[keepIdx.length - 1] !== t.length - 1) {
		keepIdx.push(t.length - 1);
	}

	const pick1D_point = (arr) =>
		Array.isArray(arr) ? keepIdx.map((j) => arr[j]) : arr;

	const pick2D_point = (arr2d) =>
		Array.isArray(arr2d)
			? arr2d.map((series) =>
					Array.isArray(series) ? keepIdx.map((j) => series[j]) : series,
				)
			: arr2d;

	// Sum interval amounts between kept time indices.
	// Original interval arrays are length N-1 with semantics: amount[k] applies to [t[k], t[k+1]]
	// Downsampled interval arrays will be length keepIdx.length-1 with semantics: sum over [t[keepIdx[i]], t[keepIdx[i+1]]]
	const sumIntervals = (amountArr) => {
		if (!Array.isArray(amountArr)) return amountArr;

		const out = [];
		for (let a = 0; a < keepIdx.length - 1; a++) {
			const startIdx = keepIdx[a];
			const endIdx = keepIdx[a + 1];

			// sum amounts for intervals startIdx..endIdx-1
			let s = 0;
			for (let k = startIdx; k < endIdx; k++) {
				s += amountArr[k] ?? 0;
			}
			out.push(s);
		}
		return out;
	};

	// You may have some arrays that are point-sampled even though they're "extra"
	// For example: x_dose is typically point-sampled (length N).
	// Everything in `intervalKeys` is per-interval (length N-1) and must be summed.
	const intervalKeys = [
		"tyrToLdopa",
		"ldopaToCda",
		"lostCda",
		"reuptaken",
		"cdaToVda",
		"destroyed",
		"lostEda",
	];

	const t_ds = keepIdx.map((j) => t[j]);

	const out = {
		...data,
		t: t_ds,
		y: pick2D_point(data.y),
		x_dose: pick1D_point(data.x_dose), // point-sampled
	};

	// carry over + aggregate all interval arrays
	for (const key of intervalKeys) {
		if (key in data) out[key] = sumIntervals(data[key]);
	}

	console.log("LDOPA_TO_CDA_CO = ", JSON.stringify(out.ldopaToCda));
	console.log("LOST_CDA_CO =", JSON.stringify(out.lostCda));
	console.log("REUPTAKEN_CO = ", JSON.stringify(out.reuptaken));
	console.log("CDA_TO_VDA_CO =", JSON.stringify(out.cdaToVda));
	console.log("DESTROYED_CO =", JSON.stringify(out.destroyed));
	console.log("LOST_EDA =", JSON.stringify(out.lostEda));
	console.log("out: ", out);

	return out;
}

export function minOf(arr) {
	let min = Infinity;
	for (const v of arr) {
		if (v < min) min = v;
	}
	return min;
}

export function maxOf(arr) {
	let max = -Infinity;
	for (const v of arr) {
		if (v > max) max = v;
	}
	return max;
}

function clamp01(x) {
	return Math.max(0, Math.min(1, x));
}

// Contrast curve to amplify small differences (S-curve)
function contrastCurve(u, contrast = 4) {
	// u in [0,1]
	const x = (u - 0.5) * contrast;
	const y = Math.tanh(x);
	return 0.5 + 0.5 * y;
}

export function mapValuesToSizes(
	values,
	minSize,
	maxSize,
	minGlobalValue,
	maxGlobalValue,
	fallback = (minSize + maxSize) / 2,
) {
	if (!values || values.length === 0) return [fallback];

	const minVal = Number(minGlobalValue);
	const maxVal = Number(maxGlobalValue);

	if (
		!Number.isFinite(minVal) ||
		!Number.isFinite(maxVal) ||
		minVal === maxVal
	) {
		return values.map(() => fallback);
	}

	const span = maxVal - minVal;

	return values.map((raw) => {
		const v = Number(raw);
		if (!Number.isFinite(v)) return fallback;

		const u = (v - minVal) / span;
		const uu = Math.max(0, Math.min(1, u)); // clamp to [0,1]
		return minSize + uu * (maxSize - minSize);
	});
}

export function formatNumber(x, decimals = 3) {
	if (!Number.isFinite(x)) return "";

	// round to fixed decimals, then strip trailing zeros and optional dot
	return x.toFixed(decimals).replace(/\.?0+$/, "");
}
