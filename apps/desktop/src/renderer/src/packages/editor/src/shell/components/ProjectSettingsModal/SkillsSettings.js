// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/SkillsSettings.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { Switch } from "../../../../../ui/src/components/Switch.js";

function extractDescription(skillMd) {
	const frontmatter = skillMd.match(/^---\n([\s\S]*?)\n---/);
	if (!frontmatter) return void 0;
	return frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
}
function SkillsSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(26);
	const { overrides, onOpenSkill, onResetSkill, onToggleSkillActive } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = [];
		$[0] = t1;
	} else t1 = $[0];
	const [skills, setSkills] = (0, import_react.useState)(t1);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	let t2;
	let t3;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = () => {
			let cancelled = false;
			const api = window.api;
			(api?.invoke ? api.invoke("get_system_skills") : Promise.reject(/* @__PURE__ */ new Error("Skills are only available in the desktop app"))).then((result) => {
				if (!cancelled) setSkills(Array.isArray(result) ? result : []);
			}).catch((err) => {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : String(err));
				setSkills([]);
			}).finally(() => {
				if (!cancelled) setLoading(false);
			});
			return () => {
				cancelled = true;
			};
		};
		t3 = [];
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	(0, import_react.useEffect)(t2, t3);
	let t4;
	let t5;
	let t6;
	if ($[3] !== error || $[4] !== loading || $[5] !== onOpenSkill || $[6] !== onResetSkill || $[7] !== onToggleSkillActive || $[8] !== overrides || $[9] !== skills) {
		t6 = Symbol.for("react.early_return_sentinel");
		bb0: {
			let t7;
			if ($[13] !== overrides) {
				t7 = (skill) => {
					const override = overrides[skill.name];
					const hasOverride = !!override?.files?.length;
					const overrideActive = !!override?.active;
					if (!overrideActive || !hasOverride) return {
						...skill,
						hasOverride,
						overrideActive
					};
					const files = override.files;
					const skillMd = files.find(_temp$23)?.content ?? "";
					return {
						...skill,
						files,
						description: extractDescription(skillMd) ?? skill.description,
						hasOverride: true,
						overrideActive: true
					};
				};
				$[13] = overrides;
				$[14] = t7;
			} else t7 = $[14];
			const displaySkills = skills.map(t7);
			if (loading) {
				let t8;
				if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
					t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						as: "p",
						size: "3xs",
						variant: "tertiary",
						children: "Loading skills…"
					});
					$[15] = t8;
				} else t8 = $[15];
				t6 = t8;
				break bb0;
			}
			if (error) {
				let t8;
				if ($[16] !== error) {
					t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						as: "p",
						size: "3xs",
						variant: "danger",
						children: error
					});
					$[16] = error;
					$[17] = t8;
				} else t8 = $[17];
				t6 = t8;
				break bb0;
			}
			if (displaySkills.length === 0) {
				let t8;
				if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
					t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						as: "p",
						size: "3xs",
						variant: "tertiary",
						children: "Built-in Petal skills will appear here."
					});
					$[18] = t8;
				} else t8 = $[18];
				t6 = t8;
				break bb0;
			}
			t4 = "flex flex-col divide-y divide-ed-divider";
			let t8;
			if ($[19] !== onOpenSkill || $[20] !== onResetSkill || $[21] !== onToggleSkillActive) {
				t8 = (skill_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-col gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "div",
							size: "3xs",
							weight: "medium",
							className: "truncate",
							children: skill_0.name
						}), skill_0.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							as: "div",
							size: "3xs",
							variant: "tertiary",
							className: "line-clamp-2",
							children: skill_0.description
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2",
						children: [
							skill_0.hasOverride && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "xs",
								variant: "secondary",
								isChildText: false,
								className: "group/reset leading-none hover:bg-ed-primary",
								"aria-label": `Reset ${skill_0.name}`,
								onClick: () => onResetSkill(skill_0.name),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-ed-muted-foreground group-hover/reset:hidden",
									children: "edited"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden font-medium text-ed-primary-foreground group-hover/reset:inline",
									children: "reset"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "xs",
								variant: "secondary",
								onClick: () => onOpenSkill(skill_0),
								children: "Edit"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								size: "sm",
								checked: skill_0.overrideActive,
								"aria-label": skill_0.overrideActive ? `Disable override for ${skill_0.name}` : `Enable override for ${skill_0.name}`,
								onCheckedChange: (checked) => onToggleSkillActive(skill_0.name, checked)
							})
						]
					})]
				}, skill_0.name);
				$[19] = onOpenSkill;
				$[20] = onResetSkill;
				$[21] = onToggleSkillActive;
				$[22] = t8;
			} else t8 = $[22];
			t5 = displaySkills.map(t8);
		}
		$[3] = error;
		$[4] = loading;
		$[5] = onOpenSkill;
		$[6] = onResetSkill;
		$[7] = onToggleSkillActive;
		$[8] = overrides;
		$[9] = skills;
		$[10] = t4;
		$[11] = t5;
		$[12] = t6;
	} else {
		t4 = $[10];
		t5 = $[11];
		t6 = $[12];
	}
	if (t6 !== Symbol.for("react.early_return_sentinel")) return t6;
	let t7;
	if ($[23] !== t4 || $[24] !== t5) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: t4,
			children: t5
		});
		$[23] = t4;
		$[24] = t5;
		$[25] = t7;
	} else t7 = $[25];
	return t7;
}
function _temp$23(f) {
	return f.path === "SKILL.md";
}

export { SkillsSettings };
