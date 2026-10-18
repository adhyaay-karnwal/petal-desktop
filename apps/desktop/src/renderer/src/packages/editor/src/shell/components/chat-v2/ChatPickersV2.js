// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/ChatPickersV2.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { ArrowSquareOutIcon, ClaudeIcon, CursorAgentIcon, LightningIcon, LockIcon, OpenAiIcon, OpenCodeIcon, SearchIcon, SparkleIcon, TerminalIcon, XIcon } from "../../../../../ui/src/icons.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../../../../../ui/src/components/DropdownMenu.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../../../ui/src/components/InputGroup.js";
import { Switch } from "../../../../../ui/src/components/Switch.js";
import { ScrollArea } from "../../../../../ui/src/components/ScrollArea.js";
import { PanelEmptyState } from "../panels/PanelEmptyState.js";
import { setupCopy, upgradeDescription } from "./setupCopy.js";
import { isAgentSetUp, openUpgradePage } from "./useAgentSetup.js";
import { effortLabel } from "./effort.js";
import { filterModels, groupByProvider, splitLatestModels } from "./modelLines.js";

/**
* Composer picker for `ChatPanelV2`: agent, model, reasoning, permissions and
* fast mode in one menu.
*
* v1 chrome, v2 data: the model list is the agent's cached catalog
* (localStorage, refreshed in the background). Agents are tabs across the top;
* a tab switches the agent, so its catalog replaces the list below. The
* reasoning submenu renders exactly the efforts the selected model reports; it
* maps nothing. Fast mode shows only for a model that reports `supportsFast`.
* When the catalog has not been cached yet, the model label stays empty until
* the fetch returns.
*
* A catalog that mixes companies (Cursor, OpenCode) gets a submenu per
* provider; ordering and grouping live in `modelLines.ts`. The search field
* filters the shown agent's models and keeps focus while the menu is open.
*
* A tab for an agent that is not set up previews that agent's setup in place
* of the models, without switching. Closing the menu drops the preview; the
* chat switches only once setup leaves the agent ready (`ChatPanelV2`).
*/
/** Registry key → brand mark; unknown agents fall back to a terminal. */
var AGENT_ICONS = {
	"claude-code": ClaudeIcon,
	codex: OpenAiIcon,
	opencode: OpenCodeIcon,
	cursor: CursorAgentIcon
};
/** Row highlight on hover, since hovering a row no longer focuses it (see `AgentModelPickerV2`). */
var ROW_HOVER = "[&_[role^=menuitem]:hover]:bg-ed-accent";
/** A submenu closes when focus leaves it; focus returning to the model search is not leaving. */
function keepOpenForSearch(event) {
	if (event.target instanceof Element && event.target.hasAttribute("data-model-search")) event.preventDefault();
}
var PERMISSION_MODES = [{
	value: "auto",
	label: "Auto",
	icon: SparkleIcon,
	description: "Approve routine actions automatically. Ask when needed."
}, {
	value: "ask",
	label: "Ask first",
	icon: LockIcon,
	description: "Ask before using tools that are not already allowed."
}];
function AgentModelPickerV2(t0) {
	const $ = (0, import_compiler_runtime.c)(80);
	const { agents, agentId, onAgentChange, agentLocked: t1, models, modelId, onModelChange, efforts, effort, onEffortChange, policy, onPolicyChange, fast, onFastChange, agentNeedsSetup: t2, agentStatus: t3, checkAgentStatus, onSetUpAgent, onManageAgent } = t0;
	const agentLocked = t1 === void 0 ? false : t1;
	const agentNeedsSetup = t2 === void 0 ? false : t2;
	const agentStatus = t3 === void 0 ? null : t3;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [previewId, setPreviewId] = (0, import_react.useState)(null);
	const [pendingId, setPendingId] = (0, import_react.useState)(null);
	const targetRef = (0, import_react.useRef)(null);
	let t4;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = {};
		$[0] = t4;
	} else t4 = $[0];
	const [statuses, setStatuses] = (0, import_react.useState)(t4);
	const [query, setQuery] = (0, import_react.useState)("");
	const searchRef = (0, import_react.useRef)(null);
	const navigatingByKeyRef = (0, import_react.useRef)(false);
	const reset = () => {
		targetRef.current = null;
		setPendingId(null);
		setPreviewId(null);
	};
	const settle = (id, status) => {
		if (targetRef.current !== id) return;
		if (isAgentSetUp(status)) {
			reset();
			onAgentChange?.(id);
		} else {
			setPendingId(null);
			setPreviewId(id);
		}
	};
	const fetchStatus = (id_0) => {
		if (!checkAgentStatus) return;
		checkAgentStatus(id_0).then(_temp$29, _temp2$17).then((status_1) => {
			setStatuses((prev) => ({
				...prev,
				[id_0]: status_1
			}));
			settle(id_0, status_1);
		});
	};
	const selectAgent = (id_1) => {
		if (id_1 === agentId) return reset();
		if (!checkAgentStatus) {
			reset();
			onAgentChange?.(id_1);
			return;
		}
		targetRef.current = id_1;
		if (id_1 in statuses) settle(id_1, statuses[id_1] ?? null);
		else setPendingId(id_1);
		fetchStatus(id_1);
	};
	const prefetchStatuses = () => {
		for (const agent of agents) if (agent.id !== agentId && !(agent.id in statuses)) fetchStatus(agent.id);
	};
	const [body, setBody] = (0, import_react.useState)(null);
	const [modelsHeight, setModelsHeight] = (0, import_react.useState)(null);
	const setupId = previewId ?? (agentNeedsSetup ? agentId : null);
	let t5;
	if ($[1] !== agents || $[2] !== setupId) {
		t5 = setupId ? agents.find((agent_0) => agent_0.id === setupId) ?? {
			id: setupId,
			label: setupId
		} : null;
		$[1] = agents;
		$[2] = setupId;
		$[3] = t5;
	} else t5 = $[3];
	const setupAgent = t5;
	const showingSetup = setupAgent !== null;
	const AgentIcon = AGENT_ICONS[agentId] ?? TerminalIcon;
	let t6;
	if ($[4] !== agentId || $[5] !== agents) {
		t6 = agents.find((agent_1) => agent_1.id === agentId)?.label ?? agentId;
		$[4] = agentId;
		$[5] = agents;
		$[6] = t6;
	} else t6 = $[6];
	const agentLabel = t6;
	let t7;
	if ($[7] !== modelId || $[8] !== models) {
		let t8;
		if ($[10] !== modelId) {
			t8 = (entry) => entry.id === modelId;
			$[10] = modelId;
			$[11] = t8;
		} else t8 = $[11];
		t7 = models.find(t8);
		$[7] = modelId;
		$[8] = models;
		$[9] = t7;
	} else t7 = $[9];
	const model = t7;
	const fastOn = fast && Boolean(model?.supportsFast);
	const providerGroups = groupByProvider(models);
	const byProvider = providerGroups.some(_temp3$13);
	const t8 = byProvider ? [] : models;
	let t9;
	if ($[12] !== t8) {
		t9 = splitLatestModels(t8);
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	const { latest, more } = t9;
	let t10;
	if ($[14] !== models || $[15] !== query) {
		t10 = query.trim() ? filterModels(models, query) : null;
		$[14] = models;
		$[15] = query;
		$[16] = t10;
	} else t10 = $[16];
	const matches = t10;
	const searching = matches !== null;
	let t11;
	let t12;
	if ($[17] !== body || $[18] !== open || $[19] !== searching || $[20] !== showingSetup) {
		t11 = () => {
			if (!open || showingSetup || searching || !body) return;
			const observer = new ResizeObserver(() => {
				const height = body.offsetHeight;
				setModelsHeight((current) => current === height ? current : height);
			});
			observer.observe(body);
			return () => observer.disconnect();
		};
		t12 = [
			open,
			showingSetup,
			searching,
			body
		];
		$[17] = body;
		$[18] = open;
		$[19] = searching;
		$[20] = showingSetup;
		$[21] = t11;
		$[22] = t12;
	} else {
		t11 = $[21];
		t12 = $[22];
	}
	(0, import_react.useEffect)(t11, t12);
	const t13 = model?.label;
	let t14;
	if ($[23] !== effort) {
		t14 = effort && effortLabel(effort);
		$[23] = effort;
		$[24] = t14;
	} else t14 = $[24];
	const t15 = fastOn ? "fast" : void 0;
	let t16;
	if ($[25] !== agentLabel || $[26] !== t13 || $[27] !== t14 || $[28] !== t15) {
		t16 = [
			agentLabel,
			t13,
			t14,
			t15
		].filter(Boolean);
		$[25] = agentLabel;
		$[26] = t13;
		$[27] = t14;
		$[28] = t15;
		$[29] = t16;
	} else t16 = $[29];
	const triggerLabel = t16.join(", ");
	const T0 = DropdownMenu;
	const t17 = (next) => {
		setOpen(next);
		if (next) prefetchStatuses();
		else {
			reset();
			setQuery("");
			navigatingByKeyRef.current = false;
		}
	};
	const t18 = `Model: ${triggerLabel}`;
	let t19;
	if ($[30] !== AgentIcon) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentIcon, { className: "size-4 shrink-0" });
		$[30] = AgentIcon;
		$[31] = t19;
	} else t19 = $[31];
	const t20 = model?.label ?? "";
	let t21;
	if ($[32] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: t20
		});
		$[32] = t20;
		$[33] = t21;
	} else t21 = $[33];
	let t22;
	if ($[34] !== effort) {
		t22 = effort && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 opacity-60",
			children: effortLabel(effort)
		});
		$[34] = effort;
		$[35] = t22;
	} else t22 = $[35];
	let t23;
	if ($[36] !== fastOn) {
		t23 = fastOn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LightningIcon, {
			className: "size-3.5 shrink-0",
			"aria-hidden": true
		});
		$[36] = fastOn;
		$[37] = t23;
	} else t23 = $[37];
	let t24;
	if ($[38] !== t18 || $[39] !== t19 || $[40] !== t21 || $[41] !== t22 || $[42] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant: "ghost",
				size: "xs",
				isChildText: false,
				className: "min-w-0 shrink px-1 text-ed-muted-foreground",
				"aria-label": t18,
				title: "Agent and model",
				children: [
					t19,
					t21,
					t22,
					t23
				]
			})
		});
		$[38] = t18;
		$[39] = t19;
		$[40] = t21;
		$[41] = t22;
		$[42] = t23;
		$[43] = t24;
	} else t24 = $[43];
	const T1 = DropdownMenuContent;
	const t25 = false;
	const t26 = "start";
	const t27 = "top";
	const t28 = 4;
	let t29;
	let t30;
	let t31;
	let t32;
	if ($[44] === Symbol.for("react.memo_cache_sentinel")) {
		t29 = cn$2("flex max-h-(--radix-dropdown-menu-content-available-height) w-56 flex-col gap-0.5", ROW_HOVER);
		t30 = (event) => {
			navigatingByKeyRef.current = false;
			if (!searchRef.current || !(event.target instanceof Element)) return;
			const row = event.target.closest("[role^=\"menuitem\"]");
			if (!row || row.hasAttribute("aria-haspopup")) return;
			if (!row.closest("[role=\"menu\"]")?.querySelector("[aria-haspopup][data-state=\"open\"]")) event.preventDefault();
		};
		t31 = (event_0) => {
			if (!searchRef.current || !(event_0.target instanceof Element)) return;
			const row_0 = event_0.target.closest("[role^=\"menuitem\"]");
			if (row_0 && !row_0.hasAttribute("aria-haspopup")) event_0.preventDefault();
		};
		t32 = (event_1) => {
			const target = event_1.target;
			if (target === searchRef.current || navigatingByKeyRef.current) return;
			queueMicrotask(() => {
				if (document.activeElement === target && !navigatingByKeyRef.current) searchRef.current?.focus({ preventScroll: true });
			});
		};
		$[44] = t29;
		$[45] = t30;
		$[46] = t31;
		$[47] = t32;
	} else {
		t29 = $[44];
		t30 = $[45];
		t31 = $[46];
		t32 = $[47];
	}
	let t33;
	if ($[48] !== query) {
		t33 = (event_2) => {
			if (event_2.key.startsWith("Arrow") || event_2.key === "Home" || event_2.key === "End") navigatingByKeyRef.current = true;
			const search = searchRef.current;
			if (!search || event_2.target === search || event_2.metaKey || event_2.ctrlKey || event_2.altKey) return;
			if (!(event_2.key === " " ? query !== "" : event_2.key.length === 1 || event_2.key === "Backspace" || event_2.key === "Delete")) return;
			event_2.stopPropagation();
			navigatingByKeyRef.current = false;
			search.focus({ preventScroll: true });
		};
		$[48] = query;
		$[49] = t33;
	} else t33 = $[49];
	const t34 = agents.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "tablist",
		"aria-label": "Agent",
		className: "flex items-center gap-0.5",
		children: agents.map((agent_2) => {
			const Icon = AGENT_ICONS[agent_2.id] ?? TerminalIcon;
			const selected = agent_2.id === (pendingId ?? previewId ?? agentId);
			const locked = agentLocked && !selected;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": selected,
				"aria-label": agent_2.label,
				title: locked ? "Switch agents when this reply finishes." : agent_2.label,
				disabled: locked,
				onClick: () => selectAgent(agent_2.id),
				className: cn$2("flex size-6.5 items-center justify-center rounded outline-none focus-visible:bg-ed-accent disabled:opacity-50", selected ? "bg-ed-accent text-ed-foreground" : "text-ed-muted-foreground enabled:hover:text-ed-foreground"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			}, agent_2.id);
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: "-mx-1 my-1" })] });
	const t35 = "flex min-h-0 flex-col gap-0.5";
	let t36;
	if ($[50] !== modelsHeight || $[51] !== searching || $[52] !== setupAgent) {
		t36 = (setupAgent || searching) && modelsHeight ? { minHeight: modelsHeight } : void 0;
		$[50] = modelsHeight;
		$[51] = searching;
		$[52] = setupAgent;
		$[53] = t36;
	} else t36 = $[53];
	let t37;
	if ($[54] !== matches || $[55] !== onModelChange || $[56] !== query || $[57] !== reset || $[58] !== setupAgent) {
		t37 = !setupAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelSearch, {
			inputRef: searchRef,
			value: query,
			onChange: setQuery,
			onKeyDown: (event_3) => {
				if (event_3.key === "Escape") return;
				event_3.stopPropagation();
				if (event_3.key === "Enter" && matches?.[0]) {
					event_3.preventDefault();
					onModelChange?.(matches[0].id);
					setOpen(false);
					reset();
					setQuery("");
				} else if (event_3.key === "ArrowDown") {
					event_3.preventDefault();
					event_3.currentTarget.closest("[role=\"menu\"]")?.querySelector("[role=\"menuitemradio\"], [role=\"menuitem\"]")?.focus();
				}
			}
		});
		$[54] = matches;
		$[55] = onModelChange;
		$[56] = query;
		$[57] = reset;
		$[58] = setupAgent;
		$[59] = t37;
	} else t37 = $[59];
	const t38 = setupAgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-1 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentSetupBlock, {
			agent: setupAgent,
			status: setupAgent.id === agentId ? agentStatus : statuses[setupAgent.id],
			onClose: () => {
				setOpen(false);
				reset();
			},
			onSetUp: () => {
				setOpen(false);
				reset();
				onSetUpAgent(setupAgent.id);
			}
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: cn$2("flex min-h-0 flex-col", searching && "grow"),
			viewportClassName: "max-h-80 min-h-0 overscroll-contain",
			children: matches ? matches.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelRadioGroup, {
				label: "Matching models",
				models: matches,
				modelId,
				onModelChange
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-6.5 items-center px-1.5 text-ed-muted-foreground",
				children: "No models found"
			}) : byProvider ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-0.5",
				children: providerGroups.map((group_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProviderMenu, {
					provider: group_0.provider,
					models: group_0.models,
					modelId,
					onModelChange
				}, group_0.provider))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelRadioGroup, {
				label: "Model",
				models: latest,
				modelId,
				onModelChange
			})
		}),
		!matches && more.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreModelsMenu, {
			models: more,
			modelId,
			onModelChange
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: "-mx-1 my-1" }),
		efforts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReasoningMenu, {
			efforts,
			effort,
			onEffortChange
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionsMenu, {
			policy,
			onPolicyChange
		}),
		model?.supportsFast && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			role: "menuitemcheckbox",
			"aria-checked": fast,
			onSelect: (event_4) => {
				event_4.preventDefault();
				onFastChange(!fast);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1",
				children: "Fast mode"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				size: "sm",
				checked: fast,
				tabIndex: -1,
				"aria-hidden": true,
				className: "pointer-events-none"
			})]
		}),
		onManageAgent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, { className: "-mx-1 my-1" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onSelect: onManageAgent,
			children: ["Manage ", agentLabel]
		})] })
	] });
	let t39;
	if ($[60] !== setBody || $[61] !== t36 || $[62] !== t37 || $[63] !== t38) {
		t39 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: setBody,
			className: t35,
			style: t36,
			children: [t37, t38]
		});
		$[60] = setBody;
		$[61] = t36;
		$[62] = t37;
		$[63] = t38;
		$[64] = t39;
	} else t39 = $[64];
	let t40;
	if ($[65] !== T1 || $[66] !== t29 || $[67] !== t30 || $[68] !== t31 || $[69] !== t32 || $[70] !== t33 || $[71] !== t34 || $[72] !== t39) {
		t40 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T1, {
			restoreFocusOnPointerDismiss: t25,
			align: t26,
			side: t27,
			sideOffset: t28,
			className: t29,
			onPointerMoveCapture: t30,
			onMouseDown: t31,
			onFocus: t32,
			onKeyDownCapture: t33,
			children: [t34, t39]
		});
		$[65] = T1;
		$[66] = t29;
		$[67] = t30;
		$[68] = t31;
		$[69] = t32;
		$[70] = t33;
		$[71] = t34;
		$[72] = t39;
		$[73] = t40;
	} else t40 = $[73];
	let t41;
	if ($[74] !== T0 || $[75] !== open || $[76] !== t17 || $[77] !== t24 || $[78] !== t40) {
		t41 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			open,
			onOpenChange: t17,
			children: [t24, t40]
		});
		$[74] = T0;
		$[75] = open;
		$[76] = t17;
		$[77] = t24;
		$[78] = t40;
		$[79] = t41;
	} else t41 = $[79];
	return t41;
}
function _temp3$13(group) {
	return group.provider;
}
function _temp2$17() {
	return null;
}
function _temp$29(status_0) {
	return status_0;
}
function ModelSearch(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { inputRef, value, onChange, onKeyDown } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
			align: "inline-start",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, {
				className: "size-4 text-ed-foreground-secondary",
				"aria-hidden": true
			})
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== onChange) {
		t2 = (event) => onChange(event.target.value);
		$[1] = onChange;
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== inputRef || $[4] !== onKeyDown || $[5] !== t2 || $[6] !== value) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
			ref: inputRef,
			"data-model-search": "",
			"aria-label": "Search models",
			placeholder: "Search models",
			value,
			onChange: t2,
			onKeyDown
		});
		$[3] = inputRef;
		$[4] = onKeyDown;
		$[5] = t2;
		$[6] = value;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== inputRef || $[9] !== onChange || $[10] !== value) {
		t4 = value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
			align: "inline-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "Clear search",
				title: "Clear search",
				className: "flex size-4.5 items-center justify-center rounded text-ed-foreground-secondary outline-none hover:text-ed-foreground",
				onPointerDown: _temp4$13,
				onClick: () => {
					onChange("");
					inputRef.current?.focus();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-3.5" })
			})
		});
		$[8] = inputRef;
		$[9] = onChange;
		$[10] = value;
		$[11] = t4;
	} else t4 = $[11];
	let t5;
	if ($[12] !== t3 || $[13] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
			size: "xs",
			className: "mb-1",
			children: [
				t1,
				t3,
				t4
			]
		});
		$[12] = t3;
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	return t5;
}
function _temp4$13(event_0) {
	return event_0.preventDefault();
}
function ModelRadioGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { label, models, modelId, onModelChange } = t0;
	const t1 = modelId ?? "";
	let t2;
	if ($[0] !== models) {
		t2 = models.map(_temp5$12);
		$[0] = models;
		$[1] = t2;
	} else t2 = $[1];
	let t3;
	if ($[2] !== label || $[3] !== onModelChange || $[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
			className: "flex flex-col gap-0.5",
			"aria-label": label,
			value: t1,
			onValueChange: onModelChange,
			children: t2
		});
		$[2] = label;
		$[3] = onModelChange;
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
function _temp5$12(entry) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: entry.id,
		className: "data-[state=checked]:bg-ed-accent",
		children: entry.label
	}, entry.id);
}
function ModelSubContent(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { children } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = cn$2("min-w-40", ROW_HOVER);
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== children) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: t1,
			onFocusOutside: keepOpenForSearch,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				viewportClassName: "max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] overscroll-contain",
				children
			})
		});
		$[1] = children;
		$[2] = t2;
	} else t2 = $[2];
	return t2;
}
function MoreModelsMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { models, modelId, onModelChange } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubTrigger, { children: "More models" });
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== modelId || $[2] !== models || $[3] !== onModelChange) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelSubContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelRadioGroup, {
			label: "More models",
			models,
			modelId,
			onModelChange
		}) })] });
		$[1] = modelId;
		$[2] = models;
		$[3] = onModelChange;
		$[4] = t2;
	} else t2 = $[4];
	return t2;
}
/** One provider's models, split like the flat list: the newest of each line, the rest behind "More models". */
function ProviderMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(19);
	const { provider, models, modelId, onModelChange } = t0;
	let t1;
	if ($[0] !== models) {
		t1 = splitLatestModels(models);
		$[0] = models;
		$[1] = t1;
	} else t1 = $[1];
	const { latest, more } = t1;
	let t2;
	if ($[2] !== provider) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubTrigger, { children: provider });
		$[2] = provider;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== latest || $[5] !== modelId || $[6] !== onModelChange || $[7] !== provider) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModelRadioGroup, {
			label: provider,
			models: latest,
			modelId,
			onModelChange
		});
		$[4] = latest;
		$[5] = modelId;
		$[6] = onModelChange;
		$[7] = provider;
		$[8] = t3;
	} else t3 = $[8];
	let t4;
	if ($[9] !== modelId || $[10] !== more || $[11] !== onModelChange) {
		t4 = more.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoreModelsMenu, {
			models: more,
			modelId,
			onModelChange
		});
		$[9] = modelId;
		$[10] = more;
		$[11] = onModelChange;
		$[12] = t4;
	} else t4 = $[12];
	let t5;
	if ($[13] !== t3 || $[14] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ModelSubContent, { children: [t3, t4] });
		$[13] = t3;
		$[14] = t4;
		$[15] = t5;
	} else t5 = $[15];
	let t6;
	if ($[16] !== t2 || $[17] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t2, t5] });
		$[16] = t2;
		$[17] = t5;
		$[18] = t6;
	} else t6 = $[18];
	return t6;
}
function AgentSetupBlock(t0) {
	const $ = (0, import_compiler_runtime.c)(20);
	const { agent, status, onClose, onSetUp } = t0;
	const Icon = AGENT_ICONS[agent.id] ?? TerminalIcon;
	const upgradeRequired = !!status?.upgradeRequired;
	const upgradeUrl = upgradeRequired ? status?.upgradeUrl : void 0;
	let t1;
	if ($[0] !== Icon) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6 text-ed-muted-foreground" });
		$[0] = Icon;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== agent || $[3] !== upgradeRequired) {
		t2 = upgradeRequired ? upgradeDescription(agent) : `Use ${setupCopy(agent.id).subscription} in Petal.`;
		$[2] = agent;
		$[3] = upgradeRequired;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== upgradeUrl) {
		t3 = upgradeUrl ? { RightIcon: ArrowSquareOutIcon } : {};
		$[5] = upgradeUrl;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== onClose || $[8] !== onSetUp || $[9] !== upgradeUrl) {
		t4 = upgradeUrl ? () => {
			onClose();
			openUpgradePage(upgradeUrl);
		} : onSetUp;
		$[7] = onClose;
		$[8] = onSetUp;
		$[9] = upgradeUrl;
		$[10] = t4;
	} else t4 = $[10];
	const t5 = upgradeRequired ? `Upgrade ${agent.label}` : `Set up ${agent.label}`;
	let t6;
	if ($[11] !== t3 || $[12] !== t4 || $[13] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			size: "xs",
			className: "self-center",
			...t3,
			onClick: t4,
			children: t5
		});
		$[11] = t3;
		$[12] = t4;
		$[13] = t5;
		$[14] = t6;
	} else t6 = $[14];
	let t7;
	if ($[15] !== agent.label || $[16] !== t1 || $[17] !== t2 || $[18] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelEmptyState, {
			icon: t1,
			descriptionClassName: "min-h-8",
			title: agent.label,
			description: t2,
			actions: t6
		});
		$[15] = agent.label;
		$[16] = t1;
		$[17] = t2;
		$[18] = t6;
		$[19] = t7;
	} else t7 = $[19];
	return t7;
}
/** A submenu row with the current choice shown before the caret. */
function SubTriggerWithValue(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { label, value } = t0;
	let t1;
	if ($[0] !== label) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex-1",
			children: label
		});
		$[0] = label;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== value) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-ed-muted-foreground",
			children: value
		});
		$[2] = value;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t1 || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSubTrigger, { children: [t1, t2] });
		$[4] = t1;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
function ReasoningMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { efforts, effort, onEffortChange } = t0;
	const selected = effort ?? efforts[0].value;
	let t1;
	if ($[0] !== selected) {
		t1 = effortLabel(selected);
		$[0] = selected;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTriggerWithValue, {
			label: "Reasoning",
			value: t1
		});
		$[2] = t1;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = cn$2("min-w-32", ROW_HOVER);
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== efforts) {
		t4 = efforts.map(_temp6$9);
		$[5] = efforts;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] !== onEffortChange || $[8] !== selected || $[9] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: t3,
			onFocusOutside: keepOpenForSearch,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
				className: "flex flex-col gap-0.5",
				"aria-label": "Reasoning",
				value: selected,
				onValueChange: onEffortChange,
				children: t4
			})
		});
		$[7] = onEffortChange;
		$[8] = selected;
		$[9] = t4;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== t2 || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t2, t5] });
		$[11] = t2;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	return t6;
}
function _temp6$9(choice) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: choice.value,
		className: "data-[state=checked]:bg-ed-accent",
		children: effortLabel(choice.value)
	}, choice.value);
}
function PermissionsMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	const { policy, onPolicyChange } = t0;
	const mode = policy === "ask" ? PERMISSION_MODES[1] : PERMISSION_MODES[0];
	let t1;
	if ($[0] !== mode.label) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubTriggerWithValue, {
			label: "Permissions",
			value: mode.label
		});
		$[0] = mode.label;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = cn$2("w-64", ROW_HOVER);
		$[2] = t2;
	} else t2 = $[2];
	const t3 = mode.value;
	let t4;
	if ($[3] !== onPolicyChange) {
		t4 = (value) => onPolicyChange?.(value === "auto" ? "auto" : "ask");
		$[3] = onPolicyChange;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = PERMISSION_MODES.map(_temp7$7);
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] !== mode.value || $[7] !== t4) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, {
			className: t2,
			onFocusOutside: keepOpenForSearch,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioGroup, {
				className: "flex flex-col gap-0.5",
				"aria-label": "Permissions",
				value: t3,
				onValueChange: t4,
				children: t5
			})
		});
		$[6] = mode.value;
		$[7] = t4;
		$[8] = t6;
	} else t6 = $[8];
	let t7;
	if ($[9] !== t1 || $[10] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t1, t6] });
		$[9] = t1;
		$[10] = t6;
		$[11] = t7;
	} else t7 = $[11];
	return t7;
}
function _temp7$7(t0) {
	const { value: value_0, label, icon: Icon, description } = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
		value: value_0,
		className: "h-auto items-start gap-2 py-2 data-[state=checked]:bg-ed-accent",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0 text-ed-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 leading-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 text-ed-muted-foreground",
					children: description
				})]
			})]
		})
	}, value_0);
}

export { AgentModelPickerV2 };
