// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ProjectsSidebarFeedback.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { getApiUrl } from "../client.js";
import { import_compiler_runtime, useSession } from "../hooks/useSession.js";
import { ChatIcon } from "../../../ui/src/icons.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { SidebarRow, SidebarRowIcon } from "../../../ui/src/components/SidebarRow.js";
import { toast } from "../../../../vendor/sonner.js";
import { usePostHog } from "../../../../vendor/@posthog/react.js";
import { isElectronApp } from "../utils/isElectronApp.js";

var CONTACT_EMAIL = "putri@petal.com";
/** PostHog Support is lazy-loaded and can hang; don't hold the dialog on it. */
var POSTHOG_TIMEOUT_MS = 5e3;
function ContactLink() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: `mailto:${CONTACT_EMAIL}`,
			className: "text-ed-foreground underline-offset-2 hover:underline",
			children: CONTACT_EMAIL
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
/**
* Opens a PostHog Support ticket. Returns its id, or null if PostHog couldn't
* take it — the conversations extension is loaded from a CDN and isn't always
* there, so this is best-effort on top of the API backup.
*/
async function sendPostHogTicket(posthog, message, user) {
	if (!posthog.conversations?.isAvailable()) return null;
	try {
		const traits = user ? {
			name: user.name,
			email: user.email
		} : void 0;
		return (await Promise.race([posthog.conversations.sendMessage(message, traits, true), new Promise((resolve) => setTimeout(() => resolve(null), POSTHOG_TIMEOUT_MS))]))?.ticket_id ?? null;
	} catch {
		return null;
	}
}
/** Emails the team and appends to the feedback sheet. Returns whether it landed. */
async function sendBackup(message, ticketId) {
	try {
		return (await fetch(`${getApiUrl()}/feedback`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message,
				source: isElectronApp() ? "desktop" : "web",
				pageUrl: window.location.href,
				...ticketId ? { ticketId } : {}
			})
		})).ok;
	} catch {
		return false;
	}
}
function ProjectsSidebarFeedback() {
	const $ = (0, import_compiler_runtime.c)(6);
	const [open, setOpen] = (0, import_react.useState)(false);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = () => setOpen(true);
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex w-full min-w-0 flex-col",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, {
				size: "sm",
				onClick: t0,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarRowIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatIcon, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Feedback" })]
			}) })
		});
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== open) {
		t2 = open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedbackDialog, {
			open: true,
			onOpenChange: setOpen
		});
		$[2] = open;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t1, t2] });
		$[4] = t2;
		$[5] = t3;
	} else t3 = $[5];
	return t3;
}
function FeedbackDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { open, onOpenChange, initialMessage: t1 } = t0;
	const initialMessage = t1 === void 0 ? "" : t1;
	const posthog = usePostHog();
	const { user } = useSession();
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [feedback, setFeedback] = (0, import_react.useState)(initialMessage);
	const [sent, setSent] = (0, import_react.useState)(false);
	let t2;
	if ($[0] !== feedback) {
		t2 = feedback.trim();
		$[0] = feedback;
		$[1] = t2;
	} else t2 = $[1];
	const message = t2;
	let t3;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = function handleKeyDown(event) {
			if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		};
		$[2] = t3;
	} else t3 = $[2];
	const handleKeyDown = t3;
	let t4;
	if ($[3] !== onOpenChange) {
		t4 = function handleOpenChange(nextOpen) {
			onOpenChange(nextOpen);
			if (!nextOpen) {
				setFeedback("");
				setSent(false);
			}
		};
		$[3] = onOpenChange;
		$[4] = t4;
	} else t4 = $[4];
	const handleOpenChange = t4;
	let t5;
	if ($[5] !== message || $[6] !== posthog || $[7] !== submitting || $[8] !== user) {
		t5 = async function handleSubmit(event_0) {
			event_0.preventDefault();
			if (!message || submitting) return;
			setSubmitting(true);
			const ticketId = await sendPostHogTicket(posthog, message, user);
			const backedUp = await sendBackup(message, ticketId);
			setSubmitting(false);
			if (!ticketId && !backedUp) {
				toast.error("Couldn’t send feedback. Try again.");
				return;
			}
			setFeedback("");
			setSent(true);
		};
		$[5] = message;
		$[6] = posthog;
		$[7] = submitting;
		$[8] = user;
		$[9] = t5;
	} else t5 = $[9];
	const handleSubmit = t5;
	let t6;
	if ($[10] !== feedback || $[11] !== handleOpenChange || $[12] !== handleSubmit || $[13] !== message || $[14] !== sent || $[15] !== submitting || $[16] !== user) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Thanks for the feedback" }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
				className: "pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [user?.email ? `We’ve got it. We’ll reply to ${user.email}.` : "We’ve got it. We’ll reply by email.", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block",
					children: [
						"You can also write to ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactLink, {}),
						"."
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "xs",
				onClick: () => setSent(false),
				children: "Send more"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "xs",
				onClick: () => handleOpenChange(false),
				children: "Done"
			})] })
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Share feedback" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "petal-feedback",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "petal-feedback",
						name: "feedback",
						"aria-label": "Your feedback",
						value: feedback,
						onChange: (event_1) => setFeedback(event_1.target.value),
						onKeyDown: handleKeyDown,
						placeholder: "What can we improve?",
						maxLength: 2e3,
						className: "min-h-32 w-full resize-y rounded-[5px] border border-ed-field-border bg-ed-field px-2 py-1.5 text-[11px] leading-4 text-ed-foreground placeholder:text-ed-muted-foreground/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ed-ring/50 focus-visible:border-ed-ring"
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "xs",
					onClick: () => handleOpenChange(false),
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "outline",
					size: "xs",
					disabled: !message || submitting,
					loading: submitting,
					children: "Send feedback"
				})] })
			]
		}) });
		$[10] = feedback;
		$[11] = handleOpenChange;
		$[12] = handleSubmit;
		$[13] = message;
		$[14] = sent;
		$[15] = submitting;
		$[16] = user;
		$[17] = t6;
	} else t6 = $[17];
	let t7;
	if ($[18] !== handleOpenChange || $[19] !== open || $[20] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: handleOpenChange,
			children: t6
		}) });
		$[18] = handleOpenChange;
		$[19] = open;
		$[20] = t6;
		$[21] = t7;
	} else t7 = $[21];
	return t7;
}

export { FeedbackDialog, ProjectsSidebarFeedback };
