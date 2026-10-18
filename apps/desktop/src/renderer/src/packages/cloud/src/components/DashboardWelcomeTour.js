// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/DashboardWelcomeTour.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { ArrowUpIcon, ClaudeIcon, PlusIcon, XIcon } from "../../../ui/src/icons.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { toast } from "../../../../vendor/sonner.js";
import { isClaudeSetUp, useClaudeStatus } from "../../../editor/src/shell/hooks/useClaudeStatus.js";
import { ImportDesignSystemIllustration } from "../../../editor/src/shell/components/ImportDesignSystemIllustration.js";
import { ClaudeCodeSetupModal } from "../../../editor/src/shell/components/ClaudeCodeSetupModal.js";
import { McpConnectModal } from "../../../editor/src/shell/components/McpConnectModal.js";
import { DESKTOP_DEEP_LINK } from "../constants/agentPaths.js";
import { useDismissWelcomeTour, useOnboardingState } from "../hooks/useOnboarding.js";
import { tourWallpaper_default } from "../assets/tourWallpaper.webp.js";
import { claude_default } from "../assets/dock/claude.webp.js";
import { codex_default } from "../assets/dock/codex.webp.js";
import { cursor_default } from "../assets/dock/cursor.webp.js";
import { grok_default } from "../assets/dock/grok.webp.js";
import { petal_default } from "../assets/dock/petal.webp.js";
import { terminal_default } from "../assets/dock/terminal.webp.js";

var STEPS = [
	"Claude Code",
	"MCP",
	"Design system"
];
/** Mounted only on the dashboard. Account persistence keeps web and desktop in sync. */
function DashboardWelcomeTour(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	let props;
	let userId;
	if ($[0] !== t0) {
		({userId, ...props} = t0);
		$[0] = t0;
		$[1] = props;
		$[2] = userId;
	} else {
		props = $[1];
		userId = $[2];
	}
	const { data } = useOnboardingState();
	const dismiss = useDismissWelcomeTour(userId);
	const [dismissed, setDismissed] = (0, import_react.useState)(false);
	const open = !dismissed && data?.completed === true && data.answers?.welcomeTourPending === true;
	let t1;
	if ($[3] !== dismiss) {
		t1 = () => {
			setDismissed(true);
			dismiss.mutate(void 0, { onError: _temp$11 });
		};
		$[3] = dismiss;
		$[4] = t1;
	} else t1 = $[4];
	const close = t1;
	let t2;
	if ($[5] !== close || $[6] !== open || $[7] !== props) {
		t2 = open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeTourDialog, {
			...props,
			onClose: close
		}) : null;
		$[5] = close;
		$[6] = open;
		$[7] = props;
		$[8] = t2;
	} else t2 = $[8];
	return t2;
}
/** Kept separate so status polling stops on dismissal. */
function _temp$11() {
	return toast.error("Could not save your tour preference. It may appear again next time.");
}
function WelcomeTourDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(66);
	const { mcpServer, onCreateFile, creating, canCreate, onClose } = t0;
	const [step, setStep] = (0, import_react.useState)(0);
	const [detail, setDetail] = (0, import_react.useState)(null);
	const contentRef = (0, import_react.useRef)(null);
	const [tourHeight, setTourHeight] = (0, import_react.useState)();
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			setTourHeight(contentRef.current?.offsetHeight);
			setDetail("mcp");
		};
		$[0] = t1;
	} else t1 = $[0];
	const openMcp = t1;
	const t2 = step === 0;
	let t3;
	if ($[1] !== t2) {
		t3 = { poll: t2 };
		$[1] = t2;
		$[2] = t3;
	} else t3 = $[2];
	const claude = useClaudeStatus(t3);
	const t4 = isClaudeSetUp(claude.status) ? "Claude Code is already connected" : "Meet your canvas agent";
	let t5;
	if ($[3] !== t4) {
		t5 = [
			t4,
			"Design with MCP",
			"Import your design system"
		];
		$[3] = t4;
		$[4] = t5;
	} else t5 = $[4];
	const titles = t5;
	let t6;
	if ($[5] !== claude.error || $[6] !== claude.isDesktop) {
		t6 = claude.isDesktop ? [
			claude.error ? "Could not check your Claude Code connection. Try again, or set it up later from any file." : "Chat with Claude Code in the panel on the left of every file. It sees your canvas and designs with you, on your own Claude subscription.",
			"Design with Codex, Cursor, Claude Code, or any other MCP agent. Once installed, the MCP automatically connects while the Petal desktop app is open.",
			"Import your styles and components with the same variants and props they have in code. Create a file, then choose Import in the agent panel."
		] : [
			"Chat with Claude Code on your canvas, on your own Claude subscription. Agents only work in the Petal desktop app, not in the browser.",
			"Design with Codex, Cursor, Claude Code, or any other MCP agent. MCP only works with the Petal desktop app, not in the browser.",
			"Import your styles and components with the same variants and props they have in code. Import only works in the desktop app, where your agent can read your codebase."
		];
		$[5] = claude.error;
		$[6] = claude.isDesktop;
		$[7] = t6;
	} else t6 = $[7];
	const descriptions = t6;
	let t7;
	if ($[8] !== claude || $[9] !== mcpServer?.healthy || $[10] !== step) {
		t7 = step === 0 ? claude.isDesktop ? claudeAction(claude, () => setDetail("claude")) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenDesktopApp, {}) : step === 1 ? claude.isDesktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			disabled: !mcpServer?.healthy,
			onClick: openMcp,
			children: mcpServer?.healthy ? "Install MCP" : "Starting MCP server…"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenDesktopApp, {}) : null;
		$[8] = claude;
		$[9] = mcpServer?.healthy;
		$[10] = step;
		$[11] = t7;
	} else t7 = $[11];
	const action = t7;
	const t8 = detail === null;
	let t9;
	if ($[12] !== onClose) {
		t9 = (open) => {
			if (!open) onClose();
		};
		$[12] = onClose;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: tourWallpaper_default,
			alt: "",
			className: "absolute inset-0 size-full object-cover"
		});
		$[14] = t10;
	} else t10 = $[14];
	let t11;
	if ($[15] !== step) {
		t11 = step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentChatScene, {});
		$[15] = step;
		$[16] = t11;
	} else t11 = $[16];
	let t12;
	if ($[17] !== step) {
		t12 = step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(McpScene, {});
		$[17] = step;
		$[18] = t12;
	} else t12 = $[18];
	let t13;
	if ($[19] !== step) {
		t13 = step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDesignSystemIllustration, {
			size: "lg",
			glass: true,
			className: "relative h-full rounded-none border-0 bg-transparent"
		});
		$[19] = step;
		$[20] = t13;
	} else t13 = $[20];
	let t14;
	if ($[21] !== t11 || $[22] !== t12 || $[23] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"aria-hidden": "true",
			inert: true,
			className: "relative h-[266px] overflow-hidden border-b border-ed-divider bg-ed-muted",
			children: [
				t10,
				t11,
				t12,
				t13
			]
		});
		$[21] = t11;
		$[22] = t12;
		$[23] = t13;
		$[24] = t14;
	} else t14 = $[24];
	let t15;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon-xs",
				"aria-label": "Close",
				LeftIcon: XIcon,
				className: "absolute top-3.5 right-3.5 bg-black/25 text-white backdrop-blur-md hover:bg-black/40 hover:text-white"
			})
		});
		$[25] = t15;
	} else t15 = $[25];
	let t16;
	if ($[26] !== t14) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative shrink-0",
			children: [t14, t15]
		});
		$[26] = t14;
		$[27] = t16;
	} else t16 = $[27];
	const t17 = titles[step];
	let t18;
	if ($[28] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
			className: "min-h-0 text-base leading-6 font-normal text-balance",
			children: t17
		});
		$[28] = t17;
		$[29] = t18;
	} else t18 = $[29];
	const t19 = descriptions[step];
	let t20;
	if ($[30] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
			className: "min-h-9 text-xs leading-4.5 text-balance text-ed-foreground-secondary",
			children: t19
		});
		$[30] = t19;
		$[31] = t20;
	} else t20 = $[31];
	let t21;
	if ($[32] !== t18 || $[33] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
			className: "py-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [t18, t20]
			})
		});
		$[32] = t18;
		$[33] = t20;
		$[34] = t21;
	} else t21 = $[34];
	let t22;
	if ($[35] !== step) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TourNavigation, {
			step,
			onStep: setStep
		});
		$[35] = step;
		$[36] = t22;
	} else t22 = $[36];
	let t23;
	if ($[37] !== action || $[38] !== canCreate || $[39] !== creating || $[40] !== onClose || $[41] !== onCreateFile || $[42] !== step) {
		t23 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children: step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				disabled: !canCreate || creating,
				loading: creating,
				onClick: () => {
					onClose();
					onCreateFile();
				},
				children: "Create new file"
			}) : action ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "xs",
				onClick: () => setStep(step + 1),
				children: "Skip"
			}), action] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "xs",
				onClick: () => setStep(step + 1),
				children: "Next"
			})
		});
		$[37] = action;
		$[38] = canCreate;
		$[39] = creating;
		$[40] = onClose;
		$[41] = onCreateFile;
		$[42] = step;
		$[43] = t23;
	} else t23 = $[43];
	let t24;
	if ($[44] !== t22 || $[45] !== t23) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
			className: "justify-between",
			children: [t22, t23]
		});
		$[44] = t22;
		$[45] = t23;
		$[46] = t24;
	} else t24 = $[46];
	let t25;
	if ($[47] !== t16 || $[48] !== t21 || $[49] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			ref: contentRef,
			className: "max-w-[560px] border-0 outline-1 -outline-offset-1 outline-ed-foreground/10",
			children: [
				t16,
				t21,
				t24
			]
		});
		$[47] = t16;
		$[48] = t21;
		$[49] = t24;
		$[50] = t25;
	} else t25 = $[50];
	let t26;
	if ($[51] !== t25 || $[52] !== t8 || $[53] !== t9) {
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: t8,
			onOpenChange: t9,
			children: t25
		});
		$[51] = t25;
		$[52] = t8;
		$[53] = t9;
		$[54] = t26;
	} else t26 = $[54];
	let t27;
	if ($[55] !== claude || $[56] !== detail) {
		t27 = detail === "claude" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeCodeSetupModal, {
			open: true,
			onOpenChange: (open_0) => {
				if (!open_0) setDetail(null);
			},
			onContinue: () => {
				setStep(1);
				setDetail(null);
				claude.refresh();
			}
		});
		$[55] = claude;
		$[56] = detail;
		$[57] = t27;
	} else t27 = $[57];
	let t28;
	if ($[58] !== detail || $[59] !== mcpServer || $[60] !== tourHeight) {
		t28 = detail === "mcp" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(McpConnectModal, {
			open: true,
			onOpenChange: (open_1) => {
				if (!open_1) setDetail(null);
			},
			info: mcpServer ?? null,
			onBack: () => setDetail(null),
			onContinue: () => {
				setStep(2);
				setDetail(null);
			},
			footerStart: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TourNavigation, {
				step: 1,
				onStep: (next) => {
					setStep(next);
					setDetail(null);
				}
			}),
			height: tourHeight
		});
		$[58] = detail;
		$[59] = mcpServer;
		$[60] = tourHeight;
		$[61] = t28;
	} else t28 = $[61];
	let t29;
	if ($[62] !== t26 || $[63] !== t27 || $[64] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t26,
			t27,
			t28
		] });
		$[62] = t26;
		$[63] = t27;
		$[64] = t28;
		$[65] = t29;
	} else t29 = $[65];
	return t29;
}
/** Step one's footer action: set up or sign in, or retry a failed status check; none once connected. */
function claudeAction(claude, onSetup) {
	if (claude.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "xs",
		variant: "outline",
		onClick: () => void claude.refresh(),
		children: "Try again"
	});
	if (isClaudeSetUp(claude.status)) return null;
	const label = !claude.status?.installed ? "Set up Claude Code" : claude.status.requiredVersion ? "Update Claude Code" : "Sign in to Claude Code";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "xs",
		variant: "outline",
		disabled: claude.loading,
		onClick: onSetup,
		children: label
	});
}
/** In the browser, agents only work through the desktop app; the dashboard banner also offers the download. */
function OpenDesktopApp() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			onClick: _temp2$6,
			children: "Open desktop app"
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function _temp2$6() {
	window.location.href = DESKTOP_DEEP_LINK;
}
function TourNavigation(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { step, onStep } = t0;
	let t1;
	if ($[0] !== onStep || $[1] !== step) {
		t1 = STEPS.map((label, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": `Step ${index + 1}: ${label}`,
			"aria-current": step === index ? "step" : void 0,
			onClick: () => onStep(index),
			className: "flex size-4 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ed-ring",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn$2("size-1.5 rounded-full", step === index ? "bg-ed-foreground" : "bg-ed-border") })
		}, label));
		$[0] = onStep;
		$[1] = step;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			"aria-label": "Welcome tour steps",
			className: "flex items-center gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center",
				children: t1
			})
		});
		$[3] = t1;
		$[4] = t2;
	} else t2 = $[4];
	return t2;
}
/**
* The lower-left corner of the desktop window: the sidebar's chat, with a slice of canvas beside it.
* The top and right run off the scene. Classes follow ChatPanel's sidebar-v2 variant.
*/
function AgentChatScene() {
	const $ = (0, import_compiler_runtime.c)(5);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-[170px] flex-col gap-2 self-end rounded-md bg-ed-chat-surface px-3 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-full rounded-full bg-ed-foreground/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-3/5 rounded-full bg-ed-foreground/20" })]
		});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1 flex-col justify-end gap-5 overflow-hidden px-3 pt-3 pb-5",
			children: [t0, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-full rounded-full bg-ed-foreground/15" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-11/12 rounded-full bg-ed-foreground/15" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1/2 rounded-full bg-ed-foreground/15" })
				]
			})]
		});
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "min-h-6.5 px-0.5 text-ed-chat leading-5 text-ed-muted-foreground/50",
			children: "Design, build, / for skills, @ for context"
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "xs",
			variant: "ghost",
			isChildText: false,
			className: "px-1 text-ed-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeIcon, { className: "size-4" }), "Fable 5.1"]
		});
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute -top-4 -right-16 bottom-10 left-12 flex overflow-hidden rounded-bl-[10px] border border-ed-divider bg-ed-background shadow-ed-popover",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-[260px] shrink-0 flex-col border-r border-ed-divider",
				children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-3 pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 rounded-md border border-ed-border bg-ed-card px-2 py-2 shadow-[0_3px_12px_rgba(0,0,0,0.05)]",
						children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "-ml-1 flex items-center justify-between",
							children: [t3, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon-xs",
									variant: "ghost",
									LeftIcon: PlusIcon,
									"aria-label": "Add to message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "icon-xs",
									variant: "secondary",
									LeftIcon: ArrowUpIcon,
									"aria-label": "Send",
									className: "text-ed-muted-foreground"
								})]
							})]
						})]
					})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 bg-ed-canvas-background" })]
		});
		$[4] = t4;
	} else t4 = $[4];
	return t4;
}
/** An agent from the dock drawing in a Petal window, abstracted: sidebar, canvas, and the agent's claim badge. */
function McpScene() {
	const $ = (0, import_compiler_runtime.c)(6);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-12 shrink-0 flex-col items-center gap-2.5 border-r border-ed-divider bg-ed-background py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 flex gap-1",
				children: [
					"bg-[#ff5f57]",
					"bg-[#febc2e]",
					"bg-[#28c840]"
				].map(_temp3$4)
			}), [
				"w-6",
				"w-7",
				"w-5",
				"w-6",
				"w-4"
			].map(_temp4$4)]
		});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-[3px] bg-ed-canvas-selection px-1 text-[9px] leading-3.5 font-medium text-white",
				children: "Agent"
			})
		});
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-20 rounded-full bg-ed-foreground/20" });
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 w-28 rounded-full bg-ed-foreground/10" });
		$[2] = t2;
		$[3] = t3;
	} else {
		t2 = $[2];
		t3 = $[3];
	}
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 top-3 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-[340px] overflow-hidden rounded-[10px] border border-ed-divider bg-ed-canvas-background shadow-ed-popover",
				children: [t0, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 px-5 pt-3 pb-4",
					children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center gap-1.5 border border-ed-canvas-selection bg-ed-background px-3 pt-3 pb-3.5",
						children: [
							t2,
							t3,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 grid w-full grid-cols-3 gap-1.5",
								children: [
									0,
									1,
									2
								].map(_temp5$3)
							})
						]
					})]
				})]
			})
		});
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t4, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-0 bottom-2 flex justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentDock, {})
		})] });
		$[5] = t5;
	} else t5 = $[5];
	return t5;
}
/** The macOS dock from the website's agent section, Petal active: any of these agents can drive the canvas. */
function _temp5$3(i_0) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn$2("flex flex-col gap-1 rounded-[4px] border p-1.5", i_0 === 1 ? "border-ed-foreground/15 bg-ed-muted" : "border-ed-divider"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1 w-6 rounded-full bg-ed-foreground/15" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-8 rounded-full bg-ed-foreground/20" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1 h-0.5 w-full rounded-full bg-ed-foreground/10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-0.5 w-4/5 rounded-full bg-ed-foreground/10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-0.5 w-3/5 rounded-full bg-ed-foreground/10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn$2("mt-1.5 h-2.5 w-full rounded-[3px]", i_0 === 1 ? "bg-ed-foreground/20" : "bg-ed-foreground/10") })
		]
	}, i_0);
}
function _temp4$4(width, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn$2("h-1 rounded-full bg-ed-foreground/10", width) }, i);
}
function _temp3$4(color) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn$2("size-1.5 rounded-full", color) }, color);
}
var DOCK_APPS = [
	{
		name: "Petal",
		icon: petal_default,
		fit: 1
	},
	{
		name: "Claude",
		icon: claude_default,
		fit: 1
	},
	{
		name: "Grok",
		icon: grok_default,
		fit: .8
	},
	{
		name: "Cursor",
		icon: cursor_default,
		fit: .8
	},
	{
		name: "Codex",
		icon: codex_default,
		fit: 1
	},
	{
		name: "Terminal",
		icon: terminal_default,
		fit: 1
	}
];
function AgentDock() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-1 rounded-[14px] border border-white/30 bg-white/20 px-1.5 pt-1.5 pb-2.5 backdrop-blur-md",
			children: DOCK_APPS.map(_temp6$2)
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function _temp6$2(t0, index) {
	const { name, icon, fit } = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex size-9 items-center justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: icon,
			alt: "",
			className: cn$2(fit < 1 ? "size-[29px] rounded-[22%]" : "size-9")
		}), index === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -bottom-2 size-1 rounded-full bg-white/90" })]
	}, name);
}

export { DashboardWelcomeTour };
