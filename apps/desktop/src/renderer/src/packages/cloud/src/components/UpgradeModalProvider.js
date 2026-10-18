// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/UpgradeModalProvider.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { getWebSettingsUrl } from "../client.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { useBillingSummary } from "../hooks/useBilling.js";
import { isPlanLimitError$1, isPlanLimitReason$1 } from "../lib/planRecommendations.js";
import { usePostHog } from "../../../../vendor/@posthog/react.js";
import { UpgradePlanModal } from "./UpgradePlanModal.js";

var UpgradeModalContext = (0, import_react.createContext)(null);
function UpgradeModalProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { organizationId, children, onSeePlans } = t0;
	const posthog = usePostHog();
	const { data: summary } = useBillingSummary(organizationId);
	const [payload, setPayload] = (0, import_react.useState)(null);
	const openPayloadRef = (0, import_react.useRef)(null);
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => {
			openPayloadRef.current = null;
			setPayload(null);
		};
		$[0] = t1;
	} else t1 = $[0];
	const closeModal = t1;
	let t2;
	if ($[1] !== organizationId || $[2] !== posthog || $[3] !== summary?.plan) {
		t2 = (next) => {
			if (openPayloadRef.current?.reason !== next.reason) posthog.capture("plan_limit_reached", {
				reason: next.reason,
				organization_id: organizationId,
				current_plan: summary?.plan,
				message: next.message
			});
			openPayloadRef.current = next;
			setPayload(next);
		};
		$[1] = organizationId;
		$[2] = posthog;
		$[3] = summary?.plan;
		$[4] = t2;
	} else t2 = $[4];
	const openUpgradeModal = t2;
	let t3;
	if ($[5] !== openUpgradeModal) {
		t3 = (err) => {
			if (!isPlanLimitError$1(err)) return false;
			openUpgradeModal({
				reason: err.reason,
				message: err.message
			});
			return true;
		};
		$[5] = openUpgradeModal;
		$[6] = t3;
	} else t3 = $[6];
	const openUpgradeFromError = t3;
	let t4;
	if ($[7] !== onSeePlans || $[8] !== organizationId) {
		t4 = () => {
			closeModal();
			if (onSeePlans) {
				onSeePlans();
				return;
			}
			window.open(getWebSettingsUrl("billing", organizationId), "_blank", "noopener,noreferrer");
		};
		$[7] = onSeePlans;
		$[8] = organizationId;
		$[9] = t4;
	} else t4 = $[9];
	const seePlans = t4;
	let t5;
	if ($[10] !== openUpgradeFromError || $[11] !== openUpgradeModal) {
		t5 = {
			openUpgradeModal,
			openUpgradeFromError
		};
		$[10] = openUpgradeFromError;
		$[11] = openUpgradeModal;
		$[12] = t5;
	} else t5 = $[12];
	const value = t5;
	let t6;
	if ($[13] !== organizationId || $[14] !== payload || $[15] !== seePlans) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradePlanModal, {
			organizationId,
			payload,
			onClose: closeModal,
			onSeePlans: seePlans
		});
		$[13] = organizationId;
		$[14] = payload;
		$[15] = seePlans;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== children || $[18] !== t6 || $[19] !== value) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UpgradeModalContext.Provider, {
			value,
			children: [children, t6]
		});
		$[17] = children;
		$[18] = t6;
		$[19] = value;
		$[20] = t7;
	} else t7 = $[20];
	return t7;
}
function useOpenUpgradeModal() {
	return (0, import_react.useContext)(UpgradeModalContext);
}
/** Open the upgrade modal after the current dialog has started closing. */
function openUpgradeAfterDialog(open, payload) {
	window.setTimeout(() => open?.(payload), 0);
}
function planLimitPayloadFromReason(reason, message) {
	if (!reason || !isPlanLimitReason$1(reason)) return null;
	return {
		reason,
		message
	};
}

export { UpgradeModalProvider, openUpgradeAfterDialog, planLimitPayloadFromReason, useOpenUpgradeModal };
