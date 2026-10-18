// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/ErrorBoundary.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";

function resetKeyChanged(prev = [], next = []) {
	return prev.length !== next.length || prev.some((item, i) => !Object.is(item, next[i]));
}
var ElementErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			resetKey: props.resetKey
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error
		};
	}
	static getDerivedStateFromProps(props, state) {
		if (resetKeyChanged(state.resetKey, props.resetKey)) return {
			hasError: false,
			error: null,
			resetKey: props.resetKey
		};
		return null;
	}
	componentDidCatch(error, errorInfo) {
		let serializedProps = "[unserializable]";
		try {
			serializedProps = JSON.stringify(this.props.elementProps ?? null);
		} catch {}
		console.error(`[ElementErrorBoundary] Error in element ${this.props.elementName || this.props.elementId}:`, error, `props=${serializedProps}`, {
			componentStack: errorInfo.componentStack,
			props: this.props.elementProps
		});
		this.props.onError?.(error, errorInfo);
		if (this.props.elementName) this.props.onCrash?.(this.props.elementName);
	}
	render() {
		if (this.state.hasError) {
			const errorMessage = this.state.error?.message || "Unknown error";
			const shortMessage = errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage;
			if (this.props.fallback) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: this.props.fallback });
			if (this.props.silent || this.props.elementId?.startsWith("el-draw-")) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					padding: "8px 12px",
					border: "1px solid #fca5a5",
					borderRadius: "4px",
					backgroundColor: "#fef2f2",
					color: "#991b1b",
					fontSize: "11px",
					display: "flex",
					alignItems: "center",
					gap: "8px"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					style: {
						flex: 1,
						minWidth: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: { fontWeight: 600 },
							children: this.props.elementName || "Component"
						}),
						" crashed: ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							style: {
								fontFamily: "monospace",
								opacity: .8
							},
							children: shortMessage
						})
					]
				}), this.props.onFixWithAI && this.props.elementName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => this.props.onFixWithAI(this.props.elementName, errorMessage),
					style: {
						background: "#991b1b",
						color: "#fff",
						border: "none",
						borderRadius: "4px",
						padding: "2px 8px",
						fontSize: "11px",
						cursor: "default",
						whiteSpace: "nowrap"
					},
					children: "Fix with AI"
				})]
			});
		}
		return this.props.children;
	}
};

export { ElementErrorBoundary };
