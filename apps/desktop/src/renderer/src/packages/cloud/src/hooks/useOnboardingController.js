// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useOnboardingController.ts
import { import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "./useSession.js";

/**
* Headless state machine for the onboarding flow: current step, collected answers, and the
* advance/skip/finish transitions. UI is provided by the components that consume it through
* OnboardingContext — this hook holds no DOM concerns and is trivially testable.
*
* Persistence is intentionally NOT here: finishing just calls `onComplete` with the collected
* answers, and the flow decides how to store them. That keeps the state machine decoupled from
* how completion is persisted (a server mutation, localStorage, etc.).
*/
function useOnboardingController(t0) {
	const $ = (0, import_compiler_runtime.c)(38);
	const { steps, onComplete, onPersist, initial } = t0;
	let t1;
	if ($[0] !== initial?.stepIndex || $[1] !== steps.length) {
		t1 = () => Math.min(Math.max(0, initial?.stepIndex ?? 0), steps.length - 1);
		$[0] = initial?.stepIndex;
		$[1] = steps.length;
		$[2] = t1;
	} else t1 = $[2];
	const [stepIndex, setStepIndex] = (0, import_react.useState)(t1);
	let t2;
	if ($[3] !== initial?.answers) {
		t2 = () => initial?.answers ?? {};
		$[3] = initial?.answers;
		$[4] = t2;
	} else t2 = $[4];
	const [answers, setAnswers] = (0, import_react.useState)(t2);
	let t3;
	if ($[5] !== initial?.text) {
		t3 = () => initial?.text ?? {};
		$[5] = initial?.text;
		$[6] = t3;
	} else t3 = $[6];
	const [text, setTextState] = (0, import_react.useState)(t3);
	const currentStep = steps[stepIndex];
	const isLastStep = stepIndex === steps.length - 1;
	let t4;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = (groupKey, ids) => {
			setAnswers((prev) => ({
				...prev,
				[groupKey]: ids
			}));
		};
		$[7] = t4;
	} else t4 = $[7];
	const setSelected = t4;
	let t5;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = (key, value) => {
			setTextState((prev_0) => ({
				...prev_0,
				[key]: value
			}));
		};
		$[8] = t5;
	} else t5 = $[8];
	const setText = t5;
	let t6;
	if ($[9] !== answers || $[10] !== onComplete || $[11] !== text) {
		t6 = () => {
			onComplete({
				answers,
				text
			});
		};
		$[9] = answers;
		$[10] = onComplete;
		$[11] = text;
		$[12] = t6;
	} else t6 = $[12];
	const finish = t6;
	const skip = finish;
	let t7;
	if ($[13] !== answers || $[14] !== finish || $[15] !== onPersist || $[16] !== stepIndex || $[17] !== steps.length || $[18] !== text) {
		t7 = () => {
			if (stepIndex >= steps.length - 1) finish();
			else {
				onPersist?.({
					answers,
					text,
					stepIndex: stepIndex + 1
				});
				setStepIndex(_temp$4);
			}
		};
		$[13] = answers;
		$[14] = finish;
		$[15] = onPersist;
		$[16] = stepIndex;
		$[17] = steps.length;
		$[18] = text;
		$[19] = t7;
	} else t7 = $[19];
	const advance = t7;
	let t8;
	if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = () => {
			setStepIndex(_temp2$2);
		};
		$[20] = t8;
	} else t8 = $[20];
	const back = t8;
	let t9;
	if ($[21] !== answers || $[22] !== currentStep.groups || $[23] !== currentStep.kind || $[24] !== currentStep.usernameKey || $[25] !== text) {
		t9 = currentStep.kind === "follow" ? !!(text[currentStep.usernameKey] ?? "").trim() : currentStep.groups.every((g) => {
			const sel = answers[g.key] ?? [];
			if (sel.length === 0) return false;
			if (g.other && sel.includes(g.other.option.id) && !(text[g.other.inputKey] ?? "").trim()) return false;
			return true;
		});
		$[21] = answers;
		$[22] = currentStep.groups;
		$[23] = currentStep.kind;
		$[24] = currentStep.usernameKey;
		$[25] = text;
		$[26] = t9;
	} else t9 = $[26];
	const canContinue = t9;
	const t10 = stepIndex > 0;
	let t11;
	if ($[27] !== advance || $[28] !== answers || $[29] !== canContinue || $[30] !== currentStep || $[31] !== isLastStep || $[32] !== skip || $[33] !== stepIndex || $[34] !== steps || $[35] !== t10 || $[36] !== text) {
		t11 = {
			steps,
			stepIndex,
			currentStep,
			isLastStep,
			answers,
			text,
			setSelected,
			setText,
			canContinue,
			canGoBack: t10,
			next: advance,
			skip,
			back
		};
		$[27] = advance;
		$[28] = answers;
		$[29] = canContinue;
		$[30] = currentStep;
		$[31] = isLastStep;
		$[32] = skip;
		$[33] = stepIndex;
		$[34] = steps;
		$[35] = t10;
		$[36] = text;
		$[37] = t11;
	} else t11 = $[37];
	return t11;
}
function _temp2$2(i_0) {
	return Math.max(0, i_0 - 1);
}
function _temp$4(i) {
	return i + 1;
}

export { useOnboardingController };
