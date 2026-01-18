export const styles = {
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
