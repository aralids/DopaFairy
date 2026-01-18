import {
	SIM_SECONDS_PER_DAY,
	REAL_SECONDS_PER_SIM_DAY,
} from "../config/config";

export const realSec2SimSec = (sec) => {
	return sec * (SIM_SECONDS_PER_DAY / REAL_SECONDS_PER_SIM_DAY);
};
