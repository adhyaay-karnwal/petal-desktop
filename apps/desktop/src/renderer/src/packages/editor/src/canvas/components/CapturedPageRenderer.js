// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CapturedPageRenderer.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { Input } from "../../../../ui/src/components/Input.js";
import { getChildren$2, walk } from "../../../../compiler/src/store/read.js";
import { storeSubtreeToLegacyNested } from "../../../../compiler/src/store/legacy.js";
import { describeOperation, squashOperations, useOperationLog } from "../../shared/utils/captureStore.js";
import { detectRepoRootFromCapture } from "../utils/fiberExtract.js";
import { getRememberedRoot, setRememberedRoot } from "../../shared/lib/projectRootStore.js";

/**
* CapturedPageRenderer — renders a captured page element in the Edit frame
* with a browser-chrome toolbar and a changes sidebar.
*/
/** POSIX `/foo` or Windows `C:\foo` / `C:/foo`. */
function isAbsolutePath(p) {
	if (!p) return false;
	if (p.startsWith("/")) return true;
	return /^[a-zA-Z]:[\\/]/.test(p);
}
/** Reads the Electron folder-picker bridge, if this build exposes it. */
function getElectronApi() {
	if (typeof window === "undefined") return void 0;
	return window.api;
}
/**
* Asks the Electron main process for a folder. The optional-call chain has to
* live here: the compiler rejects optional chaining and other value blocks
* inside a `try`/`catch`, so `handlePickFolder` cannot hold it directly.
*/
async function pickFolder$1() {
	const api = getElectronApi();
	if (!api?.invoke) return void 0;
	const picked = (await api.invoke("pick_folder"))?.path;
	return typeof picked === "string" && isAbsolutePath(picked) ? picked : void 0;
}
function CapturedPageRenderer(t0) {
	const $ = (0, import_compiler_runtime.c)(111);
	const { element, store, options, renderChild } = t0;
	const sourceUrl = element.props?.["data-source-url"] || "";
	let names;
	if ($[0] !== element.id || $[1] !== element.props || $[2] !== store) {
		names = /* @__PURE__ */ new Set();
		walk(store, element.id, (descendantId) => {
			const el = store.byId.get(descendantId);
			if (!el) return;
			if (el.type === "component") names.add(el.componentName);
			else if (el.type === "html") {
				const name = el.props?.["data-component"];
				if (name && name !== "CapturedPage") names.add(name);
			}
		});
		if (element.props?.["data-component"] && element.props["data-component"] !== "CapturedPage") names.add(element.props["data-component"]);
		$[0] = element.id;
		$[1] = element.props;
		$[2] = store;
		$[3] = names;
	} else names = $[3];
	const componentNames = names;
	const ops = useOperationLog(element.id);
	let t1;
	if ($[4] !== ops || $[5] !== store) {
		const squashed = squashOperations(ops, store);
		let t2;
		if ($[7] !== store) {
			t2 = (op) => describeOperation(op, store);
			$[7] = store;
			$[8] = t2;
		} else t2 = $[8];
		t1 = squashed.map(t2).filter(_temp$102);
		$[4] = ops;
		$[5] = store;
		$[6] = t1;
	} else t1 = $[6];
	const descriptions = t1;
	const legacyChildren = storeSubtreeToLegacyNested(store, element.id).children ?? [];
	let t2;
	if ($[9] !== descriptions) {
		t2 = descriptions.filter(_temp2$65);
		$[9] = descriptions;
		$[10] = t2;
	} else t2 = $[10];
	const astCount = t2.length;
	const aiCount = descriptions.length - astCount;
	const [isPreparing, setIsPreparing] = (0, import_react.useState)(false);
	const [showAllowPathPrompt, setShowAllowPathPrompt] = (0, import_react.useState)(false);
	const projectId = options.projectId;
	let t3;
	if ($[11] !== projectId || $[12] !== sourceUrl) {
		t3 = () => projectId ? getRememberedRoot(projectId, sourceUrl) : null;
		$[11] = projectId;
		$[12] = sourceUrl;
		$[13] = t3;
	} else t3 = $[13];
	const [manualRoot, setManualRoot] = (0, import_react.useState)(t3);
	const [pendingManualInput, setPendingManualInput] = (0, import_react.useState)("");
	const isElectron = typeof window !== "undefined" && Boolean(window.api?.invoke);
	let t4;
	if ($[14] !== setPendingManualInput) {
		t4 = async () => {
			try {
				const picked = await pickFolder$1();
				if (picked) setPendingManualInput(picked);
			} catch {}
		};
		$[14] = setPendingManualInput;
		$[15] = t4;
	} else t4 = $[15];
	const handlePickFolder = t4;
	const treeRoot = element.props?.["data-detected-repo-root"] || detectRepoRootFromCapture(legacyChildren);
	let t5;
	if ($[16] !== descriptions || $[17] !== treeRoot) {
		const opFilePaths = descriptions.map(_temp3$47).filter(_temp4$41);
		t5 = treeRoot || (opFilePaths.length === 0 ? null : detectRepoRootFromCapture(opFilePaths.map(_temp5$35)));
		$[16] = descriptions;
		$[17] = treeRoot;
		$[18] = t5;
	} else t5 = $[18];
	const autoDetectedRepoRoot = t5;
	const detectedRepoRoot = autoDetectedRepoRoot || manualRoot;
	let t6;
	if ($[19] !== componentNames || $[20] !== descriptions || $[21] !== element.id || $[22] !== options.onSaveToCode || $[23] !== setIsPreparing || $[24] !== sourceUrl) {
		t6 = (rootForSave) => {
			const onSaveToCode = options.onSaveToCode;
			if (!onSaveToCode) return;
			const names_0 = [...componentNames];
			setIsPreparing(true);
			return onSaveToCode("", descriptions, sourceUrl, names_0, element.id, rootForSave ?? void 0).catch(_temp6$29).finally(() => setIsPreparing(false));
		};
		$[19] = componentNames;
		$[20] = descriptions;
		$[21] = element.id;
		$[22] = options.onSaveToCode;
		$[23] = setIsPreparing;
		$[24] = sourceUrl;
		$[25] = t6;
	} else t6 = $[25];
	const proceedWithSave = t6;
	let t7;
	if ($[26] !== autoDetectedRepoRoot || $[27] !== detectedRepoRoot || $[28] !== isPreparing || $[29] !== options.allowedPaths || $[30] !== options.onSaveToCode || $[31] !== proceedWithSave || $[32] !== setPendingManualInput || $[33] !== setShowAllowPathPrompt) {
		t7 = async () => {
			if (!options.onSaveToCode || isPreparing) return;
			const allowedPaths = options.allowedPaths || [];
			const covered = (p_1) => allowedPaths.some((a) => p_1 === a || p_1.startsWith(a + "/"));
			if (!detectedRepoRoot || (autoDetectedRepoRoot ? !covered(autoDetectedRepoRoot) : false)) {
				setPendingManualInput(autoDetectedRepoRoot ?? "");
				setShowAllowPathPrompt(true);
				return;
			}
			await proceedWithSave(detectedRepoRoot);
		};
		$[26] = autoDetectedRepoRoot;
		$[27] = detectedRepoRoot;
		$[28] = isPreparing;
		$[29] = options.allowedPaths;
		$[30] = options.onSaveToCode;
		$[31] = proceedWithSave;
		$[32] = setPendingManualInput;
		$[33] = setShowAllowPathPrompt;
		$[34] = t7;
	} else t7 = $[34];
	const handleSaveToCode = t7;
	let t8;
	if ($[35] !== autoDetectedRepoRoot || $[36] !== options || $[37] !== pendingManualInput || $[38] !== proceedWithSave || $[39] !== projectId || $[40] !== setManualRoot || $[41] !== setShowAllowPathPrompt || $[42] !== sourceUrl) {
		t8 = () => {
			const path = pendingManualInput.trim();
			if (!isAbsolutePath(path)) return;
			if (path !== autoDetectedRepoRoot && projectId) {
				setRememberedRoot(projectId, sourceUrl, path);
				setManualRoot(path);
			}
			options.onAddAllowedPath?.(path);
			setShowAllowPathPrompt(false);
			proceedWithSave(path);
		};
		$[35] = autoDetectedRepoRoot;
		$[36] = options;
		$[37] = pendingManualInput;
		$[38] = proceedWithSave;
		$[39] = projectId;
		$[40] = setManualRoot;
		$[41] = setShowAllowPathPrompt;
		$[42] = sourceUrl;
		$[43] = t8;
	} else t8 = $[43];
	const handleSubmitManualRoot = t8;
	let t9;
	if ($[44] !== element.id || $[45] !== options || $[46] !== renderChild || $[47] !== store) {
		const childOptions = {
			...options,
			_currentParentId: element.id
		};
		t9 = getChildren$2(store, element.id).map((childId) => renderChild(childId, childOptions));
		$[44] = element.id;
		$[45] = options;
		$[46] = renderChild;
		$[47] = store;
		$[48] = t9;
	} else t9 = $[48];
	const renderedChildren = t9;
	const contentWidth = element.styles?.width || 800;
	const contentHeight = element.styles?.minHeight || 600;
	const t10 = element.id;
	let t11;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = {
			position: "relative",
			fontSize: 14,
			lineHeight: 1.6
		};
		$[49] = t11;
	} else t11 = $[49];
	let t12;
	if ($[50] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = {
			height: 18,
			cursor: "grab"
		};
		$[50] = t12;
	} else t12 = $[50];
	let t13;
	let t14;
	if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-select-zone": "",
			className: "flex items-center justify-center",
			style: t12,
			"data-drag-grip": "",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-border",
				style: {
					width: 36,
					height: 4,
					borderRadius: 999
				}
			})
		});
		t14 = {
			display: "flex",
			gap: 8
		};
		$[51] = t13;
		$[52] = t14;
	} else {
		t13 = $[51];
		t14 = $[52];
	}
	let t15;
	if ($[53] !== contentHeight || $[54] !== contentWidth) {
		t15 = {
			width: contentWidth,
			minHeight: contentHeight,
			overflow: "auto",
			flexShrink: 0,
			borderRadius: 15
		};
		$[53] = contentHeight;
		$[54] = contentWidth;
		$[55] = t15;
	} else t15 = $[55];
	let t16;
	if ($[56] !== renderedChildren || $[57] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-select-zone": "self",
			className: "bg-background border-border border",
			style: t15,
			children: renderedChildren
		});
		$[56] = renderedChildren;
		$[57] = t15;
		$[58] = t16;
	} else t16 = $[58];
	const t17 = options.onSaveToCode ? handleSaveToCode : void 0;
	let t18;
	if ($[59] !== aiCount || $[60] !== astCount || $[61] !== descriptions || $[62] !== isPreparing || $[63] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangesSidebar, {
			descriptions,
			astCount,
			aiCount,
			isPreparing,
			onSaveToCode: t17
		});
		$[59] = aiCount;
		$[60] = astCount;
		$[61] = descriptions;
		$[62] = isPreparing;
		$[63] = t17;
		$[64] = t18;
	} else t18 = $[64];
	let t19;
	if ($[65] !== t16 || $[66] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t14,
			children: [t16, t18]
		});
		$[65] = t16;
		$[66] = t18;
		$[67] = t19;
	} else t19 = $[67];
	const t20 = autoDetectedRepoRoot ? "Confirm project root" : "Select project root";
	let t21;
	if ($[68] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t20 }) });
		$[68] = t20;
		$[69] = t21;
	} else t21 = $[69];
	const t22 = autoDetectedRepoRoot ? "We auto-detected this project’s root. Confirm or change it before saving. The AI reads and edits files under this path." : "We couldn’t auto-detect this project’s root from its source maps (common in monorepo, Nx, or TanStack Start setups). Paste the absolute path. We’ll remember it for this dev URL.";
	let t23;
	if ($[70] !== t22) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t22 })
		});
		$[70] = t22;
		$[71] = t23;
	} else t23 = $[71];
	let t24;
	if ($[72] === Symbol.for("react.memo_cache_sentinel")) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: "projectRootPath",
			className: "text-ed-ui leading-4 font-medium text-ed-foreground",
			children: "Project root"
		});
		$[72] = t24;
	} else t24 = $[72];
	let t25;
	if ($[73] !== setPendingManualInput) {
		t25 = (e) => setPendingManualInput(e.target.value);
		$[73] = setPendingManualInput;
		$[74] = t25;
	} else t25 = $[74];
	let t26;
	if ($[75] !== handleSubmitManualRoot || $[76] !== pendingManualInput) {
		t26 = (e_0) => {
			if (e_0.key === "Enter" && isAbsolutePath(pendingManualInput.trim())) handleSubmitManualRoot();
		};
		$[75] = handleSubmitManualRoot;
		$[76] = pendingManualInput;
		$[77] = t26;
	} else t26 = $[77];
	let t27;
	if ($[78] !== pendingManualInput || $[79] !== t25 || $[80] !== t26) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: "projectRootPath",
			size: "xs",
			type: "text",
			autoFocus: true,
			value: pendingManualInput,
			onChange: t25,
			onKeyDown: t26,
			placeholder: "/Users/you/code/your-project",
			className: "font-mono"
		});
		$[78] = pendingManualInput;
		$[79] = t25;
		$[80] = t26;
		$[81] = t27;
	} else t27 = $[81];
	let t28;
	if ($[82] !== handlePickFolder) {
		t28 = isElectron && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			className: "shrink-0",
			onClick: handlePickFolder,
			children: "Browse…"
		});
		$[82] = handlePickFolder;
		$[83] = t28;
	} else t28 = $[83];
	let t29;
	if ($[84] !== t27 || $[85] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
			className: "gap-2",
			children: [t24, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [t27, t28]
			})]
		});
		$[84] = t27;
		$[85] = t28;
		$[86] = t29;
	} else t29 = $[86];
	let t30;
	if ($[87] !== setShowAllowPathPrompt) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "xs",
			onClick: () => setShowAllowPathPrompt(false),
			children: "Cancel"
		});
		$[87] = setShowAllowPathPrompt;
		$[88] = t30;
	} else t30 = $[88];
	let t31;
	if ($[89] !== pendingManualInput) {
		t31 = isAbsolutePath(pendingManualInput.trim());
		$[89] = pendingManualInput;
		$[90] = t31;
	} else t31 = $[90];
	const t32 = !t31;
	const t33 = autoDetectedRepoRoot && pendingManualInput.trim() === autoDetectedRepoRoot ? "Add path & continue" : "Use this root";
	let t34;
	if ($[91] !== handleSubmitManualRoot || $[92] !== t32 || $[93] !== t33) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "xs",
			onClick: handleSubmitManualRoot,
			disabled: t32,
			children: t33
		});
		$[91] = handleSubmitManualRoot;
		$[92] = t32;
		$[93] = t33;
		$[94] = t34;
	} else t34 = $[94];
	let t35;
	if ($[95] !== t30 || $[96] !== t34) {
		t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t30, t34] });
		$[95] = t30;
		$[96] = t34;
		$[97] = t35;
	} else t35 = $[97];
	let t36;
	if ($[98] !== t21 || $[99] !== t23 || $[100] !== t29 || $[101] !== t35) {
		t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			t21,
			t23,
			t29,
			t35
		] });
		$[98] = t21;
		$[99] = t23;
		$[100] = t29;
		$[101] = t35;
		$[102] = t36;
	} else t36 = $[102];
	let t37;
	if ($[103] !== setShowAllowPathPrompt || $[104] !== showAllowPathPrompt || $[105] !== t36) {
		t37 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: showAllowPathPrompt,
			onOpenChange: setShowAllowPathPrompt,
			children: t36
		});
		$[103] = setShowAllowPathPrompt;
		$[104] = showAllowPathPrompt;
		$[105] = t36;
		$[106] = t37;
	} else t37 = $[106];
	let t38;
	if ($[107] !== element.id || $[108] !== t19 || $[109] !== t37) {
		t38 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-element-id": t10,
			style: t11,
			children: [
				t13,
				t19,
				t37
			]
		});
		$[107] = element.id;
		$[108] = t19;
		$[109] = t37;
		$[110] = t38;
	} else t38 = $[110];
	return t38;
}
function _temp6$29() {}
function _temp5$35(p_0) {
	return { sourceInfo: { filePath: p_0 } };
}
function _temp4$41(p) {
	return !!p;
}
function _temp3$47(d_1) {
	return d_1.sourceInfo?.filePath;
}
function _temp2$65(d_0) {
	return d_0.method === "ast";
}
function _temp$102(d) {
	return !d.canvasOnly;
}
function ChangesSidebar(t0) {
	const $ = (0, import_compiler_runtime.c)(29);
	const { descriptions, astCount, aiCount, isPreparing, onSaveToCode } = t0;
	const changes = descriptions;
	const canSave = !isPreparing && changes.length > 0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			width: 340,
			minHeight: "100%",
			display: "flex",
			flexDirection: "column",
			borderRadius: 15,
			fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
			alignSelf: "stretch"
		};
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			padding: "12px 16px",
			display: "flex",
			alignItems: "center",
			gap: 8,
			paddingTop: 12
		};
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-base font-semibold text-foreground",
			children: "Changes"
		});
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	let t4;
	if ($[3] !== changes.length) {
		t4 = changes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "bg-muted text-muted-foreground text-xs font-medium",
			style: {
				minWidth: 22,
				height: 22,
				padding: "0 7px",
				borderRadius: 999,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center"
			},
			children: changes.length
		});
		$[3] = changes.length;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border",
			style: t2,
			children: [t3, t4]
		});
		$[5] = t4;
		$[6] = t5;
	} else t5 = $[6];
	let t6;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = {
			flex: 1,
			overflowY: "auto",
			padding: "8px 0"
		};
		$[7] = t6;
	} else t6 = $[7];
	let t7;
	if ($[8] !== changes) {
		t7 = changes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-muted-foreground",
			style: {
				padding: "24px 16px",
				textAlign: "center",
				fontSize: 13
			},
			children: "No changes yet. Edit layers to see changes here."
		}) : changes.map(_temp7$22);
		$[8] = changes;
		$[9] = t7;
	} else t7 = $[9];
	let t8;
	if ($[10] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t6,
			children: t7
		});
		$[10] = t7;
		$[11] = t8;
	} else t8 = $[11];
	let t9;
	if ($[12] !== aiCount || $[13] !== astCount || $[14] !== changes.length) {
		t9 = changes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border",
			style: {
				padding: "10px 16px",
				display: "flex",
				alignItems: "center",
				gap: 14
			},
			children: [astCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodBadge, { method: "ast" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [astCount, " source known"]
				})]
			}), aiCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				style: {
					display: "flex",
					alignItems: "center",
					gap: 6
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodBadge, { method: "ai" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [aiCount, " needs AI"]
				})]
			})]
		});
		$[12] = aiCount;
		$[13] = astCount;
		$[14] = changes.length;
		$[15] = t9;
	} else t9 = $[15];
	let t10;
	if ($[16] !== aiCount || $[17] !== astCount) {
		t10 = astCount === 0 && aiCount >= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border text-muted-foreground",
			style: {
				padding: "8px 16px",
				fontSize: 11,
				lineHeight: 1.4
			},
			children: "No source paths resolved — AI will have to search the codebase."
		});
		$[16] = aiCount;
		$[17] = astCount;
		$[18] = t10;
	} else t10 = $[18];
	let t11;
	if ($[19] !== canSave || $[20] !== isPreparing || $[21] !== onSaveToCode) {
		t11 = onSaveToCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { padding: 12 },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: (e) => {
					e.stopPropagation();
					onSaveToCode();
				},
				disabled: !canSave,
				className: "w-full",
				loading: isPreparing,
				children: isPreparing ? "Preparing…" : "Save to code"
			})
		});
		$[19] = canSave;
		$[20] = isPreparing;
		$[21] = onSaveToCode;
		$[22] = t11;
	} else t11 = $[22];
	let t12;
	if ($[23] !== t10 || $[24] !== t11 || $[25] !== t5 || $[26] !== t8 || $[27] !== t9) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-background border border-border overflow-hidden",
			style: t1,
			children: [
				t5,
				t8,
				t9,
				t10,
				t11
			]
		});
		$[23] = t10;
		$[24] = t11;
		$[25] = t5;
		$[26] = t8;
		$[27] = t9;
		$[28] = t12;
	} else t12 = $[28];
	return t12;
}
function _temp7$22(d, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeItem, { description: d }, i);
}
function ChangeItem(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { description } = t0;
	let label = description.summary;
	if (label.length > 80) label = label.slice(0, 80) + "…";
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = {
			padding: "10px 16px",
			display: "flex",
			gap: 12,
			alignItems: "flex-start"
		};
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== description.method) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodBadge, { method: description.method });
		$[1] = description.method;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = {
			display: "flex",
			flexDirection: "column",
			gap: 2,
			minWidth: 0,
			flex: 1
		};
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== description.componentName) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-semibold text-foreground block truncate min-w-0",
			children: description.componentName
		});
		$[4] = description.componentName;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== label) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground leading-snug block truncate min-w-0",
			children: label
		});
		$[6] = label;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t4 || $[9] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t3,
			children: [t4, t5]
		});
		$[8] = t4;
		$[9] = t5;
		$[10] = t6;
	} else t6 = $[10];
	let t7;
	if ($[11] !== t2 || $[12] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			style: t1,
			children: [t2, t6]
		});
		$[11] = t2;
		$[12] = t6;
		$[13] = t7;
	} else t7 = $[13];
	return t7;
}
function MethodBadge(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { method } = t0;
	const t1 = method === "ast" ? "bg-muted text-muted-foreground" : "bg-foreground/10 text-foreground";
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = {
			minWidth: 28,
			height: 20,
			padding: "0 6px",
			borderRadius: 4,
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			flexShrink: 0,
			fontSize: 10,
			fontWeight: 700,
			letterSpacing: "0.05em"
		};
		$[0] = t2;
	} else t2 = $[0];
	const t3 = method === "ast" ? "AST" : "AI";
	let t4;
	if ($[1] !== t1 || $[2] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t1,
			style: t2,
			children: t3
		});
		$[1] = t1;
		$[2] = t3;
		$[3] = t4;
	} else t4 = $[3];
	return t4;
}

export { CapturedPageRenderer };
