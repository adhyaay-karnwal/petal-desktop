// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/VersionHistoryModal.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Badge } from "../../../../ui/src/components/Badge.js";
import { ArrowCounterClockwiseIcon, CodeIcon, EyeIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { Input } from "../../../../ui/src/components/Input.js";
import { Tabs, TabsList, TabsTrigger } from "../../../../ui/src/components/Tabs.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../vendor/sonner.js";
import { useIsDark } from "../../../../ui/src/hooks/useIsDark.js";
import { githubDark, githubLight } from "../../../../../vendor/@uiw/codemirror-theme-github.js";
import { buildPreviewComponentProps, inventPropValue } from "./panels/AssetsPanel.js";
import { useBackendActions } from "../hooks/useBackendActions.js";
import { ReactCodeMirror } from "../../../../../vendor/@uiw/react-codemirror.js";
import { javascript } from "../../../../../vendor/@codemirror/lang-javascript.js";
import { CODE_EDITOR_CLASS, CODE_EDITOR_THEME, useCodeEditorFontStyles } from "../utils/codeEditorTheme.js";

function bareComponentName(name) {
	return name.includes("::") ? name.split("::")[0] : name;
}
function unionOptionsFromType(propType) {
	if (!propType || !propType.includes("|") || !(propType.includes("\"") || propType.includes("'"))) return;
	const options = propType.split("|").map((s) => s.trim().replace(/['"]/g, "")).filter((v) => v && v !== "undefined" && v !== "null");
	return options.length > 1 ? options : void 0;
}
function parseSignatureProps(sourceCode, displayName) {
	const propMatch = sourceCode.match(new RegExp(`function\\s+${displayName}\\s*\\(\\s*\\{([^}]*)\\}`));
	if (!propMatch) return [];
	const props = propMatch[1].split(",").map((p) => p.trim()).filter(Boolean).map((p) => {
		const [nameWithDefault] = p.split(":");
		const parts = nameWithDefault.split("=").map((s) => s.trim());
		const name = parts[0];
		let defaultValue = void 0;
		if (parts[1]) try {
			defaultValue = JSON.parse(parts[1].replace(/'/g, "\""));
		} catch {
			defaultValue = parts[1].replace(/['"]/g, "");
		}
		return {
			name,
			defaultValue,
			options: void 0,
			type: void 0
		};
	}).filter((p) => p.name && !p.name.startsWith("..."));
	for (const prop of props) {
		const unionMatch = sourceCode.match(new RegExp(`${prop.name}\\??\\s*:\\s*((?:'[^']*'\\s*\\|\\s*)*'[^']*')`));
		if (unionMatch) {
			const options = unionMatch[1].split("|").map((s) => s.trim().replace(/'/g, ""));
			if (options.length > 1) {
				prop.options = options;
				prop.type = options.map((o) => `'${o}'`).join(" | ");
				if (prop.defaultValue === void 0) prop.defaultValue = options[0];
			}
		}
	}
	return props;
}
function propsFromComponentIndex(indexProps) {
	if (!indexProps) return [];
	return Object.entries(indexProps).map(([name, info]) => {
		const type = typeof info === "object" && info ? String(info.type || "") : String(info || "");
		const options = unionOptionsFromType(type);
		return {
			name,
			type,
			options,
			defaultValue: (typeof info === "object" && info ? info.example !== void 0 ? info.example : info.default : void 0) ?? (options ? options[0] : void 0) ?? inventPropValue(name, info)
		};
	});
}
function buildPreviewMeta(sourceCode, displayName, componentName, componentIndex) {
	const indexEntry = componentIndex?.[componentName] ?? componentIndex?.[displayName];
	const fromIndex = propsFromComponentIndex(indexEntry?.props);
	const fromSignature = sourceCode ? parseSignatureProps(sourceCode, displayName) : [];
	const props = mergePropLists(fromIndex.length > 0 ? fromIndex : fromSignature, fromSignature).filter((p) => p.name !== "children");
	const { props: invented } = buildPreviewComponentProps(indexEntry?.props);
	const initial = { ...invented };
	for (const p of props) if (initial[p.name] === void 0 && p.defaultValue !== void 0) initial[p.name] = p.defaultValue;
	return {
		props,
		initial
	};
}
function mergePropLists(primary, secondary) {
	const byName = /* @__PURE__ */ new Map();
	for (const prop of secondary) byName.set(prop.name, prop);
	for (const prop of primary) {
		const existing = byName.get(prop.name);
		byName.set(prop.name, existing ? {
			...existing,
			...prop,
			options: prop.options ?? existing.options,
			defaultValue: prop.defaultValue !== void 0 ? prop.defaultValue : existing.defaultValue,
			type: prop.type || existing.type
		} : prop);
	}
	return [...byName.values()];
}
function getTimeAgo(date) {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1e3);
	if (seconds < 5) return "just now";
	if (seconds < 60) return `${seconds}s ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
}
function formatDate(date) {
	return date.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	}) + " · " + date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
var PreviewErrorBoundary = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			error: ""
		};
	}
	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error: error.message
		};
	}
	componentDidCatch(error, _info) {
		this.props.onError?.(error);
	}
	render() {
		if (this.state.hasError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-center h-full p-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					children: "Preview unavailable"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					className: "mt-1 max-w-md",
					children: this.state.error
				})]
			})
		});
		return this.props.children;
	}
};
function VersionHistoryModal(t0) {
	const $ = (0, import_compiler_runtime.c)(79);
	const { componentName, filePath, onClose, onRestore, componentIndex, compilePreview } = t0;
	const { listFileVersions, restoreFileVersion, getFileVersionContent, loadFile } = useBackendActions();
	useCodeEditorFontStyles();
	const isDark = useIsDark();
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = javascript({ jsx: true });
		$[0] = t1;
	} else t1 = $[0];
	const t2 = isDark ? githubDark : githubLight;
	let t3;
	if ($[1] !== t2) {
		t3 = [
			t1,
			t2,
			CODE_EDITOR_THEME
		];
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	const editorExtensions = t3;
	const displayName = bareComponentName(componentName);
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = [];
		$[3] = t4;
	} else t4 = $[3];
	const [versions, setVersions] = (0, import_react.useState)(t4);
	const [isLoading, setIsLoading] = (0, import_react.useState)(true);
	const [selectedVersion, setSelectedVersion] = (0, import_react.useState)(null);
	const [sourceCode, setSourceCode] = (0, import_react.useState)("");
	const [isLoadingContent, setIsLoadingContent] = (0, import_react.useState)(false);
	const [isRestoring, setIsRestoring] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)("preview");
	const [PreviewComp, setPreviewComp] = (0, import_react.useState)(null);
	const [isCompiling, setIsCompiling] = (0, import_react.useState)(false);
	const indexEntry = componentIndex?.[componentName] ?? componentIndex?.[displayName];
	let t5;
	if ($[4] !== indexEntry) {
		t5 = indexEntry?.props ? Object.keys(indexEntry.props).join(",") : "";
		$[4] = indexEntry;
		$[5] = t5;
	} else t5 = $[5];
	const previewSourceKey = `${componentName}\0${displayName}\0${sourceCode}\0${t5}`;
	const { props: componentProps, initial: initialPreviewProps } = buildPreviewMeta(sourceCode, displayName, componentName, componentIndex);
	const [previewProps, setPreviewProps] = (0, import_react.useState)(initialPreviewProps);
	const [appliedPreviewKey, setAppliedPreviewKey] = (0, import_react.useState)(previewSourceKey);
	if (previewSourceKey !== appliedPreviewKey) {
		setAppliedPreviewKey(previewSourceKey);
		setPreviewProps(initialPreviewProps);
	}
	let t6;
	if ($[6] !== componentName || $[7] !== filePath || $[8] !== listFileVersions) {
		t6 = async () => {
			setIsLoading(true);
			const result = await listFileVersions(componentName, filePath);
			if (result.success) setVersions(result.versions);
			setIsLoading(false);
		};
		$[6] = componentName;
		$[7] = filePath;
		$[8] = listFileVersions;
		$[9] = t6;
	} else t6 = $[9];
	const fetchVersions = (0, import_react.useEffectEvent)(t6);
	let t7;
	if ($[10] !== fetchVersions) {
		t7 = () => {
			fetchVersions();
		};
		$[10] = fetchVersions;
		$[11] = t7;
	} else t7 = $[11];
	let t8;
	if ($[12] !== componentName || $[13] !== filePath) {
		t8 = [componentName, filePath];
		$[12] = componentName;
		$[13] = filePath;
		$[14] = t8;
	} else t8 = $[14];
	(0, import_react.useEffect)(t7, t8);
	let t9;
	if ($[15] !== filePath || $[16] !== loadFile) {
		t9 = async () => {
			const result_0 = await loadFile(filePath);
			if (result_0.success && result_0.raw) setSourceCode(result_0.raw);
		};
		$[15] = filePath;
		$[16] = loadFile;
		$[17] = t9;
	} else t9 = $[17];
	const fetchCurrentFile = (0, import_react.useEffectEvent)(t9);
	let t10;
	if ($[18] !== fetchCurrentFile) {
		t10 = () => {
			fetchCurrentFile();
		};
		$[18] = fetchCurrentFile;
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== filePath) {
		t11 = [filePath];
		$[20] = filePath;
		$[21] = t11;
	} else t11 = $[21];
	(0, import_react.useEffect)(t10, t11);
	const fetchVersionContent = (0, import_react.useEffectEvent)(async (cancelled) => {
		setIsLoadingContent(true);
		setPreviewComp(null);
		let code;
		if (selectedVersion === null) {
			const result_1 = await loadFile(filePath);
			code = result_1.success && result_1.raw ? result_1.raw : "";
		} else {
			const result_2 = await getFileVersionContent(componentName, selectedVersion);
			code = result_2.success && result_2.content ? result_2.content : "";
		}
		if (cancelled()) return;
		setSourceCode(code);
		setIsLoadingContent(false);
		if (code && compilePreview) {
			setIsCompiling(true);
			try {
				const comp = await compilePreview(code, displayName, filePath);
				if (!cancelled()) setPreviewComp(() => comp);
			} catch {
				if (!cancelled()) setPreviewComp(null);
			}
			if (!cancelled()) setIsCompiling(false);
		}
	});
	let t12;
	if ($[22] !== fetchVersionContent) {
		t12 = () => {
			let cancelled_0 = false;
			fetchVersionContent(() => cancelled_0);
			return () => {
				cancelled_0 = true;
			};
		};
		$[22] = fetchVersionContent;
		$[23] = t12;
	} else t12 = $[23];
	let t13;
	if ($[24] !== componentName || $[25] !== displayName || $[26] !== filePath || $[27] !== selectedVersion) {
		t13 = [
			selectedVersion,
			filePath,
			componentName,
			displayName
		];
		$[24] = componentName;
		$[25] = displayName;
		$[26] = filePath;
		$[27] = selectedVersion;
		$[28] = t13;
	} else t13 = $[28];
	(0, import_react.useEffect)(t12, t13);
	const handleRestore = async (versionFilename) => {
		setIsRestoring(true);
		const result_3 = await restoreFileVersion(componentName, versionFilename, filePath);
		if (result_3.success) {
			toast.success(`${displayName} restored to previous version`);
			onRestore(filePath);
			onClose();
		} else toast.error(`Failed to restore: ${result_3.error}`);
		setIsRestoring(false);
	};
	let t14;
	if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = (name, value) => {
			setPreviewProps((prev) => ({
				...prev,
				[name]: value
			}));
		};
		$[29] = t14;
	} else t14 = $[29];
	const handlePropChange = t14;
	const T0 = Dialog;
	const t15 = true;
	let t16;
	if ($[30] !== onClose) {
		t16 = (open) => {
			if (!open) onClose();
		};
		$[30] = onClose;
		$[31] = t16;
	} else t16 = $[31];
	const T1 = DialogContent;
	const t17 = "max-w-[1100px] h-[80vh] overflow-hidden";
	const t18 = void 0;
	let t19;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
			className: "shrink-0",
			children: "Version history"
		});
		$[32] = t19;
	} else t19 = $[32];
	let t20;
	if ($[33] !== filePath) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [t19, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "tertiary",
				className: "truncate",
				children: filePath
			})]
		}) });
		$[33] = filePath;
		$[34] = t20;
	} else t20 = $[34];
	const t21 = "flex min-h-0 flex-1";
	const t22 = "flex-1 flex flex-col min-w-0 min-h-0";
	let t23;
	if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = (v) => setActiveTab(v);
		$[35] = t23;
	} else t23 = $[35];
	let t24;
	if ($[36] === Symbol.for("react.memo_cache_sentinel")) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
			value: "preview",
			className: "text-ed-ui h-6.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeIcon, {
				width: 12,
				height: 12
			}), "Preview"]
		});
		$[36] = t24;
	} else t24 = $[36];
	let t25;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
			variant: "simple",
			className: "h-6.5 gap-0 border-0",
			children: [t24, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
				value: "code",
				className: "text-ed-ui h-6.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeIcon, {
					width: 12,
					height: 12
				}), "Code"]
			})]
		});
		$[37] = t25;
	} else t25 = $[37];
	let t26;
	if ($[38] !== activeTab) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: activeTab,
				onValueChange: t23,
				children: t25
			})
		});
		$[38] = activeTab;
		$[39] = t26;
	} else t26 = $[39];
	let t27;
	if ($[40] !== handleRestore || $[41] !== isRestoring || $[42] !== selectedVersion) {
		t27 = selectedVersion !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			onClick: () => handleRestore(selectedVersion),
			disabled: isRestoring,
			LeftIcon: ArrowCounterClockwiseIcon,
			children: isRestoring ? "Restoring..." : "Restore this version"
		});
		$[40] = handleRestore;
		$[41] = isRestoring;
		$[42] = selectedVersion;
		$[43] = t27;
	} else t27 = $[43];
	let t28;
	if ($[44] !== t26 || $[45] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-5 py-2",
			children: [t26, t27]
		});
		$[44] = t26;
		$[45] = t27;
		$[46] = t28;
	} else t28 = $[46];
	const t29 = activeTab === "preview" && componentProps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center gap-2 px-5 py-2 bg-ed-muted/20 overflow-x-auto",
		children: componentProps.map((prop) => {
			const value_0 = previewProps[prop.name];
			const propType = String(prop.type || "");
			const isBoolean = typeof value_0 === "boolean" || typeof prop.defaultValue === "boolean" || propType.includes("boolean");
			const isNumber = typeof value_0 === "number" || typeof prop.defaultValue === "number" || /number/.test(propType) && !propType.includes("string");
			const options = prop.options;
			if (isBoolean) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "xs",
				variant: value_0 ? "secondary" : "outline",
				"aria-pressed": Boolean(value_0),
				onClick: () => handlePropChange(prop.name, !value_0),
				children: [
					prop.name,
					": ",
					String(value_0 ?? false)
				]
			}, prop.name);
			if (options && options.length > 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					children: [prop.name, ":"]
				}), options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: value_0 === opt ? "secondary" : "outline",
					"aria-pressed": value_0 === opt,
					onClick: () => handlePropChange(prop.name, opt),
					children: opt
				}, opt))]
			}, prop.name);
			if (isNumber) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					children: [prop.name, ":"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					size: "xs",
					type: "number",
					"aria-label": prop.name,
					className: "w-16",
					value: value_0 === void 0 || value_0 === null ? "" : String(value_0),
					onChange: (e) => {
						const next = e.target.value;
						handlePropChange(prop.name, next === "" ? 0 : Number(next));
					}
				})]
			}, prop.name);
			if (typeof value_0 === "string" || typeof prop.defaultValue === "string" || propType.includes("string") || value_0 === void 0 || value_0 === null) {
				if (value_0 !== null && typeof value_0 === "object") return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
						size: "3xs",
						variant: "tertiary",
						children: [prop.name, ":"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						size: "xs",
						"aria-label": prop.name,
						className: "w-24",
						value: String(value_0 ?? prop.defaultValue ?? ""),
						onChange: (e_0) => handlePropChange(prop.name, e_0.target.value)
					})]
				}, prop.name);
			}
			return null;
		})
	});
	let t30;
	if ($[47] !== PreviewComp || $[48] !== activeTab || $[49] !== compilePreview || $[50] !== editorExtensions || $[51] !== isCompiling || $[52] !== isLoadingContent || $[53] !== previewProps || $[54] !== selectedVersion || $[55] !== sourceCode) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 min-h-0 overflow-hidden",
			children: isLoadingContent || isCompiling ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					children: isCompiling ? "Loading preview..." : "Loading..."
				})
			}) : activeTab === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full flex items-start justify-center p-8 overflow-auto bg-[#fafafa]",
				children: PreviewComp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewErrorBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewComp, { ...previewProps })
				}) }, selectedVersion || "current") : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center justify-center h-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						variant: "tertiary",
						children: compilePreview ? "Could not compile preview" : "Preview not available"
					})
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReactCodeMirror, {
				value: sourceCode || "// No code to display",
				height: "100%",
				className: `${CODE_EDITOR_CLASS} h-full`,
				extensions: editorExtensions,
				editable: false,
				basicSetup: {
					lineNumbers: true,
					highlightActiveLineGutter: false,
					highlightActiveLine: false,
					foldGutter: true
				}
			})
		});
		$[47] = PreviewComp;
		$[48] = activeTab;
		$[49] = compilePreview;
		$[50] = editorExtensions;
		$[51] = isCompiling;
		$[52] = isLoadingContent;
		$[53] = previewProps;
		$[54] = selectedVersion;
		$[55] = sourceCode;
		$[56] = t30;
	} else t30 = $[56];
	let t31;
	if ($[57] !== t28 || $[58] !== t29 || $[59] !== t30) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t22,
			children: [
				t28,
				t29,
				t30
			]
		});
		$[57] = t28;
		$[58] = t29;
		$[59] = t30;
		$[60] = t31;
	} else t31 = $[60];
	let t32;
	if ($[61] === Symbol.for("react.memo_cache_sentinel")) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-between px-5 py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				weight: "medium",
				children: "Versions"
			})
		});
		$[61] = t32;
	} else t32 = $[61];
	let t33;
	if ($[62] !== isLoading || $[63] !== selectedVersion || $[64] !== setSelectedVersion || $[65] !== versions) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-[280px] flex flex-col shrink-0",
			children: [t32, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						variant: "tertiary",
						children: "Loading versions..."
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: `w-full text-left px-4 py-3 hover:bg-ed-muted/50 ${selectedVersion === null ? "bg-ed-muted/70" : ""}`,
						onClick: () => setSelectedVersion(null),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								size: "2xs",
								weight: "medium",
								children: "Current version"
							}), selectedVersion === null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "text-[11px]",
								children: "Current"
							})]
						})
					}), versions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							variant: "tertiary",
							children: "No previous versions yet. Versions are created each time you save to code."
						})
					}) : versions.map((version) => {
						const date = new Date(version.createdAt);
						const timeAgo = getTimeAgo(date);
						const isSelected = selectedVersion === version.filename;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: `w-full text-left px-4 py-3 hover:bg-ed-muted/50 ${isSelected ? "bg-ed-muted/70" : ""}`,
							onClick: () => setSelectedVersion(version.filename),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									size: "2xs",
									weight: "medium",
									children: timeAgo
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2 shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
										size: "3xs",
										variant: "tertiary",
										children: formatDate(date)
									})
								})]
							})
						}, version.filename);
					})]
				})
			})]
		});
		$[62] = isLoading;
		$[63] = selectedVersion;
		$[64] = setSelectedVersion;
		$[65] = versions;
		$[66] = t33;
	} else t33 = $[66];
	let t34;
	if ($[67] !== t31 || $[68] !== t33) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t21,
			children: [t31, t33]
		});
		$[67] = t31;
		$[68] = t33;
		$[69] = t34;
	} else t34 = $[69];
	let t35;
	if ($[70] !== T1 || $[71] !== t18 || $[72] !== t20 || $[73] !== t34) {
		t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T1, {
			className: t17,
			"aria-describedby": t18,
			children: [t20, t34]
		});
		$[70] = T1;
		$[71] = t18;
		$[72] = t20;
		$[73] = t34;
		$[74] = t35;
	} else t35 = $[74];
	let t36;
	if ($[75] !== T0 || $[76] !== t16 || $[77] !== t35) {
		t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(T0, {
			open: t15,
			onOpenChange: t16,
			children: t35
		});
		$[75] = T0;
		$[76] = t16;
		$[77] = t35;
		$[78] = t36;
	} else t36 = $[78];
	return t36;
}

export { VersionHistoryModal };
