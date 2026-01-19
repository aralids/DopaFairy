import {
	MOVE_DURATION_IN_REAL_SEC,
	PAUSE_DURATION_IN_REAL_SEC,
	REAL_SECONDS_PER_SIM_DAY,
} from "./config";

export const T_CO = Array.from(
	{
		length:
			REAL_SECONDS_PER_SIM_DAY /
			(MOVE_DURATION_IN_REAL_SEC + PAUSE_DURATION_IN_REAL_SEC),
	},
	(_, i) => i * 864,
);

const repeat = (
	value,
	n = REAL_SECONDS_PER_SIM_DAY /
		(MOVE_DURATION_IN_REAL_SEC + PAUSE_DURATION_IN_REAL_SEC),
) => Array(n).fill(value);

export const BTYR_CO = repeat(6);
export const TYR_CO = repeat(5);
export const LDOPA_CO = repeat(4);
export const CDA_CO = repeat(4);
export const VDA_CO = repeat(2);
export const DESTROYED_CO = repeat(2);
export const REUPTAKEN_CO = repeat(3);
