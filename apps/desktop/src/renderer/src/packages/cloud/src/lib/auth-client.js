// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/lib/auth-client.ts
import { getApiUrl } from "../client.js";
import { adminClient, createAccessControl, createAuthClient, defaultStatements, emailOTPClient, memberAc, organizationClient, ownerAc } from "../../../../vendor/better-auth.js";

var ac$1 = createAccessControl(defaultStatements);
var orgRoles = {
	owner: ac$1.newRole(ownerAc.statements),
	editor: ac$1.newRole(memberAc.statements),
	viewer: ac$1.newRole(memberAc.statements)
};
function makeAuthClient() {
	return createAuthClient({
		baseURL: getApiUrl(),
		plugins: [
			adminClient({}),
			emailOTPClient(),
			organizationClient({
				ac: ac$1,
				roles: orgRoles
			})
		]
	});
}
var _authClient = null;
/** Browser Better Auth client for web and the Electron renderer. */
function getAuthClient() {
	if (!_authClient) _authClient = makeAuthClient();
	return _authClient;
}
function slugifyOrgName(name) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "org";
}

export { getAuthClient, slugifyOrgName };
