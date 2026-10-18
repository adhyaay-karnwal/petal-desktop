// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/ChatUiCards.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../../ui/src/lib/utils.js";
import { ArrowUpIcon, CheckIcon, SpinnerIcon } from "../../../../../ui/src/icons.js";
import { Button } from "../../../../../ui/src/components/Button.js";

/** One `<question> <answer>` line per question, matching the `ask_user` tool contract. */
function formatAskUserReply(questions, answers) {
	return questions.map((question, i) => `${question.question} ${answers[i]}`).join("\n");
}
/**
* Interactive multiple-choice question card fed by the `ask_user` MCP tool —
* one question at a time; the collected answers go back as a single reply.
* Every question is answered by picking an option; a custom answer can still
* be typed in the composer while the card is up.
*/
function AskUserCard(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { questions, onReply } = t0;
	const [index, setIndex] = (0, import_react.useState)(0);
	const answersRef = (0, import_react.useRef)([]);
	const optionsRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] !== index || $[1] !== questions.length) {
		t1 = () => {
			if (index > 0 && index < questions.length) optionsRef.current?.querySelector("button")?.focus();
		};
		t2 = [index, questions.length];
		$[0] = index;
		$[1] = questions.length;
		$[2] = t1;
		$[3] = t2;
	} else {
		t1 = $[2];
		t2 = $[3];
	}
	(0, import_react.useEffect)(t1, t2);
	const advance = (answer) => {
		answersRef.current[index] = answer;
		if (index + 1 < questions.length) {
			setIndex(index + 1);
			return;
		}
		setIndex(questions.length);
		onReply(formatAskUserReply(questions, answersRef.current));
	};
	if (index >= questions.length) return null;
	const current = questions[index];
	const t3 = "min-w-0 max-w-full rounded-lg border border-ed-border bg-ed-muted/30";
	let t4;
	if ($[4] !== index || $[5] !== questions.length) {
		t4 = questions.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "text-ed-chat text-ed-muted-foreground/70",
			children: [
				"Question ",
				index + 1,
				" of ",
				questions.length
			]
		});
		$[4] = index;
		$[5] = questions.length;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] !== current.question) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-ed-chat font-medium text-ed-foreground",
			children: current.question
		});
		$[7] = current.question;
		$[8] = t5;
	} else t5 = $[8];
	let t6;
	if ($[9] !== t4 || $[10] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-0.5 px-3 pt-2.5 pb-2",
			children: [t4, t5]
		});
		$[9] = t4;
		$[10] = t5;
		$[11] = t6;
	} else t6 = $[11];
	const t7 = "flex flex-col divide-y divide-ed-border border-t border-ed-border";
	const t8 = current.options.map((option, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => advance(option.label),
		className: "group flex w-full cursor-default items-start gap-2.5 px-3 py-2 text-left last:rounded-b-lg hover:bg-ed-accent focus-visible:bg-ed-accent focus-visible:outline-none",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex min-w-0 flex-1 flex-col gap-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ed-chat font-medium leading-5 text-ed-foreground",
				children: option.label
			}), option.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ed-chat leading-[1.45] text-pretty text-ed-muted-foreground",
				children: option.description
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpIcon, {
			width: 12,
			height: 12,
			"aria-hidden": true,
			className: "mt-1 shrink-0 text-ed-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
		})]
	}, i));
	let t9;
	if ($[12] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: optionsRef,
			className: t7,
			children: t8
		});
		$[12] = t8;
		$[13] = t9;
	} else t9 = $[13];
	let t10;
	if ($[14] !== t6 || $[15] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t3,
			children: [t6, t9]
		});
		$[14] = t6;
		$[15] = t9;
		$[16] = t10;
	} else t10 = $[16];
	return t10;
}
/**
* The single import checklist card, rendered once at the bottom of the
* conversation. `liveDetail` is the current tool activity (derived from the
* stream, not agent-authored) shown under the active step.
*/
function ImportProgressCard(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { progress, liveDetail, running, onResume } = t0;
	let t1;
	if ($[0] !== progress.steps) {
		t1 = progress.steps.findIndex(_temp$27);
		$[0] = progress.steps;
		$[1] = t1;
	} else t1 = $[1];
	const detailIndex = t1;
	const t2 = progress.title ?? "Importing design system";
	let t3;
	if ($[2] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1.5 text-ed-chat font-medium text-ed-foreground",
			children: t2
		});
		$[2] = t2;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== detailIndex || $[5] !== liveDetail || $[6] !== progress.steps || $[7] !== running) {
		let t5;
		if ($[9] !== detailIndex || $[10] !== liveDetail || $[11] !== running) {
			t5 = (step_0, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-2 text-ed-chat leading-5",
					children: [step_0.status === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
						width: 12,
						height: 12,
						className: "shrink-0 text-ed-foreground"
					}) : step_0.status === "active" && running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
						width: 12,
						height: 12,
						className: "shrink-0 animate-spin text-ed-muted-foreground"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3 shrink-0 rounded-full border border-ed-border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn$2("min-w-0 truncate", step_0.status === "active" ? "text-ed-foreground" : step_0.status === "done" ? "text-ed-muted-foreground" : "text-ed-muted-foreground/60"),
						children: step_0.label
					})]
				}), index === detailIndex && running && liveDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 truncate pl-5 text-ed-chat leading-5 text-ed-muted-foreground/60",
					children: liveDetail
				})]
			}, index);
			$[9] = detailIndex;
			$[10] = liveDetail;
			$[11] = running;
			$[12] = t5;
		} else t5 = $[12];
		t4 = progress.steps.map(t5);
		$[4] = detailIndex;
		$[5] = liveDetail;
		$[6] = progress.steps;
		$[7] = running;
		$[8] = t4;
	} else t4 = $[8];
	let t5;
	if ($[13] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-1",
			children: t4
		});
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== onResume) {
		t6 = onResume && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "xs",
				variant: "outline",
				onClick: onResume,
				children: "Resume import"
			})
		});
		$[15] = onResume;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== t3 || $[18] !== t5 || $[19] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 max-w-full rounded-lg border border-ed-border bg-ed-muted/30 px-3 py-2.5",
			children: [
				t3,
				t5,
				t6
			]
		});
		$[17] = t3;
		$[18] = t5;
		$[19] = t6;
		$[20] = t7;
	} else t7 = $[20];
	return t7;
}
function _temp$27(step) {
	return step.status === "active";
}

export { AskUserCard, ImportProgressCard };
