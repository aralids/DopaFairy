import { useMemo, useState, useEffect } from "react";
import ReducedViewer from "./components/ReducedViewer";
import { styles } from "./styles/app.styles";
import { downsampleByNearestMultiple } from "./utils/helper_functions";

function App() {
	const [assets, setAssets] = useState({});

	useEffect(() => {
		let cancelled = false;

		async function loadManifest() {
			try {
				// This hits your FastAPI route: GET /synapse/assets
				const res = await fetch("http://localhost:8000/synapse/assets");
				if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
				const data = await res.json();

				if (!cancelled) setAssets(data);
			} catch (e) {
				if (!cancelled) setError(String(e));
			}
		}

		loadManifest();
		return () => {
			cancelled = true;
		};
	}, []);

	const [scale, setScale] = useState(1);
	const [modelUrl, setModelUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// camera controls you already had
	const [cameraPos, setCameraPos] = useState([1 / 2, 3 / 2, -10 / 2]);
	const [cameraTarget, setCameraTarget] = useState([0, 0, 6]);
	const [autoCamera, setAutoCamera] = useState(true);
	const [cameraResetId, setCameraResetId] = useState(0);

	const [simMode, setSimMode] = useState("steady"); // "steady" | "circadian"

	const [circ1, setCirc1] = useState(false);
	const [circ2, setCirc2] = useState(false);
	const [circ3, setCirc3] = useState(false);

	const [dose, setDose] = useState(0.5);
	const [halfTime, setHalfTime] = useState(15);
	const [adminTime, setAdminTime] = useState(6);

	const [presynapseOpacity, setPresynapseOpacity] = useState(1.0);

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

			console.log("Drug influence result:", result);
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
								presynapseOpacity={presynapseOpacity}
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
									setCameraPos([1 / 4.5, 3 / 4.5, -10 / 4.5]);
									setCameraTarget([0, 1.8, 6]);
									setAutoCamera(true);
									setCameraResetId((id) => id + 1);
									setPresynapseOpacity(0.3);
								}}
							>
								Presynapse close-up
							</button>

							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([
										-0.7332239632468313, 1.4704271686085164, -1.061366089818541,
									]);
									setCameraTarget([
										0.29626928863452184, 1.291641235476282, -0.6138156180284925,
									]);
									setAutoCamera(true);
								}}
							>
								btyr ⟶ tyr ⟶ ldopa
							</button>

							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([
										-0.4986511464683294, 1.194467475181709, -0.7953984224005186,
									]);
									setCameraTarget([
										0.0914125962481884, 1.075857368778997, -0.34102648519232986,
									]);
									setAutoCamera(true);
								}}
							>
								ldopa ⟶ cda ⟶ vda
							</button>
							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([
										-0.027219492583773375, 0.6082807036124639,
										-0.9203135398428287,
									]);
									setCameraTarget([
										0.0991547926165732, 0.705320140864317, -0.35852894621914255,
									]);
									setAutoCamera(true);
								}}
							>
								cda ⟶ vda ⟶ eda
							</button>
							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([
										-0.5873624433921065, 0.800010210938257, -0.7984107657010662,
									]);
									setCameraTarget([
										0.08820534321845629, 0.25047728457614, 0.11269645472801022,
									]);
									setAutoCamera(true);
								}}
							>
								eda ⟶ destruction
							</button>
							<button
								style={styles.button}
								onClick={() => {
									setCameraPos([
										-0.8449864060292488, 1.2207966852018328,
										-0.3348098210387368,
									]);
									setCameraTarget([
										0.41550505174953145, 0.7672195418423863,
										0.18978691426070596,
									]);
									setAutoCamera(true);
								}}
							>
								eda ⟶ reuptake
							</button>
						</div>
					</div>
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
