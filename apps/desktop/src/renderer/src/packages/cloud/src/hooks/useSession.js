// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/hooks/useSession.ts
import { __commonJSMin } from "../../../../__bundle__/_runtime.js";
import { useQuery } from "../../../../vendor/@tanstack/react-query.js";
import { getApi } from "../client.js";
import { require_react_compiler_runtime_production } from "../../../../vendor/react.js";

var import_compiler_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_compiler_runtime_production();
})))();
function asSessionOrgRole(value) {
	if (value === "owner" || value === "editor" || value === "viewer") return value;
	return null;
}
function useSession() {
	const $ = (0, import_compiler_runtime.c)(9);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = {
			queryKey: ["session"],
			queryFn: _temp$127,
			retry: false
		};
		$[0] = t0;
	} else t0 = $[0];
	const { data, isLoading } = useQuery(t0);
	const rawUser = data?.user;
	const rawSession = data?.session;
	let t1;
	if ($[1] !== rawUser) {
		t1 = rawUser ? {
			...rawUser,
			role: rawUser.role === "admin" ? "admin" : null
		} : null;
		$[1] = rawUser;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== rawSession) {
		t2 = rawSession ? {
			activeOrganizationId: rawSession.activeOrganizationId,
			activeOrganizationName: rawSession.activeOrganizationName,
			activeOrganizationRole: asSessionOrgRole(rawSession.activeOrganizationRole),
			impersonated: Boolean(rawSession.impersonated)
		} : null;
		$[3] = rawSession;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== isLoading || $[6] !== t1 || $[7] !== t2) {
		t3 = {
			user: t1,
			session: t2,
			loading: isLoading
		};
		$[5] = isLoading;
		$[6] = t1;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}
async function _temp$127() {
	const res = await getApi().session.$get();
	if (!res.ok) return null;
	return res.json();
}

export { import_compiler_runtime, useSession };
