// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useBilling.ts
import { useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApi } from "../client.js";
import { queryClient } from "../queryClient.js";
import { import_compiler_runtime } from "./useSession.js";

/** Annual discount vs monthly, as a whole percent. Null for free. */
function annualSavePercent(monthly, annual) {
	if (monthly <= 0) return null;
	return Math.round((1 - annual / monthly) * 100);
}
function isAnnualInterval(interval) {
	return interval === "year" || interval === "annual" || interval === "yearly";
}
/** Annual unless the org is already on an explicit monthly interval. */
function defaultAnnual(interval) {
	return !interval || isAnnualInterval(interval);
}
async function parseBillingAction(res, fallback) {
	const data = await res.json();
	if (!res.ok) throw new Error(data.error || fallback);
	return data;
}
function goToStripe(url) {
	if (!url) return;
	if (typeof window !== "undefined" && "api" in window) {
		window.open(url, "_blank", "noopener,noreferrer");
		return;
	}
	if (!window.open(url, "_blank", "noopener,noreferrer")) window.location.assign(url);
}
/** Bust seat-related caches after org or project membership changes. */
function invalidateSeatQueries(organizationId) {
	queryClient.invalidateQueries({ queryKey: organizationId ? ["billing-summary", organizationId] : ["billing-summary"] });
	queryClient.invalidateQueries({ queryKey: organizationId ? ["org-people", organizationId] : ["org-people"] });
}
function useBillingSummary(organizationId, options) {
	const $ = (0, import_compiler_runtime.c)(9);
	let t0;
	if ($[0] !== organizationId) {
		t0 = ["billing-summary", organizationId];
		$[0] = organizationId;
		$[1] = t0;
	} else t0 = $[1];
	const t1 = !!organizationId;
	const t2 = options?.refetchOnMount;
	let t3;
	if ($[2] !== organizationId) {
		t3 = async () => {
			const res = await getApi().billing.summary.$get({ query: { organizationId } });
			if (!res.ok) throw new Error(`Failed to load billing (${res.status})`);
			return res.json();
		};
		$[2] = organizationId;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== t0 || $[5] !== t1 || $[6] !== t2 || $[7] !== t3) {
		t4 = {
			queryKey: t0,
			enabled: t1,
			refetchOnMount: t2,
			queryFn: t3
		};
		$[4] = t0;
		$[5] = t1;
		$[6] = t2;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	return useQuery(t4);
}
function useUpgradePlan(organizationId) {
	const $ = (0, import_compiler_runtime.c)(2);
	let t0;
	if ($[0] !== organizationId) {
		t0 = {
			mutationFn: async (t1) => {
				const { plan, annual } = t1;
				return parseBillingAction(await getApi().billing.upgrade.$post({ json: {
					organizationId,
					plan,
					annual
				} }), "Failed to start checkout");
			},
			onSuccess: _temp$124
		};
		$[0] = organizationId;
		$[1] = t0;
	} else t0 = $[1];
	return useMutation(t0);
}
function _temp$124(data) {
	return goToStripe(data.url);
}

export { annualSavePercent, defaultAnnual, invalidateSeatQueries, useBillingSummary, useUpgradePlan };
