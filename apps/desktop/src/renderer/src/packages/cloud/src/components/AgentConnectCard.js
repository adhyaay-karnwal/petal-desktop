// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/AgentConnectCard.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { Badge } from "../../../ui/src/components/Badge.js";
import { DownloadIcon, XIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../ui/src/components/HoverCard.js";
import { isClaudeSetUp } from "../../../editor/src/shell/hooks/useClaudeStatus.js";
import { usePostHog } from "../../../../vendor/@posthog/react.js";
import { AGENT_PATHS, CLAUDE_STATE_COPY, DESKTOP_DEEP_LINK, DESKTOP_DOWNLOAD_URL } from "../constants/agentPaths.js";
import { AgentPathSummary } from "./AgentPathSummary.js";

var DISMISSED_KEY_PREFIX = "petal:agentConnectDismissed:";
function readDismissed(userId) {
	try {
		return localStorage.getItem(DISMISSED_KEY_PREFIX + userId) === "1";
	} catch {
		return false;
	}
}
var ICON_BUTTON_PADDING = {
	paddingLeft: 6,
	paddingRight: 12
};
var ACTION_LABELS = {
	claude: "Connect Claude Code",
	mcp: "Connect MCP"
};
var PATH_LAYOUT = ["px-5 py-5", "border-ed-border px-5 py-5 @max-xl:border-t @xl:border-l"];
/** Hover card body: a title and label/value rows (Claude Code details). */
function StatusDetails(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { title, rows } = t0;
	let t1;
	if ($[0] !== title) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "2xs",
			weight: "medium",
			variant: "primary",
			children: title
		});
		$[0] = title;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== rows) {
		t2 = rows.map(_temp$10);
		$[2] = rows;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "flex flex-col gap-0.5",
			children: t2
		});
		$[4] = t2;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== t1 || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1.5 px-3 py-2",
			children: [t1, t3]
		});
		$[6] = t1;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	return t4;
}
/**
* Green-dot status chip on the same surface as the outline Button beside it (border, fill,
* control shadow). Optional details live in a hover card, not on the chip.
*/
function _temp$10(t0) {
	const [label, value] = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "tertiary",
				children: label
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "min-w-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "2xs",
				variant: "primary",
				className: "truncate text-right",
				children: value
			})
		})]
	}, label);
}
function StatusChip(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { label, children } = t0;
	const t1 = children ? 0 : void 0;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 shrink-0 rounded-full bg-ed-chart-2" });
		$[0] = t2;
	} else t2 = $[0];
	let t3;
	if ($[1] !== label || $[2] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			tabIndex: t1,
			className: "cursor-default gap-1.5 border-ed-field-border bg-ed-field px-2.5 py-1 text-[11px] leading-4 shadow-ed-control",
			children: [t2, label]
		});
		$[1] = label;
		$[2] = t1;
		$[3] = t3;
	} else t3 = $[3];
	const chip = t3;
	if (!children) return chip;
	let t4;
	if ($[4] !== chip) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardTrigger, {
			asChild: true,
			children: chip
		});
		$[4] = chip;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== children) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoverCardContent, {
			align: "start",
			className: "w-64 rounded-md border-ed-menu-border bg-ed-menu p-0",
			children
		});
		$[6] = children;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t4 || $[9] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HoverCard, {
			openDelay: 150,
			closeDelay: 100,
			children: [t4, t5]
		});
		$[8] = t4;
		$[9] = t5;
		$[10] = t6;
	} else t6 = $[10];
	return t6;
}
/**
* Dashboard card introducing the two agent paths. On desktop each path has its setup
* action; on the web, where both need the desktop app, the card offers the download
* instead. Dismissal is remembered per user in localStorage. Mount with `key={userId}`
* so a different account re-reads its own dismissal.
*/
function AgentConnectCard(t0) {
	const $ = (0, import_compiler_runtime.c)(51);
	const { userId, onSetUpClaude, onConnectMcp, claudeStatus: t1, onNewFile, mcpServer: t2 } = t0;
	const claudeStatus = t1 === void 0 ? null : t1;
	const mcpServer = t2 === void 0 ? null : t2;
	const posthog = usePostHog();
	const titleId = (0, import_react.useId)();
	let t3;
	if ($[0] !== userId) {
		t3 = () => readDismissed(userId);
		$[0] = userId;
		$[1] = t3;
	} else t3 = $[1];
	const [dismissed, setDismissed] = (0, import_react.useState)(t3);
	if (dismissed) return null;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	if ($[2] !== claudeStatus || $[3] !== mcpServer?.healthy || $[4] !== onConnectMcp || $[5] !== onNewFile || $[6] !== onSetUpClaude || $[7] !== posthog || $[8] !== titleId || $[9] !== userId) {
		const actions = {
			claude: onSetUpClaude,
			mcp: onConnectMcp
		};
		const hasActions = Boolean(onSetUpClaude || onConnectMcp);
		let t9;
		if ($[15] !== claudeStatus) {
			t9 = isClaudeSetUp(claudeStatus);
			$[15] = claudeStatus;
			$[16] = t9;
		} else t9 = $[16];
		const claudeConnected = t9;
		const claudeState = !claudeStatus ? null : claudeConnected ? CLAUDE_STATE_COPY.connected : !claudeStatus.installed ? CLAUDE_STATE_COPY.notInstalled : claudeStatus.requiredVersion ? CLAUDE_STATE_COPY.updateRequired : CLAUDE_STATE_COPY.notLoggedIn;
		let t10;
		if ($[17] !== claudeState || $[18] !== hasActions) {
			t10 = (path) => {
				if (!hasActions) return {
					...path,
					description: path.webDescription
				};
				if (path.id === "claude" && claudeState) return {
					...path,
					description: claudeState.description
				};
				return path;
			};
			$[17] = claudeState;
			$[18] = hasActions;
			$[19] = t10;
		} else t10 = $[19];
		const displayPath = t10;
		let t11;
		if ($[20] !== claudeState) {
			t11 = (id) => id === "claude" && claudeState && "action" in claudeState ? claudeState.action : ACTION_LABELS[id];
			$[20] = claudeState;
			$[21] = t11;
		} else t11 = $[21];
		const actionLabel = t11;
		let t12;
		if ($[22] !== posthog || $[23] !== userId) {
			t12 = () => {
				setDismissed(true);
				try {
					localStorage.setItem(DISMISSED_KEY_PREFIX + userId, "1");
				} catch {}
				posthog.capture("agent_connect_card_dismissed");
			};
			$[22] = posthog;
			$[23] = userId;
			$[24] = t12;
		} else t12 = $[24];
		const dismiss = t12;
		let t13;
		if ($[25] !== posthog) {
			t13 = () => {
				posthog.capture("agent_connect_card_clicked", { target: "open-desktop" });
				window.location.href = DESKTOP_DEEP_LINK;
			};
			$[25] = posthog;
			$[26] = t13;
		} else t13 = $[26];
		const openDesktopApp = t13;
		let t14;
		if ($[27] !== posthog) {
			t14 = () => {
				posthog.capture("agent_connect_card_clicked", { target: "download" });
				window.open(DESKTOP_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
			};
			$[27] = posthog;
			$[28] = t14;
		} else t14 = $[28];
		const openDownload = t14;
		const renderAction = (id_0) => {
			if (id_0 === "claude" && claudeStatus && claudeConnected) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [onNewFile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "xs",
					onClick: () => {
						posthog.capture("agent_connect_card_clicked", { target: "new-file" });
						onNewFile();
					},
					children: "New file"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
					label: "Connected",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusDetails, {
						title: "Claude Code",
						rows: [
							["Account", claudeStatus.account ?? "Signed in"],
							["Version", claudeStatus.version ? `v${claudeStatus.version}` : "Installed"],
							["Billing", "Your Claude plan"]
						]
					})
				})]
			});
			const open = actions[id_0];
			if (!open) return null;
			const button = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				onClick: () => {
					posthog.capture("agent_connect_card_clicked", { target: id_0 });
					open();
				},
				children: actionLabel(id_0)
			});
			if (id_0 === "mcp" && mcpServer?.healthy) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [button, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, { label: "Server ready" })]
			});
			return button;
		};
		t6 = titleId;
		t7 = "@container flex shrink-0 flex-col overflow-hidden rounded-2xl border border-ed-border bg-ed-card";
		let t15;
		if ($[29] !== titleId) {
			t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "h2",
				id: titleId,
				size: "2xs",
				weight: "medium",
				variant: "primary",
				children: "Connect your agent"
			});
			$[29] = titleId;
			$[30] = t15;
		} else t15 = $[30];
		let t16;
		if ($[31] !== hasActions || $[32] !== openDesktopApp || $[33] !== openDownload) {
			t16 = !hasActions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				LeftIcon: DownloadIcon,
				style: ICON_BUTTON_PADDING,
				onClick: openDownload,
				children: "Download"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "default",
				size: "xs",
				onClick: openDesktopApp,
				children: "Open in app"
			})] });
			$[31] = hasActions;
			$[32] = openDesktopApp;
			$[33] = openDownload;
			$[34] = t16;
		} else t16 = $[34];
		let t17;
		if ($[35] !== dismiss) {
			t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon-xs",
				"aria-label": "Dismiss",
				LeftIcon: XIcon,
				onClick: dismiss
			});
			$[35] = dismiss;
			$[36] = t17;
		} else t17 = $[36];
		let t18;
		if ($[37] !== t16 || $[38] !== t17) {
			t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2",
				children: [t16, t17]
			});
			$[37] = t16;
			$[38] = t17;
			$[39] = t18;
		} else t18 = $[39];
		if ($[40] !== t15 || $[41] !== t18) {
			t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-4 border-b border-ed-border px-5 py-3",
				children: [t15, t18]
			});
			$[40] = t15;
			$[41] = t18;
			$[42] = t8;
		} else t8 = $[42];
		t4 = "grid grid-cols-1 @xl:grid-cols-2";
		t5 = AGENT_PATHS.map((path_0, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPathSummary, {
			path: displayPath(path_0),
			className: PATH_LAYOUT[i],
			action: renderAction(path_0.id)
		}, path_0.id));
		$[2] = claudeStatus;
		$[3] = mcpServer?.healthy;
		$[4] = onConnectMcp;
		$[5] = onNewFile;
		$[6] = onSetUpClaude;
		$[7] = posthog;
		$[8] = titleId;
		$[9] = userId;
		$[10] = t4;
		$[11] = t5;
		$[12] = t6;
		$[13] = t7;
		$[14] = t8;
	} else {
		t4 = $[10];
		t5 = $[11];
		t6 = $[12];
		t7 = $[13];
		t8 = $[14];
	}
	let t9;
	if ($[43] !== t4 || $[44] !== t5) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: t4,
			children: t5
		});
		$[43] = t4;
		$[44] = t5;
		$[45] = t9;
	} else t9 = $[45];
	let t10;
	if ($[46] !== t6 || $[47] !== t7 || $[48] !== t8 || $[49] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			"aria-labelledby": t6,
			className: t7,
			children: [t8, t9]
		});
		$[46] = t6;
		$[47] = t7;
		$[48] = t8;
		$[49] = t9;
		$[50] = t10;
	} else t10 = $[50];
	return t10;
}

export { AgentConnectCard };
