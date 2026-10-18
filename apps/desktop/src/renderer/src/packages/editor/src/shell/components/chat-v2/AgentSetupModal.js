// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/AgentSetupModal.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { ArrowRightIcon, ArrowSquareOutIcon, CheckIcon, CopyIcon, PlayIcon, SpinnerIcon, TerminalIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../../ui/src/components/Dialog.js";
import { useIsDark } from "../../../../../ui/src/hooks/useIsDark.js";
import { PanelEmptyState } from "../panels/PanelEmptyState.js";
import { TerminalPanel } from "../panels/TerminalPanel.js";
import { setupCopy, upgradeDescription } from "./setupCopy.js";
import { openUpgradePage } from "./useAgentSetup.js";

/**
* Generic setup gate for every v2 agent (`AgentSetupModal` + `AgentSetupPanel`).
*
* Built from the v1 `ClaudeCodeSetupView` layout: the same phases (install,
* login, all set), command row with Copy and Run (embedded
* `TerminalPanel`), numbered steps, "couldn't check" and loading states, and
* the usage-consent step. Commands come from `status.installCommand` /
* `status.loginCommand`; titles use `agent.label`. A status with
* `requiredVersion` (CLI present at the wrong version) asks for an update
* instead of an install. An agent whose status sets `signInInApp` (Cursor)
* signs in from the app, so it gets a sign-in button in place of the terminal
* command, and a Sign out button once `status.signedInVia` is `app`. Per-agent
* wording, including how each sign-in relates to its CLI and which shell API
* keys take priority, lives in `setupCopy.ts`; unknown agents get generic
* wording. A signed-in account whose plan can't run the agent
* (`status.upgradeRequired`) gets an upgrade step with a link to the plans and
* Sign out, to switch accounts.
*/
/** "A or B" for the env-var note. */
function joinOr(names) {
	return names.length > 1 ? `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}` : names[0] ?? "";
}
/** Fallback commands when a status carries none. The drivers always send both. */
function fallbackInstallCommand(agentId) {
	if (agentId === "claude-code") {
		const platform = typeof navigator === "undefined" ? "" : navigator.platform;
		return /^Win/.test(platform) ? "curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd" : "curl -fsSL https://claude.ai/install.sh | bash";
	}
	if (agentId === "codex") return "npm install -g @openai/codex";
	if (agentId === "opencode") return "npm install -g @opencode/cli";
	return "";
}
function fallbackLoginCommand(agentId) {
	if (agentId === "claude-code") return "claude auth login";
	if (agentId === "codex") return "codex login";
	if (agentId === "opencode") return "opencode auth login";
	return "";
}
var TERM_LIGHT = {
	background: "#fafafa",
	foreground: "#27272a",
	cursor: "#27272a",
	selectionBackground: "#2563eb40",
	green: "#16a34a",
	brightGreen: "#16a34a",
	blue: "#2563eb",
	brightBlue: "#2563eb"
};
var TERM_DARK = {
	background: "#141414",
	foreground: "#e4e4e7",
	cursor: "#e4e4e7",
	selectionBackground: "#7c9fff40",
	green: "#4ade80",
	brightGreen: "#4ade80",
	blue: "#7c9fff",
	brightBlue: "#7c9fff"
};
function setupPhaseOf(status) {
	if (!status || !status.installed) return "install";
	if (!status.loggedIn) return "login";
	if (status.upgradeRequired) return "upgrade";
	return "allset";
}
function AgentSetupModal(t0) {
	const $ = (0, import_compiler_runtime.c)(92);
	const { open, onOpenChange, agent, onConsent, onContinue, status: t1, loading: t2, error: t3, refresh, onSignIn, onSignOut } = t0;
	const status = t1 === void 0 ? null : t1;
	const loading = t2 === void 0 ? false : t2;
	const error = t3 === void 0 ? false : t3;
	const dark = useIsDark();
	let t4;
	if ($[0] !== status) {
		t4 = setupPhaseOf(status);
		$[0] = status;
		$[1] = t4;
	} else t4 = $[1];
	const phase = t4;
	const initializing = open && !status && loading;
	const unreachable = open && !status && error;
	const [running, setRunning] = (0, import_react.useState)(false);
	const [signingIn, setSigningIn] = (0, import_react.useState)(false);
	const [signInFailed, setSignInFailed] = (0, import_react.useState)(false);
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const [signOutFailed, setSignOutFailed] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [runId, setRunId] = (0, import_react.useState)(0);
	let t5;
	if ($[2] !== open || $[3] !== phase) {
		t5 = {
			phase,
			open
		};
		$[2] = open;
		$[3] = phase;
		$[4] = t5;
	} else t5 = $[4];
	const [resetKey, setResetKey] = (0, import_react.useState)(t5);
	if (phase !== resetKey.phase || open !== resetKey.open) {
		setResetKey({
			phase,
			open
		});
		setRunning(false);
		setSignInFailed(false);
		setSignOutFailed(false);
	}
	const inApp = !!status?.signInInApp && !!onSignIn;
	let t6;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = () => {
			setRunning(true);
			setRunId(_temp$33);
		};
		$[5] = t6;
	} else t6 = $[5];
	const runCommand = t6;
	let t7;
	if ($[6] !== onSignIn || $[7] !== refresh || $[8] !== signingIn) {
		t7 = () => {
			if (!onSignIn || signingIn) return;
			setSigningIn(true);
			setSignInFailed(false);
			onSignIn().catch(() => setSignInFailed(true)).finally(() => {
				setSigningIn(false);
				refresh?.();
			});
		};
		$[6] = onSignIn;
		$[7] = refresh;
		$[8] = signingIn;
		$[9] = t7;
	} else t7 = $[9];
	const signIn = t7;
	let t8;
	if ($[10] !== onSignOut || $[11] !== refresh || $[12] !== signingOut) {
		t8 = () => {
			if (!onSignOut || signingOut) return;
			setSigningOut(true);
			setSignOutFailed(false);
			onSignOut().catch(() => setSignOutFailed(true)).finally(() => {
				setSigningOut(false);
				refresh?.();
			});
		};
		$[10] = onSignOut;
		$[11] = refresh;
		$[12] = signingOut;
		$[13] = t8;
	} else t8 = $[13];
	const signOut = t8;
	let canSignOut;
	let copy;
	let t9;
	let viaCli;
	let viaEnv;
	if ($[14] !== agent.id || $[15] !== inApp || $[16] !== onSignOut || $[17] !== status?.signedInVia) {
		copy = setupCopy(agent.id);
		viaEnv = status?.signedInVia === "env";
		viaCli = status?.signedInVia === "cli";
		canSignOut = inApp && status?.signedInVia === "app" && !!onSignOut;
		t9 = copy.envVars?.length ? `${joinOr(copy.envVars)} in your shell takes priority over signing in here.` : null;
		$[14] = agent.id;
		$[15] = inApp;
		$[16] = onSignOut;
		$[17] = status?.signedInVia;
		$[18] = canSignOut;
		$[19] = copy;
		$[20] = t9;
		$[21] = viaCli;
		$[22] = viaEnv;
	} else {
		canSignOut = $[18];
		copy = $[19];
		t9 = $[20];
		viaCli = $[21];
		viaEnv = $[22];
	}
	const envPriority = t9;
	let t10;
	if ($[23] !== agent.id || $[24] !== phase || $[25] !== status?.installCommand || $[26] !== status?.loginCommand) {
		t10 = phase === "install" ? status?.installCommand || fallbackInstallCommand(agent.id) : status?.loginCommand || fallbackLoginCommand(agent.id);
		$[23] = agent.id;
		$[24] = phase;
		$[25] = status?.installCommand;
		$[26] = status?.loginCommand;
		$[27] = t10;
	} else t10 = $[27];
	const command = t10;
	let t11;
	if ($[28] !== command) {
		t11 = () => {
			if (!command) return;
			navigator.clipboard?.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		};
		$[28] = command;
		$[29] = t11;
	} else t11 = $[29];
	const copyCommand = t11;
	let t12;
	if ($[30] !== onConsent || $[31] !== onContinue || $[32] !== onOpenChange) {
		t12 = () => {
			onConsent?.();
			if (onContinue) onContinue();
			else onOpenChange(false);
		};
		$[30] = onConsent;
		$[31] = onContinue;
		$[32] = onOpenChange;
		$[33] = t12;
	} else t12 = $[33];
	const handleConsent = t12;
	const outdated = phase === "install" && !!status?.requiredVersion;
	const title = outdated ? `Update ${agent.label}` : phase === "install" ? `Install ${agent.label}` : phase === "login" ? `Log in to ${agent.label}` : phase === "upgrade" ? `Upgrade your ${agent.label} plan` : `${agent.label} is connected`;
	let t13;
	if ($[34] !== agent || $[35] !== copy || $[36] !== outdated || $[37] !== phase || $[38] !== status) {
		t13 = outdated ? `Petal needs ${agent.label} v${status?.requiredVersion} or later.${status?.version ? ` This computer has v${status.version}.` : ""}` : phase === "install" ? `Petal uses ${agent.label} on your computer. Usage counts against ${copy.plan}.` : phase === "upgrade" ? `${upgradeDescription(agent)} Upgrade to a paid plan, or sign in with an account that has one.` : `Usage counts against ${copy.plan}.`;
		$[34] = agent;
		$[35] = copy;
		$[36] = outdated;
		$[37] = phase;
		$[38] = status;
		$[39] = t13;
	} else t13 = $[39];
	const intro = t13;
	let t14;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {
			width: 16,
			height: 16,
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[40] = t14;
	} else t14 = $[40];
	let t15;
	if ($[41] !== agent.label) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "2xs",
			weight: "medium",
			children: agent.label
		});
		$[41] = agent.label;
		$[42] = t15;
	} else t15 = $[42];
	const t16 = viaEnv ? `Using ${status?.envVar ?? "an API key"}` : inApp || viaCli ? "Signed in" : "Installed";
	const t17 = status?.version ? ` · v${status.version}` : "";
	const t18 = status?.account ? ` · ${status.account}` : "";
	let t19;
	if ($[43] !== t16 || $[44] !== t17 || $[45] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			className: "truncate",
			children: [
				t16,
				t17,
				t18
			]
		});
		$[43] = t16;
		$[44] = t17;
		$[45] = t18;
		$[46] = t19;
	} else t19 = $[46];
	let t20;
	if ($[47] !== t15 || $[48] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 flex-col",
			children: [t15, t19]
		});
		$[47] = t15;
		$[48] = t19;
		$[49] = t20;
	} else t20 = $[49];
	let t21;
	if ($[50] !== canSignOut || $[51] !== phase || $[52] !== signOut || $[53] !== signingOut) {
		t21 = canSignOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "xs",
			variant: "outline",
			className: "ml-auto shrink-0",
			loading: signingOut,
			onClick: signOut,
			children: "Sign out"
		}) : phase === "allset" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
			width: 16,
			height: 16,
			className: "ml-auto shrink-0 text-ed-success"
		});
		$[50] = canSignOut;
		$[51] = phase;
		$[52] = signOut;
		$[53] = signingOut;
		$[54] = t21;
	} else t21 = $[54];
	let t22;
	if ($[55] !== t20 || $[56] !== t21) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-[8px] border border-ed-divider px-4 py-3",
			children: [
				t14,
				t20,
				t21
			]
		});
		$[55] = t20;
		$[56] = t21;
		$[57] = t22;
	} else t22 = $[57];
	const accountRow = t22;
	let t23;
	if ($[58] !== signOutFailed) {
		t23 = signOutFailed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "2xs",
			className: "text-ed-destructive",
			children: "Sign-out didn't finish. Try again."
		});
		$[58] = signOutFailed;
		$[59] = t23;
	} else t23 = $[59];
	const signOutError = t23;
	let t24;
	if ($[60] !== accountRow || $[61] !== agent.label || $[62] !== canSignOut || $[63] !== command || $[64] !== copied || $[65] !== copy || $[66] !== copyCommand || $[67] !== dark || $[68] !== envPriority || $[69] !== handleConsent || $[70] !== inApp || $[71] !== initializing || $[72] !== intro || $[73] !== onOpenChange || $[74] !== outdated || $[75] !== phase || $[76] !== refresh || $[77] !== runId || $[78] !== running || $[79] !== signIn || $[80] !== signInFailed || $[81] !== signOutError || $[82] !== signingIn || $[83] !== status || $[84] !== title || $[85] !== unreachable || $[86] !== viaEnv) {
		t24 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			className: "max-w-[560px]",
			children: unreachable ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Couldn't check ", agent.label] }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
					className: "pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Petal couldn't reach the desktop app." })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "xs",
					onClick: () => onOpenChange(false),
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "xs",
					onClick: () => void refresh?.(),
					children: "Try again"
				})] })
			] }) : initializing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Checking ", agent.label] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-[220px] items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
					width: 28,
					height: 28,
					className: "animate-spin text-ed-muted-foreground"
				})
			}) })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: title }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
					className: "pt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: intro })
				}),
				phase === "upgrade" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-4",
					children: [
						accountRow,
						signOutError,
						status?.upgradeUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "xs",
								variant: "outline",
								LeftIcon: ArrowSquareOutIcon,
								onClick: () => openUpgradePage(status.upgradeUrl),
								children: [
									"See ",
									agent.label,
									" plans"
								]
							})
						})
					]
				}) : phase === "allset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-4",
					children: [
						accountRow,
						signOutError,
						viaEnv && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: `Petal is using ${status?.envVar ?? "an API key"} from your shell, which takes priority over signing in here. To stop using it, remove it from your shell profile and restart Petal.`
						}),
						!viaEnv && copy.signInScope && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: copy.signInScope
						}),
						canSignOut && copy.signOutScope && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: copy.signOutScope
						})
					]
				}) : inApp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: [
								"Your browser opens ",
								agent.label,
								"'s sign-in page. Approve it there, then come back."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "xs",
								variant: "outline",
								LeftIcon: ArrowRightIcon,
								loading: signingIn,
								onClick: signIn,
								children: signingIn ? "Waiting for the browser…" : `Sign in with ${agent.label}`
							})
						}),
						signInFailed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "2xs",
							className: "text-ed-destructive",
							children: "Sign-in didn't finish. Try again."
						}),
						copy.signInScope && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: copy.signInScope
						}),
						envPriority && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: envPriority
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
					className: "gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								as: "h3",
								size: "2xs",
								weight: "medium",
								children: outdated ? `1. Update the ${agent.label} CLI` : phase === "install" ? `1. Install the ${agent.label} CLI` : `1. Log in to ${agent.label}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
								as: "p",
								size: "3xs",
								variant: "tertiary",
								children: "Run this in your terminal, or press Run."
							}),
							command && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							running && command && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-64 w-full overflow-hidden rounded-[5px] border border-ed-field-border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalPanel, {
										active: running,
										initialCommand: command,
										theme: dark ? TERM_DARK : TERM_LIGHT
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
						}), phase === "install" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
							as: "p",
							size: "3xs",
							variant: "tertiary",
							children: [
								"Sign in with ",
								copy.account,
								" when the CLI asks."
							]
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
		$[60] = accountRow;
		$[61] = agent.label;
		$[62] = canSignOut;
		$[63] = command;
		$[64] = copied;
		$[65] = copy;
		$[66] = copyCommand;
		$[67] = dark;
		$[68] = envPriority;
		$[69] = handleConsent;
		$[70] = inApp;
		$[71] = initializing;
		$[72] = intro;
		$[73] = onOpenChange;
		$[74] = outdated;
		$[75] = phase;
		$[76] = refresh;
		$[77] = runId;
		$[78] = running;
		$[79] = signIn;
		$[80] = signInFailed;
		$[81] = signOutError;
		$[82] = signingIn;
		$[83] = status;
		$[84] = title;
		$[85] = unreachable;
		$[86] = viaEnv;
		$[87] = t24;
	} else t24 = $[87];
	let t25;
	if ($[88] !== onOpenChange || $[89] !== open || $[90] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange,
			children: t24
		});
		$[88] = onOpenChange;
		$[89] = open;
		$[90] = t24;
		$[91] = t25;
	} else t25 = $[91];
	return t25;
}
function _temp$33(n) {
	return n + 1;
}
/**
* In-panel setup info for the v2 gate: the exact v1 `PanelEmptyState` setup
* block, generalized to any agent.
*/
function AgentSetupPanel(t0) {
	const $ = (0, import_compiler_runtime.c)(18);
	const { agent, onSetup, status, variant: t1 } = t0;
	const variant = t1 === void 0 ? "default" : t1;
	const upgradeUrl = status?.upgradeRequired ? status.upgradeUrl : void 0;
	let t2;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {
			width: 24,
			height: 24,
			className: "text-ed-muted-foreground"
		});
		$[0] = t2;
	} else t2 = $[0];
	let t3;
	if ($[1] !== agent || $[2] !== status?.upgradeRequired) {
		t3 = status?.upgradeRequired ? upgradeDescription(agent) : `Use ${setupCopy(agent.id).subscription} in Petal.`;
		$[1] = agent;
		$[2] = status?.upgradeRequired;
		$[3] = t3;
	} else t3 = $[3];
	const t4 = variant === "sidebar-v2" ? "xs" : "default";
	let t5;
	if ($[4] !== upgradeUrl) {
		t5 = upgradeUrl ? { RightIcon: ArrowSquareOutIcon } : {};
		$[4] = upgradeUrl;
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] !== onSetup || $[7] !== upgradeUrl) {
		t6 = upgradeUrl ? () => openUpgradePage(upgradeUrl) : onSetup;
		$[6] = onSetup;
		$[7] = upgradeUrl;
		$[8] = t6;
	} else t6 = $[8];
	const t7 = status?.upgradeRequired ? `Upgrade ${agent.label}` : `Setup ${agent.label}`;
	let t8;
	if ($[9] !== t4 || $[10] !== t5 || $[11] !== t6 || $[12] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: t4,
			className: "w-full",
			...t5,
			onClick: t6,
			children: t7
		});
		$[9] = t4;
		$[10] = t5;
		$[11] = t6;
		$[12] = t7;
		$[13] = t8;
	} else t8 = $[13];
	let t9;
	if ($[14] !== agent.label || $[15] !== t3 || $[16] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelEmptyState, {
			icon: t2,
			title: agent.label,
			description: t3,
			actions: t8
		});
		$[14] = agent.label;
		$[15] = t3;
		$[16] = t8;
		$[17] = t9;
	} else t9 = $[17];
	return t9;
}

export { AgentSetupModal, AgentSetupPanel };
