import {
	MOVE_DURATION_IN_SIM_SEC,
	REAL_SECONDS_PER_SIM_DAY,
	SIM_SECONDS_PER_DAY,
} from "./config";

export const t = Array.from({ length: 100 }, (_, i) => i * 864);

const repeat = (value, n = 100) => Array(n).fill(value);

export const btyr = repeat(0);
export const tyr = repeat(1);
export const ldopa = repeat(2);
export const cda = repeat(3);
export const vda = repeat(4);
export const destroyed = repeat(5);
export const reuptaken = repeat(6);
