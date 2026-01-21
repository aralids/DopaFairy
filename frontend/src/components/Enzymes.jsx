import { CHECKPOINT_POSITIONS, EDA_PATH_POINTS } from "../config/config";
import EnzymeMover from "./EnzymeMover";

const Enzymes = ({ useSimTime }) => {
	const yMovementRange = 0.03;
	const zOffset = 0.05;
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
			/>
		</>
	);
};

export default Enzymes;
