// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ClaudeCodeSetupModal.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { Badge } from "../../../../ui/src/components/Badge.js";
import { ArrowRightIcon, CheckIcon, CopyIcon, PlayIcon, SpinnerIcon, TerminalIcon } from "../../../../ui/src/icons.js";
import { Text$4 } from "../../../../ui/src/components/Text.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../ui/src/components/Dialog.js";
import { useIsDark } from "../../../../ui/src/hooks/useIsDark.js";
import { useClaudeStatus } from "../hooks/useClaudeStatus.js";
import { TerminalPanel } from "./panels/TerminalPanel.js";

var LOGIN_COMMAND = "claude /login";
var UPDATE_COMMAND = "claude update";
/** Same native installer `getClaudeStatus` returns. Used when a v2 status has no command. */
function nativeClaudeInstallCommand() {
	const platform = typeof navigator === "undefined" ? "" : navigator.platform;
	return /^Win/.test(platform) ? "curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd" : "curl -fsSL https://claude.ai/install.sh | bash";
}
var TERM_LIGHT$1 = {
	background: "#fafafa",
	foreground: "#27272a",
	cursor: "#27272a",
	selectionBackground: "#2563eb40",
	green: "#16a34a",
	brightGreen: "#16a34a",
	blue: "#2563eb",
	brightBlue: "#2563eb"
};
var TERM_DARK$1 = {
	background: "#141414",
	foreground: "#e4e4e7",
	cursor: "#e4e4e7",
	selectionBackground: "#7c9fff40",
	green: "#4ade80",
	brightGreen: "#4ade80",
	blue: "#7c9fff",
	brightBlue: "#7c9fff"
};
function phaseOf(status) {
	if (!status || !status.installed) return "install";
	if (status.requiredVersion) return "update";
	if (!status.loggedIn) return "login";
	return "allset";
}
var BADGE = {
	install: {
		label: "Not installed",
		dot: "bg-ed-warning"
	},
	update: {
		label: "Update required",
		dot: "bg-ed-warning"
	},
	login: {
		label: "Not logged in",
		dot: "bg-ed-warning"
	},
	allset: {
		label: "Connected",
		dot: "bg-ed-success"
	}
};
function StatusBadge(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { phase } = t0;
	const { label, dot } = BADGE[phase];
	let t1;
	if ($[0] !== dot) {
		t1 = cn$2("size-2 rounded-full", dot);
		$[0] = dot;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: t1 });
		$[2] = t1;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== label || $[5] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
			variant: "outline",
			className: "gap-1.5 border-ed-field-border bg-ed-field px-2.5 py-1 text-ed-ui leading-4 text-ed-foreground shadow-ed-control",
			children: [t2, label]
		});
		$[4] = label;
		$[5] = t2;
		$[6] = t3;
	} else t3 = $[6];
	return t3;
}
var TITLE = {
	install: "Install Claude Code",
	update: "Update Claude Code",
	login: "Log in to Claude Code",
	allset: "Claude Code is connected"
};
var STEP_HEADING = {
	install: "1. Install the Claude Code CLI",
	update: "1. Update Claude Code",
	login: "1. Log in to Claude Code",
	allset: "1. Log in to Claude Code"
};
var NEXT_STEP = {
	install: "Sign in with your Anthropic account when the CLI asks. Petal connects on its own once you are logged in.",
	update: "Petal picks up the new version on its own once the update finishes.",
	login: "Petal connects on its own once you are logged in.",
	allset: "Petal connects on its own once you are logged in."
};
var INTRO = {
	install: "Petal connects automatically to Claude Code on your computer, with your own subscription. Install it once and you’re set. Chat usage counts against your Claude plan.",
	update: "Your Claude Code is older than Petal supports, so chat can’t run yet. Update it and Petal connects automatically.",
	login: "Claude Code is installed but not signed in. Log in with your Anthropic account and Petal connects automatically.",
	allset: "Claude Code is installed and logged in, so Petal is connected automatically. Chat in Petal uses your own plan."
};
function ClaudeCodeSetupModal(props) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== props) {
		t0 = props.refresh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeCodeSetupView, {
			open: props.open,
			onOpenChange: props.onOpenChange,
			onConsent: props.onConsent,
			onContinue: props.onContinue,
			status: props.status ?? null,
			loading: props.loading ?? false,
			error: props.error ?? false,
			refresh: props.refresh
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeCodeSetupModalLocal, { ...props });
		$[0] = props;
		$[1] = t0;
	} else t0 = $[1];
	return t0;
}
function ClaudeCodeSetupModalLocal(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	const { open, onOpenChange, onConsent, onContinue } = t0;
	let t1;
	if ($[0] !== open) {
		t1 = { poll: open };
		$[0] = open;
		$[1] = t1;
	} else t1 = $[1];
	const local = useClaudeStatus(t1);
	let t2;
	if ($[2] !== local.error || $[3] !== local.loading || $[4] !== local.refresh || $[5] !== local.status || $[6] !== onConsent || $[7] !== onContinue || $[8] !== onOpenChange || $[9] !== open) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaudeCodeSetupView, {
			open,
			onOpenChange,
			onConsent,
			onContinue,
			status: local.status,
			loading: local.loading,
			error: local.error,
			refresh: local.refresh
		});
		$[2] = local.error;
		$[3] = local.loading;
		$[4] = local.refresh;
		$[5] = local.status;
		$[6] = onConsent;
		$[7] = onContinue;
		$[8] = onOpenChange;
		$[9] = open;
		$[10] = t2;
	} else t2 = $[10];
	return t2;
}
function ClaudeCodeSetupView(t0) {
	const $ = (0, import_compiler_runtime.c)(33);
	const { open, onOpenChange, onConsent, onContinue, status, loading, error, refresh } = t0;
	const dark = useIsDark();
	let t1;
	if ($[0] !== status) {
		t1 = phaseOf(status);
		$[0] = status;
		$[1] = t1;
	} else t1 = $[1];
	const phase = t1;
	const initializing = open && !status && loading;
	const unreachable = open && !status && error;
	const [running, setRunning] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [runId, setRunId] = (0, import_react.useState)(0);
	let t2;
	if ($[2] !== open || $[3] !== phase) {
		t2 = {
			phase,
			open
		};
		$[2] = open;
		$[3] = phase;
		$[4] = t2;
	} else t2 = $[4];
	const [resetKey, setResetKey] = (0, import_react.useState)(t2);
	if (phase !== resetKey.phase || open !== resetKey.open) {
		setResetKey({
			phase,
			open
		});
		setRunning(false);
	}
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = () => {
			setRunning(true);
			setRunId(_temp$48);
		};
		$[5] = t3;
	} else t3 = $[5];
	const runCommand = t3;
	let t4;
	if ($[6] !== phase || $[7] !== status?.installCommand) {
		t4 = phase === "install" ? status?.installCommand || nativeClaudeInstallCommand() : phase === "update" ? UPDATE_COMMAND : LOGIN_COMMAND;
		$[6] = phase;
		$[7] = status?.installCommand;
		$[8] = t4;
	} else t4 = $[8];
	const command = t4;
	let t5;
	if ($[9] !== command) {
		t5 = () => {
			navigator.clipboard?.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		};
		$[9] = command;
		$[10] = t5;
	} else t5 = $[10];
	const copyCommand = t5;
	let t6;
	if ($[11] !== onConsent || $[12] !== onContinue || $[13] !== onOpenChange) {
		t6 = () => {
			onConsent?.();
			if (onContinue) onContinue();
			else onOpenChange(false);
		};
		$[11] = onConsent;
		$[12] = onContinue;
		$[13] = onOpenChange;
		$[14] = t6;
	} else t6 = $[14];
	const handleConsent = t6;
	let t7;
	if ($[15] !== command || $[16] !== copied || $[17] !== copyCommand || $[18] !== dark || $[19] !== handleConsent || $[20] !== initializing || $[21] !== onOpenChange || $[22] !== phase || $[23] !== refresh || $[24] !== runId || $[25] !== running || $[26] !== status || $[27] !== unreachable) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "max-w-[560px]",
			children: unreachable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Couldn't check Claude Code" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
					className: "pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Petal couldn't reach the desktop app to see whether Claude Code is set up. This is usually temporary." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "xs",
					onClick: () => onOpenChange(false),
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "xs",
					onClick: () => void refresh(),
					children: "Try again"
				})] })
			] }) : initializing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Checking Claude Code" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-[220px] items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
					width: 28,
					height: 28,
					className: "animate-spin text-ed-muted-foreground"
				})
			}) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: TITLE[phase] }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-3 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: INTRO[phase] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { phase })
					})]
				}),
				phase === "allset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-[8px] border border-ed-divider px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {
								width: 16,
								height: 16,
								className: "shrink-0 text-ed-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									as: "p",
									size: "2xs",
									weight: "medium",
									children: "Claude Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
									as: "p",
									size: "3xs",
									variant: "tertiary",
									className: "truncate",
									children: [
										"Installed",
										status?.version ? ` · v${status.version}` : "",
										status?.account ? ` · ${status.account}` : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
								width: 16,
								height: 16,
								className: "ml-auto shrink-0 text-ed-success"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						as: "p",
						size: "3xs",
						variant: "tertiary",
						children: "Petal uses the Claude Code you have installed in your terminal, with your own subscription. Chat usage in Petal counts against your plan."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								as: "h3",
								size: "2xs",
								weight: "medium",
								children: STEP_HEADING[phase]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
								as: "p",
								size: "3xs",
								variant: "tertiary",
								children: [phase === "update" && status?.requiredVersion ? `Petal needs v${status.requiredVersion} or later${status.version ? `, and you have v${status.version}` : ""}. ` : "", "Run the command below in your terminal, or press Run to open a terminal here."]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex min-h-6.5 min-w-0 flex-1 items-center rounded-[5px] border border-ed-field-border bg-ed-field px-2 py-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-[11px] leading-4 text-ed-foreground",
											children: command
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "icon-xs",
										variant: "outline",
										"aria-label": "Copy command",
										LeftIcon: copied ? CheckIcon : CopyIcon,
										onClick: copyCommand
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "xs",
										variant: "outline",
										LeftIcon: PlayIcon,
										onClick: runCommand,
										children: running ? "Run again" : "Run"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-live": "polite",
										className: "sr-only",
										children: copied ? "Command copied" : ""
									})
								]
							}),
							running && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-64 w-full overflow-hidden rounded-[5px] border border-ed-field-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalPanel, {
										active: running,
										initialCommand: command,
										theme: dark ? TERM_DARK$1 : TERM_LIGHT$1
									}, `${phase}-${runId}`)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
									as: "p",
									size: "3xs",
									variant: "tertiary",
									children: [
										"Press ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "font-medium text-ed-foreground",
											children: "Enter"
										}),
										" to continue when prompted."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
									as: "p",
									size: "3xs",
									variant: "tertiary",
									children: "Press Esc to leave the terminal."
								})
							] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "h3",
							size: "2xs",
							weight: "medium",
							children: phase === "install" ? "2. Log in" : "2. Come back here"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: NEXT_STEP[phase]
						})]
					})]
				}),
				phase === "allset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "xs",
					RightIcon: ArrowRightIcon,
					onClick: handleConsent,
					children: "Yes, I understand"
				}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "xs",
					onClick: () => onOpenChange(false),
					children: "Skip for now"
				}) })
			] })
		});
		$[15] = command;
		$[16] = copied;
		$[17] = copyCommand;
		$[18] = dark;
		$[19] = handleConsent;
		$[20] = initializing;
		$[21] = onOpenChange;
		$[22] = phase;
		$[23] = refresh;
		$[24] = runId;
		$[25] = running;
		$[26] = status;
		$[27] = unreachable;
		$[28] = t7;
	} else t7 = $[28];
	let t8;
	if ($[29] !== onOpenChange || $[30] !== open || $[31] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange,
			children: t7
		});
		$[29] = onOpenChange;
		$[30] = open;
		$[31] = t7;
		$[32] = t8;
	} else t8 = $[32];
	return t8;
}
function _temp$48(n) {
	return n + 1;
}

export { ClaudeCodeSetupModal };
