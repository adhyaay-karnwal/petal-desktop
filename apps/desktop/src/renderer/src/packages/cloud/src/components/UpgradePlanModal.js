// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/UpgradePlanModal.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { annualSavePercent, defaultAnnual, useBillingSummary, useUpgradePlan } from "../hooks/useBilling.js";
import { Badge } from "../../../ui/src/components/Badge.js";
import { CheckIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { planLimitTitle$1, recommendPaidPlan } from "../lib/planRecommendations.js";

function UpgradePlanModal(t0) {
	const $ = (0, import_compiler_runtime.c)(43);
	const { organizationId, payload, onClose, onSeePlans } = t0;
	const { data: summary, isLoading } = useBillingSummary(organizationId);
	const upgrade = useUpgradePlan(organizationId);
	let annual;
	let canManage;
	let catalog;
	let price;
	let recommended;
	let recommendedId;
	let t1;
	if ($[0] !== payload || $[1] !== summary) {
		catalog = summary?.plans ?? [];
		recommendedId = payload && summary ? recommendPaidPlan({
			reason: payload.reason,
			currentPlan: summary.plan,
			catalog
		}) : null;
		recommended = recommendedId ? catalog.find((p) => p.id === recommendedId) ?? null : null;
		canManage = summary?.canManageBilling ?? false;
		const t2 = summary?.subscription?.billingInterval;
		let t3;
		if ($[9] !== t2) {
			t3 = defaultAnnual(t2);
			$[9] = t2;
			$[10] = t3;
		} else t3 = $[10];
		annual = t3;
		price = recommended ? annual ? recommended.annual : recommended.monthly : 0;
		t1 = recommended ? annualSavePercent(recommended.monthly, recommended.annual) : null;
		$[0] = payload;
		$[1] = summary;
		$[2] = annual;
		$[3] = canManage;
		$[4] = catalog;
		$[5] = price;
		$[6] = recommended;
		$[7] = recommendedId;
		$[8] = t1;
	} else {
		annual = $[2];
		canManage = $[3];
		catalog = $[4];
		price = $[5];
		recommended = $[6];
		recommendedId = $[7];
		t1 = $[8];
	}
	const savePct = t1;
	const seats = summary?.seats ?? 1;
	let t2;
	if ($[11] !== catalog || $[12] !== summary?.plan) {
		t2 = catalog.find((p_0) => p_0.id === summary?.plan)?.name ?? summary?.plan;
		$[11] = catalog;
		$[12] = summary?.plan;
		$[13] = t2;
	} else t2 = $[13];
	const currentPlanName = t2;
	const alreadyOnPlan = !!summary && !isLoading && recommendedId == null;
	let t3;
	if ($[14] !== annual || $[15] !== canManage || $[16] !== onClose || $[17] !== recommendedId || $[18] !== upgrade) {
		t3 = () => {
			if (!canManage || !recommendedId) return;
			upgrade.mutate({
				plan: recommendedId,
				annual
			}, { onSuccess: () => onClose() });
		};
		$[14] = annual;
		$[15] = canManage;
		$[16] = onClose;
		$[17] = recommendedId;
		$[18] = upgrade;
		$[19] = t3;
	} else t3 = $[19];
	const handleUpgrade = t3;
	const t4 = !!payload;
	let t5;
	if ($[20] !== onClose) {
		t5 = (open) => {
			if (!open) onClose();
		};
		$[20] = onClose;
		$[21] = t5;
	} else t5 = $[21];
	let t6;
	if ($[22] !== alreadyOnPlan || $[23] !== annual || $[24] !== canManage || $[25] !== currentPlanName || $[26] !== handleUpgrade || $[27] !== onClose || $[28] !== onSeePlans || $[29] !== payload || $[30] !== price || $[31] !== recommended || $[32] !== savePct || $[33] !== seats || $[34] !== summary || $[35] !== upgrade) {
		t6 = payload && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: planLimitTitle$1(payload.reason) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: payload.message })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, { children: [
				recommended && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecommendedPlanCard, {
					plan: recommended,
					price,
					annual,
					savePct
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
					as: "p",
					size: "3xs",
					variant: "tertiary",
					children: [
						"Billed as ",
						seats,
						" paid ",
						seats === 1 ? "seat" : "seats",
						" at $",
						price,
						" per month, charged ",
						annual ? "annually" : "monthly",
						"."
					]
				})] }),
				alreadyOnPlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
					as: "p",
					size: "3xs",
					variant: "tertiary",
					children: [
						"You're already on ",
						currentPlanName,
						"."
					]
				}),
				summary && !canManage && recommended && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					as: "p",
					size: "3xs",
					variant: "tertiary",
					children: "Only a workspace owner can change the plan. Ask an owner to upgrade."
				}),
				upgrade.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					as: "p",
					size: "3xs",
					variant: "danger",
					children: upgrade.error instanceof Error ? upgrade.error.message : "Upgrade failed"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
				className: canManage ? "justify-between" : "justify-end",
				children: [canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "xs",
					onClick: onSeePlans,
					children: "See all plans"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "xs",
						onClick: onClose,
						children: "Not now"
					}), canManage && recommended && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "xs",
						onClick: handleUpgrade,
						loading: upgrade.isPending,
						children: ["Upgrade to ", recommended.name]
					})]
				})]
			})
		] });
		$[22] = alreadyOnPlan;
		$[23] = annual;
		$[24] = canManage;
		$[25] = currentPlanName;
		$[26] = handleUpgrade;
		$[27] = onClose;
		$[28] = onSeePlans;
		$[29] = payload;
		$[30] = price;
		$[31] = recommended;
		$[32] = savePct;
		$[33] = seats;
		$[34] = summary;
		$[35] = upgrade;
		$[36] = t6;
	} else t6 = $[36];
	let t7;
	if ($[37] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: t6 });
		$[37] = t6;
		$[38] = t7;
	} else t7 = $[38];
	let t8;
	if ($[39] !== t4 || $[40] !== t5 || $[41] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: t4,
			onOpenChange: t5,
			children: t7
		});
		$[39] = t4;
		$[40] = t5;
		$[41] = t7;
		$[42] = t8;
	} else t8 = $[42];
	return t8;
}
function RecommendedPlanCard(t0) {
	const $ = (0, import_compiler_runtime.c)(31);
	const { plan, price, annual, savePct } = t0;
	let t1;
	if ($[0] !== plan.name) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			weight: "medium",
			children: plan.name
		});
		$[0] = plan.name;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "secondary",
			className: "text-[10px] px-1.5 py-0",
			children: "Recommended"
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [t1, t2]
		});
		$[3] = t1;
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== plan.tagline) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			children: plan.tagline
		});
		$[5] = plan.tagline;
		$[6] = t4;
	} else t4 = $[6];
	let t5;
	if ($[7] !== t3 || $[8] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1",
			children: [t3, t4]
		});
		$[7] = t3;
		$[8] = t4;
		$[9] = t5;
	} else t5 = $[9];
	let t6;
	if ($[10] !== price) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			as: "span",
			size: "lg",
			weight: "semibold",
			className: "text-[18px] leading-[22px]",
			children: ["$", price]
		});
		$[10] = price;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "span",
			size: "3xs",
			variant: "tertiary",
			children: "/ editor / mo"
		});
		$[12] = t7;
	} else t7 = $[12];
	let t8;
	if ($[13] !== t6) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline gap-1 tabular-nums",
			children: [t6, t7]
		});
		$[13] = t6;
		$[14] = t8;
	} else t8 = $[14];
	let t9;
	if ($[15] !== annual || $[16] !== savePct) {
		t9 = annual && savePct != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "success",
			weight: "medium",
			className: "text-[10px] leading-[14px]",
			children: [
				"Save ",
				savePct,
				"% billed annually"
			]
		});
		$[15] = annual;
		$[16] = savePct;
		$[17] = t9;
	} else t9 = $[17];
	let t10;
	if ($[18] !== t8 || $[19] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-col gap-1 items-end text-right",
			children: [t8, t9]
		});
		$[18] = t8;
		$[19] = t9;
		$[20] = t10;
	} else t10 = $[20];
	let t11;
	if ($[21] !== t10 || $[22] !== t5) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [t5, t10]
		});
		$[21] = t10;
		$[22] = t5;
		$[23] = t11;
	} else t11 = $[23];
	let t12;
	if ($[24] !== plan.features) {
		t12 = plan.features.map(_temp$18);
		$[24] = plan.features;
		$[25] = t12;
	} else t12 = $[25];
	let t13;
	if ($[26] !== t12) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			role: "list",
			className: "flex flex-col gap-1.5",
			children: t12
		});
		$[26] = t12;
		$[27] = t13;
	} else t13 = $[27];
	let t14;
	if ($[28] !== t11 || $[29] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-[8px] border border-ed-divider p-4 flex flex-col gap-3.5",
			children: [t11, t13]
		});
		$[28] = t11;
		$[29] = t13;
		$[30] = t14;
	} else t14 = $[30];
	return t14;
}
function _temp$18(feature) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
			width: 12,
			height: 12,
			className: "shrink-0 text-ed-success"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "2xs",
			children: feature
		})]
	}, feature);
}

export { UpgradePlanModal };
