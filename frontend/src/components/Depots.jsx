import {
	REAL_SECONDS_PER_SIM_DAY,
	SIM_SECONDS_PER_DAY,
	CHECKPOINT_POSITIONS,
	MOVE_DURATION_IN_SIM_SEC,
	PAUSE_DURATION_IN_SIM_SEC,
	EDA_PATH_POINTS,
	DAT_CURVE_POINTS,
} from "../config/config";
import {
	TYR_CO,
	LDOPA_CO,
	CDA_CO,
	VDA_CO,
	EDA_CO,
	TYR_TO_LDOPA_CO,
	LDOPA_TO_CDA_CO,
	LOST_CDA_CO,
	REUPTAKEN_CO,
	CDA_TO_VDA_CO,
	DESTROYED_CO,
	LOST_EDA,
} from "../config/circadianOscillation";
import {
	TYR_SS,
	LDOPA_SS,
	CDA_SS,
	VDA_SS,
	EDA_SS,
	MIN_VALUE_SS,
	MAX_VALUE_SS,
} from "../config/steadyState";

import { minOf, maxOf } from "../utils/helper_functions";

import Depot from "./Depot";

const Depots = ({ simMode, useSimTime }) => {
	return (
		<>
			<Depot
				name={"tyr"}
				pos={CHECKPOINT_POSITIONS[1]}
				tEvol={simMode === "steady" ? TYR_SS : TYR_CO}
				useSimTime={useSimTime}
				minGlobalValue={MIN_VALUE_SS}
				maxGlobalValue={MAX_VALUE_SS}
			/>
			<Depot
				name={"ldopa"}
				pos={CHECKPOINT_POSITIONS[2]}
				tEvol={simMode === "steady" ? LDOPA_SS : LDOPA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(LDOPA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(LDOPA_CO)}
			/>
			<Depot
				name={"cda"}
				pos={CHECKPOINT_POSITIONS[3]}
				tEvol={simMode === "steady" ? CDA_SS : CDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(CDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(CDA_CO)}
			/>
			<Depot
				name={"vda"}
				pos={CHECKPOINT_POSITIONS[4]}
				tEvol={simMode === "steady" ? VDA_SS : VDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
			/>
			<Depot
				name={"eda"}
				pos={CHECKPOINT_POSITIONS[5]}
				tEvol={simMode === "steady" ? EDA_SS : EDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(EDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(EDA_CO)}
			/>
		</>
	);
};

export default Depots;
