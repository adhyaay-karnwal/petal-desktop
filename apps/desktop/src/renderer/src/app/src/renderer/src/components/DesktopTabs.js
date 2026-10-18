// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/components/DesktopTabs.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../packages/cloud/src/hooks/useSession.js";
import { refetchStaleProjects, useUpdateProject } from "../../../../../packages/cloud/src/hooks/useProjects.js";
import { cn$2 } from "../../../../../packages/ui/src/lib/utils.js";
import { FileIcon } from "../../../../../packages/ui/src/icons.js";
import { Button } from "../../../../../packages/ui/src/components/Button.js";
import { n$3, n$7 } from "../../../../../vendor/@phosphor-icons/react.js";
import { InlineRenameInput, usePendingRename } from "../../../../../packages/ui/src/components/InlineRenameInput.js";
import { RippleLoader } from "../../../../../packages/ui/src/components/RippleLoader.js";
import { toast } from "../../../../../vendor/sonner.js";
import { useEditorThemeContext } from "../../../../../packages/ui/src/hooks/EditorThemeProvider.js";

/** Window chrome only; each file's editor and agents live in its own renderer. */
function DesktopTabs() {
	const $ = (0, import_compiler_runtime.c)(57);
	const { theme } = useEditorThemeContext();
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			tabs: [],
			activeProjectId: null
		};
		$[0] = t0;
	} else t0 = $[0];
	const [state, setState] = (0, import_react.useState)(t0);
	const [dimmed, setDimmed] = (0, import_react.useState)(false);
	const listRef = (0, import_react.useRef)(null);
	const updateProject = useUpdateProject();
	const [renamingId, setRenamingId] = (0, import_react.useState)(null);
	let t1;
	if ($[1] !== state.tabs) {
		t1 = (projectId) => state.tabs.find((tab) => tab.projectId === projectId)?.name;
		$[1] = state.tabs;
		$[2] = t1;
	} else t1 = $[2];
	const pendingName = usePendingRename(t1);
	let t2;
	let t3;
	if ($[3] !== theme) {
		t2 = () => {
			window.api.send("desktop_theme_set", theme);
		};
		t3 = [theme];
		$[3] = theme;
		$[4] = t2;
		$[5] = t3;
	} else {
		t2 = $[4];
		t3 = $[5];
	}
	(0, import_react.useEffect)(t2, t3);
	let t4;
	let t5;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => window.api.on("desktop_tab_bar_dimmed", setDimmed);
		t5 = [];
		$[6] = t4;
		$[7] = t5;
	} else {
		t4 = $[6];
		t5 = $[7];
	}
	(0, import_react.useEffect)(t4, t5);
	let t6;
	let t7;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			const unsubscribe = window.api.on("desktop_tabs_changed", setState);
			window.api.invoke("desktop_tabs_get").then(setState);
			return unsubscribe;
		};
		t7 = [];
		$[8] = t6;
		$[9] = t7;
	} else {
		t6 = $[8];
		t7 = $[9];
	}
	(0, import_react.useEffect)(t6, t7);
	let t8;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = () => {
			listRef.current?.querySelector("[aria-current=\"page\"]")?.scrollIntoView({
				block: "nearest",
				inline: "nearest"
			});
		};
		$[10] = t8;
	} else t8 = $[10];
	let t9;
	if ($[11] !== state.activeProjectId) {
		t9 = [state.activeProjectId];
		$[11] = state.activeProjectId;
		$[12] = t9;
	} else t9 = $[12];
	(0, import_react.useEffect)(t8, t9);
	let t10;
	let t11;
	if ($[13] !== state.activeProjectId) {
		t10 = () => {
			if (state.activeProjectId === null) refetchStaleProjects();
		};
		t11 = [state.activeProjectId];
		$[13] = state.activeProjectId;
		$[14] = t10;
		$[15] = t11;
	} else {
		t10 = $[14];
		t11 = $[15];
	}
	(0, import_react.useEffect)(t10, t11);
	const select = _temp2$1;
	const close = _temp4$1;
	let t12;
	let t13;
	if ($[16] !== renamingId) {
		t12 = () => {
			if (!renamingId) return;
			const commit = _temp5$1;
			const swallow = _temp6$1;
			const followUps = [
				"mousedown",
				"pointerup",
				"mouseup",
				"click",
				"dblclick",
				"auxclick",
				"contextmenu"
			];
			const onPress = (event_0) => {
				if (event_0.target === document.activeElement) return;
				swallow(event_0);
				commit();
				for (const type of followUps) window.addEventListener(type, swallow, true);
				window.addEventListener("pointerup", () => setTimeout(() => {
					for (const type_0 of followUps) window.removeEventListener(type_0, swallow, true);
				}), {
					capture: true,
					once: true
				});
			};
			window.addEventListener("pointerdown", onPress, true);
			window.api.invoke("desktop_tab_bar_renaming", true).catch(_temp7$1);
			const unsubscribe_0 = window.api.on("desktop_tab_bar_blur", commit);
			return () => {
				window.removeEventListener("pointerdown", onPress, true);
				unsubscribe_0();
				window.api.invoke("desktop_tab_bar_renaming", false).catch(_temp8$1);
			};
		};
		t13 = [renamingId];
		$[16] = renamingId;
		$[17] = t12;
		$[18] = t13;
	} else {
		t12 = $[17];
		t13 = $[18];
	}
	(0, import_react.useEffect)(t12, t13);
	let t14;
	if ($[19] !== pendingName || $[20] !== updateProject) {
		t14 = (projectId_2, name) => {
			if (!name) return;
			pendingName.hold(projectId_2, name);
			updateProject.mutate({
				projectId: projectId_2,
				name
			}, { onError: () => {
				pendingName.clear();
				toast.error("Couldn't rename file");
			} });
		};
		$[19] = pendingName;
		$[20] = updateProject;
		$[21] = t14;
	} else t14 = $[21];
	const rename = t14;
	const pick = _temp0$1;
	const onKeyDown = _temp1$1;
	let t15;
	if ($[22] !== renamingId) {
		t15 = renamingId ? { WebkitAppRegion: "no-drag" } : void 0;
		$[22] = renamingId;
		$[23] = t15;
	} else t15 = $[23];
	let t16;
	if ($[24] !== dimmed) {
		t16 = dimmed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 bg-black/50",
			style: { WebkitAppRegion: "no-drag" },
			onMouseDown: _temp11$1
		});
		$[24] = dimmed;
		$[25] = t16;
	} else t16 = $[25];
	const t17 = state.activeProjectId === null ? "outline" : "ghost";
	let t18;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = { side: "right" };
		$[26] = t18;
	} else t18 = $[26];
	const t19 = state.activeProjectId === null ? "page" : void 0;
	let t20;
	if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = () => select(null);
		$[27] = t20;
	} else t20 = $[27];
	const t21 = state.activeProjectId !== null && "border-transparent text-ed-foreground-secondary";
	let t22;
	if ($[28] !== t21) {
		t22 = cn$2("size-7 border shadow-none", t21);
		$[28] = t21;
		$[29] = t22;
	} else t22 = $[29];
	let t23;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			className: "size-4",
			width: "16",
			height: "16",
			viewBox: "0 0 16 16",
			fill: "none",
			xmlns: "http://www.w3.org/2000/svg",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M2.53796 14H13.5L13.4622 7.19974C13.4623 7.13121 13.4495 7.06333 13.4244 7C13.3994 6.93667 13.3628 6.87911 13.3165 6.83062L8.37151 2.15301C8.32523 2.10451 8.27028 2.06602 8.20979 2.03977C8.1493 2.01351 8.08446 2 8.01898 2C7.9535 2 7.88866 2.01351 7.82817 2.03977C7.76768 2.06602 7.71273 2.10451 7.66645 2.15301L2.64595 6.83062C2.59969 6.87911 2.56301 6.93667 2.538 7C2.513 7.06333 2.50015 7.13121 2.5002 7.19974L2.53796 14Z",
				stroke: "currentColor",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		});
		$[30] = t23;
	} else t23 = $[30];
	let t24;
	if ($[31] !== t17 || $[32] !== t19 || $[33] !== t22) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			"data-project-tab": true,
			variant: t17,
			size: "icon-xs",
			isChildText: false,
			"aria-label": "Home",
			title: "Home",
			tooltipProps: t18,
			"aria-current": t19,
			onClick: t20,
			className: t22,
			children: t23
		});
		$[31] = t17;
		$[32] = t19;
		$[33] = t22;
		$[34] = t24;
	} else t24 = $[34];
	let t25;
	if ($[35] !== pendingName || $[36] !== rename || $[37] !== renamingId || $[38] !== state.activeProjectId || $[39] !== state.tabs) {
		let t26;
		if ($[41] !== pendingName || $[42] !== rename || $[43] !== renamingId || $[44] !== state.activeProjectId) {
			t26 = (tab_0) => {
				const name_0 = pendingName.nameOf(tab_0.projectId, tab_0.name);
				const status = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex size-4 shrink-0 items-center justify-center",
					role: tab_0.loading || tab_0.working || tab_0.hasUnreadCompletion ? "status" : void 0,
					"aria-label": tab_0.loading ? "Loading file" : tab_0.working ? "Agent working" : tab_0.hasUnreadCompletion ? "Agent finished" : void 0,
					children: tab_0.loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, { className: "size-4" }) : tab_0.working ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RippleLoader, {
						size: 16,
						grid: 11
					}) : tab_0.hasUnreadCompletion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-ed-canvas-selection" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, { className: "size-4" })
				});
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn$2("group/project-tab desktop-project-tab", state.activeProjectId === tab_0.projectId && "desktop-project-tab-active", renamingId === tab_0.projectId && "desktop-project-tab-renaming"),
					children: [renamingId === tab_0.projectId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "desktop-project-select",
						children: [status, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineRenameInput, {
							className: "-mr-0.5",
							"aria-label": "File name",
							value: name_0,
							onCommit: (next_0) => rename(tab_0.projectId, next_0),
							onDone: () => setRenamingId(null)
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-project-tab": true,
						disabled: tab_0.loading,
						"aria-busy": tab_0.loading,
						"aria-current": state.activeProjectId === tab_0.projectId ? "page" : void 0,
						className: "desktop-project-select",
						onClick: () => select(tab_0.projectId),
						onDoubleClick: tab_0.canRename ? () => setRenamingId(tab_0.projectId) : void 0,
						title: `${name_0}${tab_0.loading ? " · Loading file" : tab_0.working ? " · Agent working" : tab_0.hasUnreadCompletion ? " · Agent finished" : ""}`,
						children: [status, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: name_0
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon-2xs",
						isChildText: false,
						className: "desktop-project-close",
						"aria-label": `Close ${name_0}`,
						onClick: () => close(tab_0.projectId),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$3, { className: "size-3" })
					})]
				}, tab_0.projectId);
			};
			$[41] = pendingName;
			$[42] = rename;
			$[43] = renamingId;
			$[44] = state.activeProjectId;
			$[45] = t26;
		} else t26 = $[45];
		t25 = state.tabs.map(t26);
		$[35] = pendingName;
		$[36] = rename;
		$[37] = renamingId;
		$[38] = state.activeProjectId;
		$[39] = state.tabs;
		$[40] = t25;
	} else t25 = $[40];
	let t26;
	if ($[46] !== t25) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: listRef,
			className: "desktop-project-tabs",
			children: t25
		});
		$[46] = t25;
		$[47] = t26;
	} else t26 = $[47];
	let t27;
	if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = { side: "right" };
		$[48] = t27;
	} else t27 = $[48];
	let t28;
	if ($[49] === Symbol.for("react.memo_cache_sentinel")) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon-xs",
			isChildText: false,
			className: "size-7",
			title: "New tab",
			"aria-label": "New tab",
			tooltipProps: t27,
			onClick: pick,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$7, { className: "size-3.5" })
		});
		$[49] = t28;
	} else t28 = $[49];
	let t29;
	if ($[50] !== t24 || $[51] !== t26) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Open files",
			className: "desktop-tab-nav",
			onKeyDown,
			children: [
				t24,
				t26,
				t28
			]
		});
		$[50] = t24;
		$[51] = t26;
		$[52] = t29;
	} else t29 = $[52];
	let t30;
	if ($[53] !== t15 || $[54] !== t16 || $[55] !== t29) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "desktop-titlebar",
			style: t15,
			children: [t16, t29]
		});
		$[53] = t15;
		$[54] = t16;
		$[55] = t29;
		$[56] = t30;
	} else t30 = $[56];
	return t30;
}
function _temp11$1() {
	window.api.invoke("desktop_palette_dismiss").catch(_temp10$1);
}
function _temp10$1() {}
function _temp1$1(event_1) {
	if (![
		"ArrowLeft",
		"ArrowRight",
		"Home",
		"End"
	].includes(event_1.key)) return;
	const buttons = Array.from(event_1.currentTarget.querySelectorAll("[data-project-tab]:not(:disabled)"));
	const index = buttons.indexOf(document.activeElement);
	if (index < 0) return;
	event_1.preventDefault();
	const next = event_1.key === "Home" ? 0 : event_1.key === "End" ? buttons.length - 1 : (index + (event_1.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
	buttons[next]?.focus();
	buttons[next]?.scrollIntoView({
		block: "nearest",
		inline: "nearest"
	});
}
function _temp0$1() {
	window.api.invoke("desktop_tabs_pick").catch(_temp9$1);
}
function _temp9$1() {
	return toast.error("Could not open file picker");
}
function _temp8$1() {}
function _temp7$1() {}
function _temp6$1(event) {
	event.preventDefault();
	event.stopPropagation();
}
function _temp5$1() {
	if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}
function _temp4$1(projectId_1) {
	window.api.invoke("desktop_tabs_close", { projectId: projectId_1 }).catch(_temp3$1);
}
function _temp3$1() {
	return toast.error("Could not close file");
}
function _temp2$1(projectId_0) {
	window.api.invoke("desktop_tabs_select", { projectId: projectId_0 }).catch(_temp$1);
}
function _temp$1() {
	return toast.error("Could not switch files");
}

export { DesktopTabs };
