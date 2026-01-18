import { useEffect, useMemo, useRef, useState } from "react";
import ReducedViewer from "./components/ReducedViewer";

function pad2(n) {
	return String(n).padStart(2, "0");
}

// 24h in 2.4 minutes = 144 seconds real-time
const REAL_SECONDS_PER_SIM_DAY = 144;
const REAL_SECONDS_PER_SIM_HOUR = REAL_SECONDS_PER_SIM_DAY / 24; // 6 seconds per sim hour

function App() {
	const [scale, setScale] = useState(1);
	const [modelUrl, setModelUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// viewer movement mode you already had
	const [mode, setMode] = useState("bounce"); // "bounce" | "side"

	// camera controls you already had
	const [cameraPos, setCameraPos] = useState([
		0.3854472334591896, 0.7939533264424148, 0.3433836230386268,
	]);
	const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
	const [autoCamera, setAutoCamera] = useState(true);
	const [cameraResetId, setCameraResetId] = useState(0);

	// NEW: steady state vs circadian
	const [simMode, setSimMode] = useState("steady"); // "steady" | "circadian"

	// NEW: circadian clock
	const circadianStartMsRef = useRef(null);
	const [simClockSeconds, setSimClockSeconds] = useState(0);

	// NEW: dummy circadian toggles
	const [circ1, setCirc1] = useState(false);
	const [circ2, setCirc2] = useState(false);
	const [circ3, setCirc3] = useState(false);

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

	// Run/reset circadian clock only when mode is circadian
	useEffect(() => {
		if (simMode !== "circadian") return;

		// reset clock whenever switching into circadian mode
		circadianStartMsRef.current = performance.now();
		setSimClockSeconds(0);

		const id = window.setInterval(() => {
			const start = circadianStartMsRef.current ?? performance.now();
			const elapsedRealSec = (performance.now() - start) / 1000;

			// map real seconds -> simulated seconds (scaled so 144 real sec = 86400 sim sec)
			const simSecondsPerRealSecond = 86400 / REAL_SECONDS_PER_SIM_DAY;
			const simSec = elapsedRealSec * simSecondsPerRealSecond;

			// keep within a 24h loop
			setSimClockSeconds(simSec % 86400);
		}, 200);

		return () => window.clearInterval(id);
	}, [simMode]);

	const simClockLabel = useMemo(() => {
		const total = Math.floor(simClockSeconds);
		const hh = Math.floor(total / 3600);
		const mm = Math.floor((total % 3600) / 60);
		const ss = total % 60;
		return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
	}, [simClockSeconds]);

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
								mode={mode}
								cameraPos={cameraPos}
								cameraTarget={cameraTarget}
								autoCamera={autoCamera}
								setAutoCamera={setAutoCamera}
								cameraResetId={cameraResetId}
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

						{simMode === "circadian" && (
							<div style={styles.clockBox}>
								<div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
									{`Simulation clock (24h = ${REAL_SECONDS_PER_SIM_DAY / 60} min)`}
								</div>
								<div style={styles.clockTime}>{simClockLabel}</div>
								<div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
									1 sim hour = {REAL_SECONDS_PER_SIM_HOUR.toFixed(0)}s real-time
								</div>
							</div>
						)}
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

const styles = {
	page: {
		fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
		width: "100vw",
		minHeight: "100vh",
		display: "flex",
		flexDirection: "column",
		background: "#0b0d12",
		color: "white",
	},

	header: {
		padding: "18px 18px 10px",
		textAlign: "center",
		position: "sticky",
		top: 0,
		background: "rgba(11,13,18,0.85)",
		backdropFilter: "blur(10px)",
		zIndex: 10,
		borderBottom: "1px solid rgba(255,255,255,0.08)",
	},

	title: {
		margin: 0,
		fontSize: 34,
		letterSpacing: 0.2,
	},

	subtitle: {
		marginTop: 6,
		fontSize: 14,
		opacity: 0.85,
	},

	link: {
		color: "white",
		textDecoration: "underline",
	},

	main: {
		width: "100vw",
		flex: 1,
		display: "flex",
		gap: 16,
		padding: 16,
		boxSizing: "border-box",
		alignItems: "stretch",
	},

	viewerPanel: {
		flex: 1,
		minWidth: 0,
		display: "flex",
	},

	viewerFrame: {
		flex: 1,
		borderRadius: 16,
		overflow: "hidden",
		border: "1px solid rgba(255,255,255,0.10)",
		background: "#0f1420",
		position: "relative",
	},

	viewerPlaceholder: {
		position: "absolute",
		inset: 0,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},

	// ✅ NEW: card for the load UI in the viewer overlay
	viewerLoadCard: {
		width: "min(420px, 90%)",
		padding: 16,
		borderRadius: 16,
		border: "1px solid rgba(255,255,255,0.12)",
		background: "rgba(0,0,0,0.35)",
		boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
	},

	controlsPanel: {
		width: 340,
		maxWidth: "40vw",
		display: "flex",
		flexDirection: "column",
		gap: 12,
	},

	card: {
		borderRadius: 16,
		border: "1px solid rgba(255,255,255,0.10)",
		background: "rgba(255,255,255,0.04)",
		padding: 14,
		textAlign: "left",
	},

	cardTitle: {
		fontSize: 14,
		opacity: 0.8,
		marginBottom: 10,
	},

	row: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 10,
		marginBottom: 10,
	},

	label: {
		fontSize: 13,
		opacity: 0.85,
	},

	input: {
		width: 120,
		padding: "8px 10px",
		borderRadius: 10,
		border: "1px solid rgba(255,255,255,0.18)",
		background: "rgba(0,0,0,0.25)",
		color: "white",
		outline: "none",
	},

	primaryButton: {
		width: "100%",
		padding: "10px 12px",
		borderRadius: 12,
		border: "1px solid rgba(255,255,255,0.18)",
		background: "rgba(255,255,255,0.10)",
		color: "white",
		cursor: "pointer",
	},

	error: {
		marginTop: 10,
		color: "#ff6b6b",
		fontSize: 13,
	},

	segment: {
		display: "flex",
		gap: 8,
	},

	segmentBtn: {
		flex: 1,
		padding: "10px 10px",
		borderRadius: 12,
		border: "1px solid rgba(255,255,255,0.18)",
		background: "rgba(0,0,0,0.25)",
		color: "white",
		cursor: "pointer",
		fontSize: 13,
	},

	segmentBtnActive: {
		background: "rgba(255,255,255,0.12)",
		border: "1px solid rgba(255,255,255,0.28)",
	},

	buttonGrid: {
		display: "grid",
		gridTemplateColumns: "1fr",
		gap: 8,
	},

	button: {
		padding: "10px 12px",
		borderRadius: 12,
		border: "1px solid rgba(255,255,255,0.18)",
		background: "rgba(0,0,0,0.25)",
		color: "white",
		cursor: "pointer",
		textAlign: "left",
	},

	clockBox: {
		marginTop: 12,
		padding: 12,
		borderRadius: 14,
		border: "1px solid rgba(255,255,255,0.12)",
		background: "rgba(0,0,0,0.22)",
	},

	clockTime: {
		fontSize: 28,
		letterSpacing: 1,
	},

	checkboxRow: {
		display: "flex",
		gap: 10,
		alignItems: "center",
		padding: "8px 4px",
		fontSize: 14,
	},

	footer: {
		width: "100vw",
		padding: 14,
		boxSizing: "border-box",
		borderTop: "1px solid rgba(255,255,255,0.08)",
		background: "rgba(255,255,255,0.03)",
	},

	footerInner: {
		maxWidth: 1100,
		margin: "0 auto",
		textAlign: "center",
		padding: "10px 12px",
		borderRadius: 14,
		border: "1px dashed rgba(255,255,255,0.18)",
	},
};

export default App;
