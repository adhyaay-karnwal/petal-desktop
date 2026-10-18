// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useOnboarding.ts
import { useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApiUrl } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime, useSession } from "./useSession.js";

function useOnboardingState() {
	const $ = (0, import_compiler_runtime.c)(5);
	const { user } = useSession();
	const t0 = user?.id;
	let t1;
	if ($[0] !== t0) {
		t1 = ["onboarding-state", t0];
		$[0] = t0;
		$[1] = t1;
	} else t1 = $[1];
	const t2 = !!user;
	let t3;
	if ($[2] !== t1 || $[3] !== t2) {
		t3 = {
			queryKey: t1,
			enabled: t2,
			queryFn: _temp$12,
			retry: false,
			staleTime: 0
		};
		$[2] = t1;
		$[3] = t2;
		$[4] = t3;
	} else t3 = $[4];
	return useQuery(t3);
}
async function _temp$12() {
	const res = await fetch(`${getApiUrl()}/onboarding`, { credentials: "include" });
	if (!res.ok) return null;
	return res.json();
}
function useSaveOnboarding() {
	const $ = (0, import_compiler_runtime.c)(2);
	const { user } = useSession();
	let t0;
	if ($[0] !== user?.id) {
		t0 = {
			mutationFn: _temp2$7,
			onSuccess: (_data, t1) => {
				const { answers: answers_0, text: text_0, stepIndex: stepIndex_0, completed: completed_0 } = t1;
				if (!completed_0) return;
				queryClient.setQueryData(["onboarding-state", user?.id], {
					answers: {
						selections: answers_0,
						text: text_0,
						stepIndex: stepIndex_0,
						welcomeTourPending: true
					},
					completed: true
				});
				queryClient.setQueryData(["session"], _temp3$5);
				queryClient.invalidateQueries({ queryKey: ["session"] });
			}
		};
		$[0] = user?.id;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
/** Dismiss only the tour; never overwrite questionnaire answers or completion. */
function _temp3$5(prev) {
	return prev?.user ? {
		...prev,
		user: {
			...prev.user,
			onboardingCompleted: true
		}
	} : prev;
}
async function _temp2$7(t0) {
	const { answers, text, stepIndex, completed } = t0;
	const res = await fetch(`${getApiUrl()}/onboarding`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			answers: {
				selections: answers,
				text,
				stepIndex
			},
			completed: !!completed
		})
	});
	if (!res.ok) throw new Error("Failed to save onboarding");
	return res.json();
}
function useDismissWelcomeTour(userId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== userId) {
		t0 = {
			mutationFn: _temp4$5,
			onSuccess: () => {
				queryClient.setQueryData(["onboarding-state", userId], _temp5$4);
			}
		};
		$[0] = userId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function _temp5$4(previous) {
	return previous ? {
		...previous,
		answers: {
			...previous.answers,
			welcomeTourPending: false
		}
	} : previous;
}
async function _temp4$5() {
	if (!(await fetch(`${getApiUrl()}/onboarding/welcome-tour/dismiss`, {
		method: "POST",
		credentials: "include"
	})).ok) throw new Error("Could not save welcome tour dismissal");
}

export { useDismissWelcomeTour, useOnboardingState, useSaveOnboarding };
