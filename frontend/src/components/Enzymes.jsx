import { CHECKPOINT_POSITIONS, EDA_PATH_POINTS } from "../config/config";
import EnzymeMover from "./EnzymeMover";

const Enzymes = ({ useSimTime }) => {
	const yMovementRange = 0.03;
	const zOffset = 0.07;
	return (
		<>
			<EnzymeMover
				key={`enzyme-th`}
				p0={[
					CHECKPOINT_POSITIONS[2][0],
					CHECKPOINT_POSITIONS[2][1] + yMovementRange,
					CHECKPOINT_POSITIONS[2][2] + zOffset,
				]}
				p1={[
					CHECKPOINT_POSITIONS[2][0],
					CHECKPOINT_POSITIONS[2][1],
					CHECKPOINT_POSITIONS[2][2] + zOffset,
				]}
				p2={[
					CHECKPOINT_POSITIONS[2][0],
					CHECKPOINT_POSITIONS[2][1] + yMovementRange,
					CHECKPOINT_POSITIONS[2][2] + zOffset,
				]}
				useSimTime={useSimTime}
				name="TH"
			/>
			<EnzymeMover
				key={`enzyme-aadc`}
				p0={[
					CHECKPOINT_POSITIONS[3][0],
					CHECKPOINT_POSITIONS[3][1] + yMovementRange,
					CHECKPOINT_POSITIONS[3][2] + zOffset,
				]}
				p1={[
					CHECKPOINT_POSITIONS[3][0],
					CHECKPOINT_POSITIONS[3][1],
					CHECKPOINT_POSITIONS[3][2] + zOffset,
				]}
				p2={[
					CHECKPOINT_POSITIONS[3][0],
					CHECKPOINT_POSITIONS[3][1] + yMovementRange,
					CHECKPOINT_POSITIONS[3][2] + zOffset,
				]}
				useSimTime={useSimTime}
				name="AADC"
			/>
			<EnzymeMover
				key={`enzyme-mat`}
				p0={[
					CHECKPOINT_POSITIONS[4][0],
					CHECKPOINT_POSITIONS[4][1] + yMovementRange,
					CHECKPOINT_POSITIONS[4][2] + zOffset,
				]}
				p1={[
					CHECKPOINT_POSITIONS[4][0],
					CHECKPOINT_POSITIONS[4][1],
					CHECKPOINT_POSITIONS[4][2] + zOffset,
				]}
				p2={[
					CHECKPOINT_POSITIONS[4][0],
					CHECKPOINT_POSITIONS[4][1] + yMovementRange,
					CHECKPOINT_POSITIONS[4][2] + zOffset,
				]}
				useSimTime={useSimTime}
				name="MAT"
			/>
			<EnzymeMover
				key={`enzyme-mao`}
				p0={[
					EDA_PATH_POINTS[1][0],
					EDA_PATH_POINTS[1][1] + yMovementRange,
					EDA_PATH_POINTS[1][2] + zOffset,
				]}
				p1={[
					EDA_PATH_POINTS[1][0],
					EDA_PATH_POINTS[1][1],
					EDA_PATH_POINTS[1][2] + zOffset,
				]}
				p2={[
					EDA_PATH_POINTS[1][0],
					EDA_PATH_POINTS[1][1] + yMovementRange,
					EDA_PATH_POINTS[1][2] + zOffset,
				]}
				useSimTime={useSimTime}
				textColor={"#1b2026"}
				name="MAO"
			/>
		</>
	);
};

export default Enzymes;
