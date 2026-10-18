// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/McpConnectModal.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { CaretDownIcon, CaretLeftIcon, CaretRightIcon, CheckIcon, CopyIcon, SpinnerIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { SimpleTabs, Tabs, TabsContent, TabsTrigger } from "../../../../ui/src/components/Tabs.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { toast } from "../../../../../vendor/sonner.js";

var MCP_SERVER_NAME = "petal";
var MCP_DISPLAY_NAME = "Petal";
function buildClaudeCliCommand(url) {
	return `claude mcp add --scope user --transport http ${MCP_SERVER_NAME} ${url}`;
}
function buildCodexCliCommand(url) {
	return `codex mcp add ${MCP_SERVER_NAME} --url ${url}`;
}
function buildCursorMcpJson(url) {
	return JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: { url } } }, null, 2);
}
function buildOtherClientServerUrlJson(url) {
	return JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: { serverUrl: url } } }, null, 2);
}
function buildMcpRemoteBridgeJson(url) {
	return JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: {
		command: "npx",
		args: ["mcp-remote", url]
	} } }, null, 2);
}
function buildCodexToml(url) {
	return `[mcp_servers.${MCP_SERVER_NAME}]
url = "${url}"
enabled = true
`;
}
function CopyBlock(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { value } = t0;
	const [copied, setCopied] = (0, import_react.useState)(false);
	let t1;
	if ($[0] !== value) {
		t1 = async () => {
			try {
				await navigator.clipboard.writeText(value);
				setCopied(true);
				toast.success("Copied to clipboard");
				setTimeout(() => setCopied(false), 2e3);
			} catch {
				toast.error("Failed to copy");
			}
		};
		$[0] = value;
		$[1] = t1;
	} else t1 = $[1];
	const copy = t1;
	let t2;
	if ($[2] !== value) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			horizontal: true,
			className: "rounded-[5px] border border-ed-field-border bg-ed-field shadow-ed-control",
			viewportClassName: "py-2 pr-9 pl-2.5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "whitespace-pre font-mono text-[11px] leading-4 text-ed-foreground",
				children: value
			})
		});
		$[2] = value;
		$[3] = t2;
	} else t2 = $[3];
	const t3 = copied ? "Copied" : "Copy";
	const t4 = copied ? CheckIcon : CopyIcon;
	let t5;
	if ($[4] !== copy || $[5] !== t3 || $[6] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "icon-xs",
			variant: "outline",
			className: "absolute top-1 right-1",
			"aria-label": t3,
			LeftIcon: t4,
			onClick: copy
		});
		$[4] = copy;
		$[5] = t3;
		$[6] = t4;
		$[7] = t5;
	} else t5 = $[7];
	let t6;
	if ($[8] !== t2 || $[9] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [t2, t5]
		});
		$[8] = t2;
		$[9] = t5;
		$[10] = t6;
	} else t6 = $[10];
	return t6;
}
function InlineCode(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { children } = t0;
	let t1;
	if ($[0] !== children) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
			className: "rounded-[3px] bg-ed-muted px-1 py-px font-mono text-[11px] text-ed-foreground",
			children
		});
		$[0] = children;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
function SetupStep(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { step, title, children } = t0;
	let t1;
	if ($[0] !== step || $[1] !== title) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			as: "h3",
			size: "xs",
			weight: "medium",
			variant: "primary",
			children: [
				step,
				". ",
				title
			]
		});
		$[0] = step;
		$[1] = title;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== children) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2.5",
			children
		});
		$[3] = children;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== t1 || $[6] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col gap-2.5",
			children: [t1, t2]
		});
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
	} else t3 = $[7];
	return t3;
}
/** Step body copy. Block on purpose: Text is an inline span and would take the parent's line box. */
function Note(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { children } = t0;
	let t1;
	if ($[0] !== children) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			className: "text-pretty",
			children
		});
		$[0] = children;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
function McpConnectModal(t0) {
	const $ = (0, import_compiler_runtime.c)(100);
	const { open, onOpenChange, info, loading: t1, initialAgent: t2, onBack, onContinue, footerStart, height: t3 } = t0;
	const loading = t1 === void 0 ? false : t1;
	const initialAgent = t2 === void 0 ? "claude" : t2;
	const height = t3 === void 0 ? 530 : t3;
	const url = info?.url ?? "http://127.0.0.1:0/mcp";
	const [codexManualOpen, setCodexManualOpen] = (0, import_react.useState)(false);
	const [urlCopied, setUrlCopied] = (0, import_react.useState)(false);
	let t4;
	if ($[0] !== url) {
		t4 = async () => {
			try {
				await navigator.clipboard.writeText(url);
				setUrlCopied(true);
				toast.success("Copied to clipboard");
				setTimeout(() => setUrlCopied(false), 2e3);
			} catch {
				toast.error("Failed to copy");
			}
		};
		$[0] = url;
		$[1] = t4;
	} else t4 = $[1];
	const copyUrl = t4;
	const t5 = `min(85vh, ${height}px)`;
	let t6;
	if ($[2] !== t5) {
		t6 = { height: t5 };
		$[2] = t5;
		$[3] = t6;
	} else t6 = $[3];
	let t7;
	if ($[4] !== onBack) {
		t7 = onBack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "icon-xs",
			variant: "ghost",
			"aria-label": "Back",
			LeftIcon: CaretLeftIcon,
			className: "-ml-1.5",
			onClick: onBack
		});
		$[4] = onBack;
		$[5] = t7;
	} else t7 = $[5];
	let t8;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Install MCP" });
		$[6] = t8;
	} else t8 = $[6];
	let t9;
	if ($[7] !== t7) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "col-start-1 row-start-1 flex min-w-0 items-center gap-1",
			children: [t7, t8]
		}) });
		$[7] = t7;
		$[8] = t9;
	} else t9 = $[8];
	let t10;
	if ($[9] !== info || $[10] !== loading) {
		t10 = !loading && !info && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "pb-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "danger",
				children: "Could not read the local MCP URL. Restart Petal and try again."
			})
		});
		$[9] = info;
		$[10] = loading;
		$[11] = t10;
	} else t10 = $[11];
	let t11;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SimpleTabs, {
			size: "xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "claude",
					children: "Claude Code"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "codex",
					children: "Codex"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "cursor",
					children: "Cursor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "manual",
					children: "Other"
				})
			]
		});
		$[12] = t11;
	} else t11 = $[12];
	let t12;
	if ($[13] !== copyUrl || $[14] !== info || $[15] !== loading || $[16] !== urlCopied) {
		t12 = loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
			width: 14,
			height: 14,
			"aria-label": "Loading MCP endpoint",
			className: "animate-spin text-ed-muted-foreground"
		}) : info && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-6.5 min-w-0 items-center gap-1.5 rounded-[5px] border border-ed-field-border bg-ed-field pl-2 pr-0.5 shadow-ed-control",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					role: "status",
					"aria-label": info.healthy ? "Server ready" : "Server starting",
					title: info.healthy ? "Server ready" : "Server starting…",
					className: `size-2 shrink-0 rounded-full ${info.healthy ? "bg-ed-chart-2" : "bg-amber-400"}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "min-w-0 truncate font-mono text-[11px] text-ed-foreground",
					children: info.url
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					size: "icon-xs",
					variant: "ghost",
					"aria-label": urlCopied ? "Copied" : "Copy URL",
					LeftIcon: urlCopied ? CheckIcon : CopyIcon,
					onClick: copyUrl
				})
			]
		});
		$[13] = copyUrl;
		$[14] = info;
		$[15] = loading;
		$[16] = urlCopied;
		$[17] = t12;
	} else t12 = $[17];
	let t13;
	if ($[18] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center justify-between gap-3 px-5 pt-3",
			children: [t11, t12]
		});
		$[18] = t12;
		$[19] = t13;
	} else t13 = $[19];
	let t14;
	if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Copy the configuration below." });
		$[20] = t14;
	} else t14 = $[20];
	let t15;
	if ($[21] !== url) {
		t15 = buildCursorMcpJson(url);
		$[21] = url;
		$[22] = t15;
	} else t15 = $[22];
	let t16;
	if ($[23] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: t15 });
		$[23] = t15;
		$[24] = t16;
	} else t16 = $[24];
	let t17;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-ed-foreground",
			children: "Settings > MCP"
		});
		$[25] = t17;
	} else t17 = $[25];
	let t18;
	if ($[26] === Symbol.for("react.memo_cache_sentinel")) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
			"Paste it into your Cursor MCP config at",
			" ",
			t17,
			", or into",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineCode, { children: "~/.cursor/mcp.json" }),
			"."
		] });
		$[26] = t18;
	} else t18 = $[26];
	let t19;
	if ($[27] !== t16) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SetupStep, {
			step: 1,
			title: `Add ${MCP_DISPLAY_NAME} MCP to Cursor`,
			children: [
				t14,
				t16,
				t18
			]
		});
		$[27] = t16;
		$[28] = t19;
	} else t19 = $[28];
	let t20;
	if ($[29] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupStep, {
			step: 2,
			title: "Verify connection",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
				"Open ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-ed-foreground",
					children: "Cursor Settings > MCP"
				}),
				" and confirm the ",
				MCP_DISPLAY_NAME,
				" server shows as connected."
			] })
		});
		$[29] = t20;
	} else t20 = $[29];
	let t21;
	if ($[30] !== t19) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
			value: "cursor",
			className: "flex flex-col gap-6 overflow-visible",
			children: [t19, t20]
		});
		$[30] = t19;
		$[31] = t21;
	} else t21 = $[31];
	let t22;
	if ($[32] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
			"Run the command below in your terminal to register the ",
			MCP_DISPLAY_NAME,
			" MCP server."
		] });
		$[32] = t22;
	} else t22 = $[32];
	let t23;
	if ($[33] !== url) {
		t23 = buildClaudeCliCommand(url);
		$[33] = url;
		$[34] = t23;
	} else t23 = $[34];
	let t24;
	if ($[35] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SetupStep, {
			step: 1,
			title: `Add ${MCP_DISPLAY_NAME} MCP to Claude Code`,
			children: [t22, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: t23 })]
		});
		$[35] = t23;
		$[36] = t24;
	} else t24 = $[36];
	let t25;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SetupStep, {
			step: 2,
			title: "Verify connection",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
				"Run the command below and confirm ",
				MCP_DISPLAY_NAME,
				" appears as connected."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: "claude mcp list" })]
		});
		$[37] = t25;
	} else t25 = $[37];
	let t26;
	if ($[38] !== t24) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
			value: "claude",
			className: "flex flex-col gap-6 overflow-visible",
			children: [t24, t25]
		});
		$[38] = t24;
		$[39] = t26;
	} else t26 = $[39];
	let t27;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
			"Run the command below in your terminal to register the ",
			MCP_DISPLAY_NAME,
			" MCP server."
		] });
		$[40] = t27;
	} else t27 = $[40];
	let t28;
	if ($[41] !== url) {
		t28 = buildCodexCliCommand(url);
		$[41] = url;
		$[42] = t28;
	} else t28 = $[42];
	let t29;
	if ($[43] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: t28 });
		$[43] = t28;
		$[44] = t29;
	} else t29 = $[44];
	const t30 = codexManualOpen ? CaretDownIcon : CaretRightIcon;
	let t31;
	if ($[45] === Symbol.for("react.memo_cache_sentinel")) {
		t31 = () => setCodexManualOpen(_temp$19);
		$[45] = t31;
	} else t31 = $[45];
	let t32;
	if ($[46] !== t30) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "xs",
			LeftIcon: t30,
			onClick: t31,
			children: "Configure manually via config.toml"
		}) });
		$[46] = t30;
		$[47] = t32;
	} else t32 = $[47];
	let t33;
	if ($[48] !== codexManualOpen || $[49] !== url) {
		t33 = codexManualOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: buildCodexToml(url) });
		$[48] = codexManualOpen;
		$[49] = url;
		$[50] = t33;
	} else t33 = $[50];
	let t34;
	if ($[51] !== t29 || $[52] !== t32 || $[53] !== t33) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SetupStep, {
			step: 1,
			title: `Add ${MCP_DISPLAY_NAME} MCP to Codex`,
			children: [
				t27,
				t29,
				t32,
				t33
			]
		});
		$[51] = t29;
		$[52] = t32;
		$[53] = t33;
		$[54] = t34;
	} else t34 = $[54];
	let t35;
	if ($[55] === Symbol.for("react.memo_cache_sentinel")) {
		t35 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SetupStep, {
			step: 2,
			title: "Verify connection",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
				"Run the command below and confirm the ",
				MCP_DISPLAY_NAME,
				" server appears."
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: "codex mcp list" })]
		});
		$[55] = t35;
	} else t35 = $[55];
	let t36;
	if ($[56] !== t34) {
		t36 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
			value: "codex",
			className: "flex flex-col gap-6 overflow-visible",
			children: [t34, t35]
		});
		$[56] = t34;
		$[57] = t36;
	} else t36 = $[57];
	let t37;
	if ($[58] !== url) {
		t37 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
			"If your client isn't listed above, set up ",
			MCP_DISPLAY_NAME,
			" manually. The server URL is",
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InlineCode, { children: url }),
			"."
		] });
		$[58] = url;
		$[59] = t37;
	} else t37 = $[59];
	let t38;
	if ($[60] !== url) {
		t38 = buildOtherClientServerUrlJson(url);
		$[60] = url;
		$[61] = t38;
	} else t38 = $[61];
	let t39;
	if ($[62] !== t38) {
		t39 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: t38 });
		$[62] = t38;
		$[63] = t39;
	} else t39 = $[63];
	let t40;
	if ($[64] === Symbol.for("react.memo_cache_sentinel")) {
		t40 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "If your client doesn't support remote URLs natively, use the mcp-remote bridge. It needs Node.js." });
		$[64] = t40;
	} else t40 = $[64];
	let t41;
	if ($[65] !== url) {
		t41 = buildMcpRemoteBridgeJson(url);
		$[65] = url;
		$[66] = t41;
	} else t41 = $[66];
	let t42;
	if ($[67] !== t41) {
		t42 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, { value: t41 });
		$[67] = t41;
		$[68] = t42;
	} else t42 = $[68];
	let t43;
	if ($[69] !== t37 || $[70] !== t39 || $[71] !== t42) {
		t43 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SetupStep, {
			step: 1,
			title: "Other MCP clients",
			children: [
				t37,
				t39,
				t40,
				t42
			]
		});
		$[69] = t37;
		$[70] = t39;
		$[71] = t42;
		$[72] = t43;
	} else t43 = $[72];
	let t44;
	if ($[73] === Symbol.for("react.memo_cache_sentinel")) {
		t44 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupStep, {
			step: 2,
			title: "Verify connection",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
				"Confirm the ",
				MCP_DISPLAY_NAME,
				" MCP server shows as connected in your client's settings."
			] })
		});
		$[73] = t44;
	} else t44 = $[73];
	let t45;
	if ($[74] !== t43) {
		t45 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
			value: "manual",
			className: "flex flex-col gap-6 overflow-visible",
			children: [t43, t44]
		});
		$[74] = t43;
		$[75] = t45;
	} else t45 = $[75];
	let t46;
	if ($[76] !== t21 || $[77] !== t26 || $[78] !== t36 || $[79] !== t45) {
		t46 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
			className: "min-h-0 flex-1",
			viewportClassName: "px-5 py-5",
			children: [
				t21,
				t26,
				t36,
				t45
			]
		});
		$[76] = t21;
		$[77] = t26;
		$[78] = t36;
		$[79] = t45;
		$[80] = t46;
	} else t46 = $[80];
	let t47;
	if ($[81] !== t13 || $[82] !== t46) {
		t47 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col",
			children: [t13, t46]
		});
		$[81] = t13;
		$[82] = t46;
		$[83] = t47;
	} else t47 = $[83];
	let t48;
	if ($[84] !== initialAgent || $[85] !== t47) {
		t48 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
			defaultValue: initialAgent,
			className: "flex min-h-0 flex-1 flex-col",
			children: t47
		});
		$[84] = initialAgent;
		$[85] = t47;
		$[86] = t48;
	} else t48 = $[86];
	let t49;
	if ($[87] !== footerStart || $[88] !== onContinue) {
		t49 = onContinue && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
			className: "justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: footerStart }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				onClick: onContinue,
				children: "Next"
			})]
		});
		$[87] = footerStart;
		$[88] = onContinue;
		$[89] = t49;
	} else t49 = $[89];
	let t50;
	if ($[90] !== t10 || $[91] !== t48 || $[92] !== t49 || $[93] !== t6 || $[94] !== t9) {
		t50 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-[560px]",
			style: t6,
			"aria-describedby": void 0,
			children: [
				t9,
				t10,
				t48,
				t49
			]
		});
		$[90] = t10;
		$[91] = t48;
		$[92] = t49;
		$[93] = t6;
		$[94] = t9;
		$[95] = t50;
	} else t50 = $[95];
	let t51;
	if ($[96] !== onOpenChange || $[97] !== open || $[98] !== t50) {
		t51 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange,
			children: t50
		});
		$[96] = onOpenChange;
		$[97] = open;
		$[98] = t50;
		$[99] = t51;
	} else t51 = $[99];
	return t51;
}
function _temp$19(v) {
	return !v;
}

export { McpConnectModal };
