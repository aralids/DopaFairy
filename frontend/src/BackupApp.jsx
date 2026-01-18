import { useState } from "react";
import ReducedViewer from "./components/ReducedViewer";

function App() {
	const [scale, setScale] = useState(1);
	const [modelUrl, setModelUrl] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [mode, setMode] = useState("bounce"); // "bounce" | "side"
	const [cameraPos, setCameraPos] = useState([3, 3, 3]);
	const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
	const [autoCamera, setAutoCamera] = useState(true);
	const [cameraResetId, setCameraResetId] = useState(0);

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

			console.log("Response status:", response.status);
			console.log("Response type:", response.headers.get("Content-Type"));

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

	return (
		<div
			style={{
				fontFamily: "sans-serif",
				textAlign: "center",
				padding: "2rem",
			}}
		>
			<h1>🪄 Cube Generator</h1>

			<div style={{ marginBottom: "1rem" }}>
				<label>
					Scale:{" "}
					<input
						type="number"
						value={scale}
						onChange={(e) => setScale(e.target.value)}
						step="0.1"
						min="0.1"
					/>
				</label>
				<button onClick={handleForge} disabled={loading}>
					{loading ? "Forging..." : "Load cube"}
				</button>
				<div style={{ marginBottom: "1rem" }}>
					<button onClick={() => setMode("bounce")} disabled={!modelUrl}>
						Bounce
					</button>
					<button onClick={() => setMode("side")} disabled={!modelUrl}>
						Side-to-side
					</button>
				</div>
				<button
					onClick={() => {
						setCameraPos([0, 6, 10]);
						setAutoCamera(true);
						setCameraResetId((id) => id + 1);
					}}
				>
					Top view
				</button>
				<button
					onClick={() => {
						setCameraPos([0, -5, 0]);
						setAutoCamera(true);
					}}
				>
					Left view
				</button>
			</div>

			{error && <p style={{ color: "red" }}>{error}</p>}

			<div style={{ width: "600px", height: "400px", margin: "0 auto" }}>
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
		</div>
	);
}

export default App;
