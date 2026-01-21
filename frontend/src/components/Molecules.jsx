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

import MoleculeMover from "./MoleculeMover";
import MoleculeMoverAlongCurve from "./MoleculeMoverAlongCurve";

const Molecules = ({ simMode, useSimTime }) => {
	return (
		<>
			<MoleculeMover
				name={"btyr"}
				pos={[CHECKPOINT_POSITIONS[0], CHECKPOINT_POSITIONS[1]]}
				tEvol={LDOPA_TO_CDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : 0}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : 126}
			/>
			<MoleculeMover
				name={"tyr"}
				pos={[CHECKPOINT_POSITIONS[1], CHECKPOINT_POSITIONS[2]]}
				tEvol={LDOPA_TO_CDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : 0}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : 126}
			/>
			<MoleculeMover
				name={"ldopa"}
				pos={[CHECKPOINT_POSITIONS[2], CHECKPOINT_POSITIONS[3]]}
				tEvol={LDOPA_TO_CDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(CDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(CDA_CO)}
			/>
			<MoleculeMover
				name={"cda"}
				pos={[CHECKPOINT_POSITIONS[3], CHECKPOINT_POSITIONS[4]]}
				tEvol={CDA_TO_VDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
			/>
			<MoleculeMover
				name={"vda"}
				pos={[CHECKPOINT_POSITIONS[4], CHECKPOINT_POSITIONS[5]]}
				tEvol={VDA_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
			/>
			<MoleculeMover
				name={"eda-mao"}
				pos={[EDA_PATH_POINTS[0], EDA_PATH_POINTS[1]]}
				tEvol={DESTROYED_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
			/>
			<MoleculeMoverAlongCurve
				name={"eda-dat"}
				pos={DAT_CURVE_POINTS}
				tEvol={REUPTAKEN_CO}
				useSimTime={useSimTime}
				minGlobalValue={simMode === "steady" ? MIN_VALUE_SS : minOf(VDA_CO)}
				maxGlobalValue={simMode === "steady" ? MAX_VALUE_SS : maxOf(VDA_CO)}
			/>
		</>
	);
};

export default Molecules;
