import { realSec2SimSec } from "../utils/helper_functions";

export const REAL_SECONDS_PER_SIM_DAY = 330;
export const SIM_SECONDS_PER_DAY = 24 * 60 * 60;

export const CHECKPOINT_POSITIONS = [
	[0.550804, 1.37743, -1.07188],
	[0.330904, 1.37743, -0.555198],
	[0.148127, 1.29878, -0.225056],
	[0.019215, 1.06965, -0.028969],
	[0.000059, 0.836497, 0.001682],
	[0.000059, 0.529464, 0.001682],
];
export const DAT_CURVE_POINTS = [
	[0.000059, 0.529464, 0.001682],
	[-0.040968, 0.549783, 0.135849],
	[-0.068187, 0.639589, 0.240136],
	[-0.041205, 0.897333, 0.196127],
	[-0.041837, 1.03926, 0.10928],
	[0.019215, 1.06271, -0.028969],
];
export const EDA_PATH_POINTS = [
	CHECKPOINT_POSITIONS[5],
	[0.113718, 0.529464, -0.248264],
];

export const MOVE_DURATION_IN_REAL_SEC = 3;
export const PAUSE_DURATION_IN_REAL_SEC = 0.3;
export const ENZYME_OFFSET_IN_REAL_SEC = 1.5;

export const MIN_SPHERE_SIZE = 0.01;
export const MAX_SPHERE_SIZE = 0.05;
export const MIN_BTYR_AMOUNT = 0;
export const MAX_BTYR_AMOUNT = 6;
export const MIN_TYR_AMOUNT = 0;
export const MAX_TYR_AMOUNT = 6;
export const MIN_LDOPA_AMOUNT = 0;
export const MAX_LDOPA_AMOUNT = 6;
export const MIN_CDA_AMOUNT = 0;
export const MAX_CDA_AMOUNT = 6;
export const MIN_VDA_AMOUNT = 0;
export const MAX_VDA_AMOUNT = 6;
export const MIN_REUPTAKEN_AMOUNT = 0;
export const MAX_REUPTAKEN_AMOUNT = 6;
export const MIN_DESTROYED_AMOUNT = 0;
export const MAX_DESTROYED_AMOUNT = 6;
export const K_CDA = 1;
export const K_EDA = 1;

export const MOVE_DURATION_IN_SIM_SEC = realSec2SimSec(
	MOVE_DURATION_IN_REAL_SEC,
);
export const PAUSE_DURATION_IN_SIM_SEC = realSec2SimSec(
	PAUSE_DURATION_IN_REAL_SEC,
);
export const ENZYME_OFFSET_IN_SIM_SEC = realSec2SimSec(
	ENZYME_OFFSET_IN_REAL_SEC,
);

//"#C73A3A", // vibrant crimson red
export const DEPOT_COLORS = [
	// cool crimson / raspberry
	"#C93C7E", // magenta-rose
	"#B14CC9", // electric orchid
	"#8B57E0", // vibrant violet
	"#5E6AE8", // cool indigo
	"#3F63D8", // deep blue-violet
];

export const MOLECULE_COLORS = ["#C63A5A", ...DEPOT_COLORS];
