// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useOrganizations.ts
import { useMutation, useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { queryClient } from "../queryClient.js";
import { getAuthClient, slugifyOrgName } from "../lib/auth-client.js";
import { import_compiler_runtime, useSession } from "./useSession.js";

function rescopeActiveOrg() {
	queryClient.invalidateQueries({ queryKey: ["organizations"] });
	queryClient.invalidateQueries({ queryKey: ["projects"] });
	return queryClient.invalidateQueries({ queryKey: ["session"] });
}
function useOrganizations() {
	const $ = (0, import_compiler_runtime.c)(7);
	const { session } = useSession();
	const activeId = session?.activeOrganizationId ?? null;
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["organizations"],
			queryFn: _temp2$80,
			retry: false
		};
		$[0] = t0;
	} else t0 = $[0];
	const query = useQuery(t0);
	let t1;
	if ($[1] !== activeId || $[2] !== query.data) {
		t1 = query.data?.map((org_0) => ({
			...org_0,
			active: org_0.id === activeId
		}));
		$[1] = activeId;
		$[2] = query.data;
		$[3] = t1;
	} else t1 = $[3];
	let t2;
	if ($[4] !== query || $[5] !== t1) {
		t2 = {
			...query,
			data: t1
		};
		$[4] = query;
		$[5] = t1;
		$[6] = t2;
	} else t2 = $[6];
	return t2;
}
async function _temp2$80() {
	const { data, error } = await getAuthClient().organization.list();
	if (error) throw new Error(error.message || "Failed to load organizations");
	return (data ?? []).map(_temp$125);
}
function _temp$125(org) {
	return {
		id: org.id,
		name: org.name,
		logo: org.logo
	};
}
function useCreateOrganization() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp3$59,
			onSuccess: rescopeActiveOrg
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
async function _temp3$59(name) {
	const slug = `${slugifyOrgName(name)}-${crypto.randomUUID().slice(0, 8)}`;
	const { error } = await getAuthClient().organization.create({
		name,
		slug,
		keepCurrentActiveOrganization: false
	});
	if (error) throw new Error(error.message || "Failed to create organization");
}
function useSetActiveOrganization() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			mutationFn: _temp4$50,
			onSuccess: rescopeActiveOrg
		};
		$[0] = t0;
	} else t0 = $[0];
	return useMutation(t0);
}
async function _temp4$50(organizationId) {
	const { error } = await getAuthClient().organization.setActive({ organizationId });
	if (error) throw new Error(error.message || "Failed to switch organization");
}

export { useCreateOrganization, useOrganizations, useSetActiveOrganization };
