import {
	MOVE_DURATION_IN_REAL_SEC,
	PAUSE_DURATION_IN_REAL_SEC,
	REAL_SECONDS_PER_SIM_DAY,
} from "./config";
import { minOf, maxOf } from "../utils/helper_functions";

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

export const BTYR_SS = repeat(0);
export const TYR_SS = repeat(126);
export const LDOPA_SS = repeat(3.55798434e-1);
export const CDA_SS = repeat(2.64647902);
export const VDA_SS = repeat(8.09585651e1);
export const EDA_SS = repeat(2.02349121e-3);
export const DESTROYED_SS = repeat(5);
export const REUPTAKEN_SS = repeat(6);

export const MIN_VALUE_SS = minOf([
	...TYR_SS,
	...LDOPA_SS,
	...CDA_SS,
	...VDA_SS,
	...EDA_SS,
]);
export const MAX_VALUE_SS = maxOf([
	...TYR_SS,
	...LDOPA_SS,
	...CDA_SS,
	...VDA_SS,
	...EDA_SS,
]);
