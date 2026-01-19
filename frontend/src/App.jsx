import { useMemo, useState } from "react";
import ReducedViewer from "./components/ReducedViewer";
import { styles } from "./styles/app.styles";
import { downsampleByNearestMultiple } from "./utils/simTime";

function App() {
	const [scale, setScale] = useState(1);
	const [modelUrl, setModelUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// camera controls you already had
	const [cameraPos, setCameraPos] = useState([
		0.3854472334591896, 0.7939533264424148, 0.3433836230386268,
	]);
	const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
	const [autoCamera, setAutoCamera] = useState(true);
	const [cameraResetId, setCameraResetId] = useState(0);

	const [simMode, setSimMode] = useState("steady"); // "steady" | "circadian"

	const [circ1, setCirc1] = useState(false);
	const [circ2, setCirc2] = useState(false);
	const [circ3, setCirc3] = useState(false);

	const [dose, setDose] = useState(0);
	const [halfTime, setHalfTime] = useState(15);
	const [adminTime, setAdminTime] = useState(0);

	const yaoLink = useMemo(() => {
		// TODO: replace with the actual paper URL/DOI once you have it
		return "https://example.com";
	}, []);

	const handleForge = async () => {
		setLoading(true);
		setError(null);
		setModelUrl(null);

		try {
			const response = await fetch("http://localhost:8000/synapse/load", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ scale: parseFloat(scale) }),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			setModelUrl(url);
		} catch (err) {
			setError("Could not load cube: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleComputeDrugInfluence = async () => {
		try {
			const response = await fetch(
				"http://localhost:8000/synapse/compute_drug_influence",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						dose: dose,
						half_life: halfTime,
						t_admin: adminTime,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const result = await response.json(); // object
			const periodHours = 864 / 3600; // 0.24 h
			const reduced = downsampleByNearestMultiple(result, periodHours);

			console.log("Drug influence result:", reduced);
		} catch (err) {
			console.error("Failed to compute drug influence:", err);
		}
	};

	return (
		<div style={styles.page}>
			<header style={styles.header}>
				<h1 style={styles.title}>🧚‍♀️ DopaFairy</h1>
				<div style={styles.subtitle}>
					<span>Developed based on </span>
					<a
						href={yaoLink}
						target="_blank"
						rel="noreferrer"
						style={styles.link}
					>
						Yao et al
					</a>
				</div>
			</header>

			<main style={styles.main}>
				<section style={styles.viewerPanel}>
					<div style={styles.viewerFrame}>
						{!modelUrl && (
							<div style={styles.viewerPlaceholder}>
								<div style={styles.viewerLoadCard}>
									<div style={{ fontSize: 18, marginBottom: 10 }}>
										Load the synapse to start
									</div>

									<button
										style={{ ...styles.primaryButton, width: "100%" }}
										onClick={handleForge}
										disabled={loading}
									>
										{loading ? "Forging..." : "Load synapse"}
									</button>

									{error && <div style={styles.error}>{error}</div>}

									<div style={{ opacity: 0.65, marginTop: 10, fontSize: 13 }}>
										Left: viewer • Right: controls
									</div>
								</div>
							</div>
						)}

						{modelUrl && (
							<ReducedViewer
								modelUrl={modelUrl}
								cameraPos={cameraPos}
								cameraTarget={cameraTarget}
								autoCamera={autoCamera}
								setAutoCamera={setAutoCamera}
								cameraResetId={cameraResetId}
								simMode={simMode}
							/>
						)}
					</div>
				</section>

				<aside style={styles.controlsPanel}>
					{/* Load card removed from here */}

					<div style={styles.card}>
						<div style={styles.cardTitle}>Simulation mode</div>

						<div style={styles.segment}>
							<button
								style={{
									...styles.segmentBtn,
									...(simMode === "steady" ? styles.segmentBtnActive : null),
								}}
								onClick={() => setSimMode("steady")}
							>
								steady state
							</button>
							<button
								style={{
									...styles.segmentBtn,
									...(simMode === "circadian" ? styles.segmentBtnActive : null),
								}}
								onClick={() => setSimMode("circadian")}
							>
								circadian
							</button>
						</div>
					</div>

					<div style={styles.card}>
						<div style={styles.cardTitle}>Camera</div>

						<div style={styles.buttonGrid}>
							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([0, 6, 10]);
									setAutoCamera(true);
									setCameraResetId((id) => id + 1);
								}}
							>
								Top view
							</button>

							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([0, -5, 0]);
									setAutoCamera(true);
								}}
							>
								Bottom view
							</button>

							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([
										0.23450162311660422, 1.4987635921635074, -3.128746165755008,
									]);
									setAutoCamera(true);
								}}
							>
								Transporter view
							</button>
						</div>
					</div>

					{simMode === "circadian" && (
						<div style={styles.card}>
							<div style={styles.cardTitle}>Circadian inputs (dummy)</div>

							<label style={styles.checkboxRow}>
								<input
									type="checkbox"
									checked={circ1}
									onChange={(e) => setCirc1(e.target.checked)}
								/>
								<span>Toggle A</span>
							</label>

							<label style={styles.checkboxRow}>
								<input
									type="checkbox"
									checked={circ2}
									onChange={(e) => setCirc2(e.target.checked)}
								/>
								<span>Toggle B</span>
							</label>

							<label style={styles.checkboxRow}>
								<input
									type="checkbox"
									checked={circ3}
									onChange={(e) => setCirc3(e.target.checked)}
								/>
								<span>Toggle C</span>
							</label>
							<button
								style={{
									...styles.primaryButton,
									width: "100%",
									marginTop: 12,
								}}
								onClick={handleComputeDrugInfluence}
							>
								Compute drug influence
							</button>
						</div>
					)}
				</aside>
			</main>

			<footer style={styles.footer}>
				<div style={styles.footerInner}>
					<div style={{ fontSize: 14, opacity: 0.8 }}>
						Plots (reserved): 4 molecules over time
					</div>
				</div>
			</footer>
		</div>
	);
}

export default App;
