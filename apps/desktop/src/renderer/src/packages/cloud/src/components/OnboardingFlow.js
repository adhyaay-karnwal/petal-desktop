// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/OnboardingFlow.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { n$2, r$13, s$11 } from "../../../../vendor/@phosphor-icons/react.js";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../../../ui/src/components/InputGroup.js";
import { Separator } from "../../../ui/src/components/Separator.js";
import { logoText_default } from "../assets/logoText.png.js";
import { useOnboardingState, useSaveOnboarding } from "../hooks/useOnboarding.js";
import { useOnboardingController } from "../hooks/useOnboardingController.js";
import { ONBOARDING_STEPS } from "../constants/steps.js";
import { OnboardingOptionGroup } from "./OnboardingOptionGroup.js";

var OnboardingContext = (0, import_react.createContext)(null);
function useOnboarding() {
	const ctx = (0, import_react.useContext)(OnboardingContext);
	if (!ctx) throw new Error("useOnboarding must be used within OnboardingFlow");
	return ctx;
}
var SubmitStatusContext = (0, import_react.createContext)({
	isSaving: false,
	failed: false
});
var useSubmitStatus = () => {
	return (0, import_react.useContext)(SubmitStatusContext);
};
function SubmitError() {
	const $ = (0, import_compiler_runtime.c)(1);
	const { failed } = useSubmitStatus();
	if (!failed) return null;
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "alert",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "xs",
				variant: "danger",
				children: "We couldn't save your answers. Please try again."
			})
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function OnboardingCard(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { children } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: logoText_default,
			alt: "Petal",
			className: "h-8 w-auto shrink-0 [.editor-dark_&]:invert"
		});
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== children) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-screen w-full flex-col items-center overflow-y-auto bg-ed-muted px-4 py-16",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "m-auto flex w-full flex-col items-center gap-8",
				children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-[448px] max-w-full shrink-0 overflow-hidden rounded-3xl border border-ed-border bg-ed-background shadow-2xl/7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col",
						children
					})
				})]
			})
		});
		$[1] = children;
		$[2] = t2;
	} else t2 = $[2];
	return t2;
}
function LabeledDivider(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { id, children } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "flex-1" });
		$[0] = t1;
	} else t1 = $[0];
	let t2;
	if ($[1] !== children || $[2] !== id) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			id,
			size: "xs",
			variant: "tertiary",
			className: "shrink-0",
			children
		});
		$[1] = children;
		$[2] = id;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "flex-1" });
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				t1,
				t2,
				t3
			]
		});
		$[5] = t2;
		$[6] = t4;
	} else t4 = $[6];
	return t4;
}
var pad2 = (n) => String(n).padStart(2, "0");
function StepProgress() {
	const $ = (0, import_compiler_runtime.c)(13);
	const { steps, stepIndex, canGoBack, back } = useOnboarding();
	let t0;
	if ($[0] !== back || $[1] !== canGoBack) {
		t0 = canGoBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: back,
			"aria-label": "Back",
			className: "-ml-1.5 flex size-6 items-center justify-center rounded-md text-ed-muted-foreground outline-none hover:bg-ed-secondary hover:text-ed-foreground focus-visible:ring-2 focus-visible:ring-ed-ring",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$11, {
				size: 16,
				weight: "bold"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-6" });
		$[0] = back;
		$[1] = canGoBack;
		$[2] = t0;
	} else t0 = $[2];
	const t1 = stepIndex + 1;
	let t2;
	if ($[3] !== t1) {
		t2 = pad2(t1);
		$[3] = t1;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== steps.length) {
		t3 = pad2(steps.length);
		$[5] = steps.length;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== t2 || $[8] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			"aria-hidden": true,
			className: "text-sm tracking-wide text-ed-muted-foreground tabular-nums",
			children: [
				t2,
				" / ",
				t3
			]
		});
		$[7] = t2;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== t0 || $[11] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between px-8 pt-8",
			children: [t0, t4]
		});
		$[10] = t0;
		$[11] = t4;
		$[12] = t5;
	} else t5 = $[12];
	return t5;
}
function StepHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { step, active, titleId, subtitleId } = t0;
	const headingRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] !== active) {
		t1 = () => {
			if (active) headingRef.current?.focus();
		};
		t2 = [active];
		$[0] = active;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useEffect)(t1, t2);
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = { lineHeight: 1.2 };
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== step.title || $[5] !== titleId) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			ref: headingRef,
			id: titleId,
			tabIndex: -1,
			className: "m-0 text-base leading-6 tracking-[-0.02em] font-semibold text-ed-foreground outline-none",
			style: t3,
			children: step.title
		});
		$[4] = step.title;
		$[5] = titleId;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] !== step.subtitle || $[8] !== subtitleId) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			id: subtitleId,
			size: "sm",
			variant: "tertiary",
			className: "text-pretty",
			children: step.subtitle
		});
		$[7] = step.subtitle;
		$[8] = subtitleId;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== t4 || $[11] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2 px-8 pt-4 pb-8",
			children: [t4, t5]
		});
		$[10] = t4;
		$[11] = t5;
		$[12] = t6;
	} else t6 = $[12];
	return t6;
}
function StepFooter() {
	const $ = (0, import_compiler_runtime.c)(10);
	const { next, skip, canContinue } = useOnboarding();
	const { isSaving } = useSubmitStatus();
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubmitError, {});
		$[0] = t0;
	} else t0 = $[0];
	const t1 = !canContinue || isSaving;
	let t2;
	if ($[1] !== next || $[2] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "default",
			className: "w-full",
			RightIcon: r$13,
			onClick: next,
			disabled: t1,
			children: "Continue"
		});
		$[1] = next;
		$[2] = t1;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== isSaving || $[5] !== skip) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			className: "w-full",
			onClick: skip,
			disabled: isSaving,
			children: "Skip for now"
		});
		$[4] = isSaving;
		$[5] = skip;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== t2 || $[8] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto flex flex-col gap-2",
			children: [
				t0,
				t2,
				t3
			]
		});
		$[7] = t2;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	return t4;
}
function FollowStepBody(t0) {
	const $ = (0, import_compiler_runtime.c)(42);
	const { step, active, titleId, subtitleId } = t0;
	const { text, setText, next, skip, canContinue } = useOnboarding();
	const { isSaving } = useSubmitStatus();
	const usernameId = (0, import_react.useId)();
	const { handle, usernameKey } = step;
	let t1;
	if ($[0] !== active || $[1] !== step || $[2] !== subtitleId || $[3] !== titleId) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepHeader, {
			step,
			active,
			titleId,
			subtitleId
		});
		$[0] = active;
		$[1] = step;
		$[2] = subtitleId;
		$[3] = titleId;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== handle) {
		t2 = () => window.open(`https://x.com/${handle}`, "_blank", "noopener,noreferrer");
		$[5] = handle;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== handle || $[8] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			className: "w-full",
			LeftIcon: n$2,
			onClick: t2,
			children: ["Follow @", handle]
		});
		$[7] = handle;
		$[8] = t2;
		$[9] = t3;
	} else t3 = $[9];
	let t4;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabeledDivider, { children: "Can we follow you back?" });
		$[10] = t4;
	} else t4 = $[10];
	let t5;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "sm",
			weight: "medium",
			children: "Your X Username"
		});
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== usernameId) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: usernameId,
			children: t5
		});
		$[12] = usernameId;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupText, {
				className: "text-sm text-ed-muted-foreground",
				children: "@"
			})
		});
		$[14] = t7;
	} else t7 = $[14];
	const t8 = text[usernameKey] ?? "";
	let t9;
	if ($[15] !== setText || $[16] !== usernameKey) {
		t9 = (e) => setText(usernameKey, e.target.value);
		$[15] = setText;
		$[16] = usernameKey;
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== t8 || $[19] !== t9 || $[20] !== usernameId) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
			className: "h-[42px] rounded-xl border border-ed-border",
			children: [t7, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
				id: usernameId,
				placeholder: "username",
				value: t8,
				onChange: t9
			})]
		});
		$[18] = t8;
		$[19] = t9;
		$[20] = usernameId;
		$[21] = t10;
	} else t10 = $[21];
	let t11;
	if ($[22] !== t10 || $[23] !== t6) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [t6, t10]
		});
		$[22] = t10;
		$[23] = t6;
		$[24] = t11;
	} else t11 = $[24];
	let t12;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubmitError, {});
		$[25] = t12;
	} else t12 = $[25];
	const t13 = !canContinue || isSaving;
	let t14;
	if ($[26] !== next || $[27] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "default",
			className: "w-full",
			RightIcon: r$13,
			onClick: next,
			disabled: t13,
			children: "Submit"
		});
		$[26] = next;
		$[27] = t13;
		$[28] = t14;
	} else t14 = $[28];
	let t15;
	if ($[29] !== isSaving || $[30] !== skip) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			className: "w-full",
			onClick: skip,
			disabled: isSaving,
			children: "Maybe later"
		});
		$[29] = isSaving;
		$[30] = skip;
		$[31] = t15;
	} else t15 = $[31];
	let t16;
	if ($[32] !== t14 || $[33] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-auto flex flex-col gap-2",
			children: [
				t12,
				t14,
				t15
			]
		});
		$[32] = t14;
		$[33] = t15;
		$[34] = t16;
	} else t16 = $[34];
	let t17;
	if ($[35] !== t11 || $[36] !== t16 || $[37] !== t3) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-8 px-8 pb-8",
			children: [
				t3,
				t4,
				t11,
				t16
			]
		});
		$[35] = t11;
		$[36] = t16;
		$[37] = t3;
		$[38] = t17;
	} else t17 = $[38];
	let t18;
	if ($[39] !== t1 || $[40] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t1, t17] });
		$[39] = t1;
		$[40] = t17;
		$[41] = t18;
	} else t18 = $[41];
	return t18;
}
function OnboardingStep(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	const { step, active } = t0;
	const { answers, setSelected, text, setText } = useOnboarding();
	const titleId = (0, import_react.useId)();
	const subtitleId = (0, import_react.useId)();
	if (step.kind === "follow") {
		let t1;
		if ($[0] !== active || $[1] !== step || $[2] !== subtitleId || $[3] !== titleId) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowStepBody, {
				step,
				active,
				titleId,
				subtitleId
			});
			$[0] = active;
			$[1] = step;
			$[2] = subtitleId;
			$[3] = titleId;
			$[4] = t1;
		} else t1 = $[4];
		return t1;
	}
	let t1;
	if ($[5] !== active || $[6] !== step || $[7] !== subtitleId || $[8] !== titleId) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepHeader, {
			step,
			active,
			titleId,
			subtitleId
		});
		$[5] = active;
		$[6] = step;
		$[7] = subtitleId;
		$[8] = titleId;
		$[9] = t1;
	} else t1 = $[9];
	let t2;
	if ($[10] !== answers || $[11] !== setSelected || $[12] !== setText || $[13] !== step.groups || $[14] !== subtitleId || $[15] !== text || $[16] !== titleId) {
		let t3;
		if ($[18] !== answers || $[19] !== setSelected || $[20] !== setText || $[21] !== subtitleId || $[22] !== text || $[23] !== titleId) {
			t3 = (group, i) => {
				const dividerId = `${group.key}-label`;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [group.dividerLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabeledDivider, {
					id: dividerId,
					children: group.dividerLabel
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingOptionGroup, {
					group,
					selected: answers[group.key] ?? [],
					onChange: (ids) => setSelected(group.key, ids),
					labelId: group.dividerLabel ? dividerId : i === 0 ? titleId : void 0,
					descId: i === 0 ? subtitleId : void 0,
					otherText: group.other ? text[group.other.inputKey] ?? "" : void 0,
					onOtherTextChange: group.other ? (v) => setText(group.other.inputKey, v) : void 0
				})] }, group.key);
			};
			$[18] = answers;
			$[19] = setSelected;
			$[20] = setText;
			$[21] = subtitleId;
			$[22] = text;
			$[23] = titleId;
			$[24] = t3;
		} else t3 = $[24];
		t2 = step.groups.map(t3);
		$[10] = answers;
		$[11] = setSelected;
		$[12] = setText;
		$[13] = step.groups;
		$[14] = subtitleId;
		$[15] = text;
		$[16] = titleId;
		$[17] = t2;
	} else t2 = $[17];
	let t3;
	if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepFooter, {});
		$[25] = t3;
	} else t3 = $[25];
	let t4;
	if ($[26] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-6 px-8 pb-8",
			children: [t2, t3]
		});
		$[26] = t2;
		$[27] = t4;
	} else t4 = $[27];
	let t5;
	if ($[28] !== t1 || $[29] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t1, t4] });
		$[28] = t1;
		$[29] = t4;
		$[30] = t5;
	} else t5 = $[30];
	return t5;
}
function OnboardingFlowInner(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { onComplete, initial } = t0;
	const saveProgress = useSaveOnboarding();
	const submitOnboarding = useSaveOnboarding();
	const lastStepIndex = ONBOARDING_STEPS.length - 1;
	let t1;
	if ($[0] !== saveProgress) {
		t1 = (t2) => {
			const { answers, text, stepIndex } = t2;
			saveProgress.mutate({
				answers,
				text,
				stepIndex,
				completed: false
			});
		};
		$[0] = saveProgress;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== onComplete || $[3] !== submitOnboarding) {
		t2 = (t3) => {
			const { answers: answers_0, text: text_0 } = t3;
			submitOnboarding.mutate({
				answers: answers_0,
				text: text_0,
				stepIndex: lastStepIndex,
				completed: true
			}, { onSuccess: onComplete });
		};
		$[2] = onComplete;
		$[3] = submitOnboarding;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== initial || $[6] !== t1 || $[7] !== t2) {
		t3 = {
			steps: ONBOARDING_STEPS,
			initial,
			onPersist: t1,
			onComplete: t2
		};
		$[5] = initial;
		$[6] = t1;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	const controller = useOnboardingController(t3);
	let t4;
	if ($[9] !== submitOnboarding.isError || $[10] !== submitOnboarding.isPending) {
		t4 = {
			isSaving: submitOnboarding.isPending,
			failed: submitOnboarding.isError
		};
		$[9] = submitOnboarding.isError;
		$[10] = submitOnboarding.isPending;
		$[11] = t4;
	} else t4 = $[11];
	const submitStatus = t4;
	let t5;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepProgress, {});
		$[12] = t5;
	} else t5 = $[12];
	let t6;
	if ($[13] !== controller.stepIndex || $[14] !== controller.steps) {
		let t7;
		if ($[16] !== controller.stepIndex) {
			t7 = (step, i) => {
				const active = i === controller.stepIndex;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					inert: !active,
					"aria-hidden": !active,
					className: active ? "col-start-1 row-start-1 flex flex-col" : "col-start-1 row-start-1 flex flex-col invisible",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingStep, {
						step,
						active
					})
				}, step.key);
			};
			$[16] = controller.stepIndex;
			$[17] = t7;
		} else t7 = $[17];
		t6 = controller.steps.map(t7);
		$[13] = controller.stepIndex;
		$[14] = controller.steps;
		$[15] = t6;
	} else t6 = $[15];
	let t7;
	if ($[18] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(OnboardingCard, { children: [t5, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid",
			children: t6
		})] });
		$[18] = t6;
		$[19] = t7;
	} else t7 = $[19];
	let t8;
	if ($[20] !== submitStatus || $[21] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubmitStatusContext.Provider, {
			value: submitStatus,
			children: t7
		});
		$[20] = submitStatus;
		$[21] = t7;
		$[22] = t8;
	} else t8 = $[22];
	let t9;
	if ($[23] !== controller || $[24] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingContext.Provider, {
			value: controller,
			children: t8
		});
		$[23] = controller;
		$[24] = t8;
		$[25] = t9;
	} else t9 = $[25];
	return t9;
}
/** Minimal backdrop + spinner shown while the saved progress is fetched. */
function OnboardingLoading() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-screen w-full items-center justify-center bg-ed-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 animate-spin rounded-full border-[3px] border-ed-border border-t-ed-primary" })
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
function OnboardingFlow(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { onComplete } = t0;
	const { data, isLoading } = useOnboardingState();
	if (isLoading) {
		let t1;
		if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingLoading, {});
			$[0] = t1;
		} else t1 = $[0];
		return t1;
	}
	const saved = data?.answers;
	const t1 = saved?.selections;
	const t2 = saved?.text;
	const t3 = saved?.stepIndex;
	let t4;
	if ($[1] !== t1 || $[2] !== t2 || $[3] !== t3) {
		t4 = {
			answers: t1,
			text: t2,
			stepIndex: t3
		};
		$[1] = t1;
		$[2] = t2;
		$[3] = t3;
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] !== onComplete || $[6] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingFlowInner, {
			onComplete,
			initial: t4
		});
		$[5] = onComplete;
		$[6] = t4;
		$[7] = t5;
	} else t5 = $[7];
	return t5;
}

export { OnboardingFlow };
