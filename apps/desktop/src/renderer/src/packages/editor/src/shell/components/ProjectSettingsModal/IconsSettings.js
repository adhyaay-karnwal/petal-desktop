// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ProjectSettingsModal/IconsSettings.tsx
import { import_jsx_runtime, import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { isLoadableIconLibrary } from "../../../../../compiler/src/runtime/settingsParser.js";
import { ArrowRightIcon, ArrowUpRightIcon, InfoIcon$1, SparkleIcon, XIcon } from "../../../../../ui/src/icons.js";
import { Text$4 } from "../../../../../ui/src/components/Text.js";
import { Button } from "../../../../../ui/src/components/Button.js";
import { Input } from "../../../../../ui/src/components/Input.js";
import { SettingRow } from "./SettingRow.js";

function getNpmPackageUrl(importPath) {
	const parts = importPath.split("/").filter(Boolean);
	const packageName = importPath.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0] || importPath;
	return `https://www.npmjs.com/package/${encodeURIComponent(packageName)}`;
}
/** Reads the structured `iconSetup` payload an icon-package failure may carry. */
function iconSetupSuggestions(err) {
	const iconSetup = err && typeof err === "object" ? err.iconSetup : null;
	return Array.isArray(iconSetup?.suggestions) ? iconSetup.suggestions.filter((item) => typeof item === "string") : [];
}
function IconsSettings(t0) {
	const $ = (0, import_compiler_runtime.c)(33);
	const { iconLibraries, onAddIconPackage, onRemoveIconPackage, onAskAIForIconSetup } = t0;
	const [packageName, setPackageName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [lastFailure, setLastFailure] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [removing, setRemoving] = (0, import_react.useState)(null);
	let t1;
	if ($[0] !== onAddIconPackage || $[1] !== packageName) {
		t1 = (e) => {
			e.preventDefault();
			const trimmed = packageName.trim();
			if (!trimmed) return;
			if (!isLoadableIconLibrary(trimmed)) {
				setError("Enter an npm import path, like lucide-react or @heroicons/react/24/outline.");
				setLastFailure({
					attemptedPackage: trimmed,
					issue: "Enter an npm import path, like lucide-react or @heroicons/react/24/outline.",
					suggestions: []
				});
				return;
			}
			if (!onAddIconPackage) {
				setError("Icon package setup is not available in this app.");
				setLastFailure({
					attemptedPackage: trimmed,
					issue: "Icon package setup is not available in this app.",
					suggestions: []
				});
				return;
			}
			setSaving(true);
			setError(null);
			setLastFailure(null);
			onAddIconPackage(trimmed).then(() => setPackageName("")).catch((err) => {
				const issue_1 = err instanceof Error ? err.message : String(err);
				setError(issue_1);
				setLastFailure({
					attemptedPackage: trimmed,
					issue: issue_1,
					suggestions: iconSetupSuggestions(err)
				});
			}).finally(() => setSaving(false));
		};
		$[0] = onAddIconPackage;
		$[1] = packageName;
		$[2] = t1;
	} else t1 = $[2];
	const handleSubmit = t1;
	let t2;
	if ($[3] !== onRemoveIconPackage) {
		t2 = (library) => {
			if (!onRemoveIconPackage) {
				setError("Icon package removal is not available in this app.");
				return;
			}
			setRemoving(library);
			setError(null);
			onRemoveIconPackage(library).catch((err_0) => {
				const issue_2 = err_0 instanceof Error ? err_0.message : String(err_0);
				setError(issue_2);
				setLastFailure({
					attemptedPackage: library,
					issue: issue_2,
					suggestions: []
				});
			}).finally(() => setRemoving(null));
		};
		$[3] = onRemoveIconPackage;
		$[4] = t2;
	} else t2 = $[4];
	const handleRemove = t2;
	let t3;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = (e_0) => {
			setPackageName(e_0.target.value);
			setError(null);
			setLastFailure(null);
		};
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== packageName) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: packageName,
			onChange: t3,
			placeholder: "lucide-react",
			size: "xs",
			className: "font-mono"
		});
		$[6] = packageName;
		$[7] = t4;
	} else t4 = $[7];
	let t5;
	if ($[8] !== packageName || $[9] !== saving) {
		t5 = saving || !packageName.trim();
		$[8] = packageName;
		$[9] = saving;
		$[10] = t5;
	} else t5 = $[10];
	let t6;
	if ($[11] !== saving || $[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			size: "xs",
			variant: "outline",
			loading: saving,
			disabled: t5,
			children: "Add"
		});
		$[11] = saving;
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== handleSubmit || $[15] !== t4 || $[16] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "flex items-center gap-2",
			children: [t4, t6]
		});
		$[14] = handleSubmit;
		$[15] = t4;
		$[16] = t6;
		$[17] = t7;
	} else t7 = $[17];
	let t8;
	if ($[18] !== error || $[19] !== iconLibraries || $[20] !== lastFailure || $[21] !== onAskAIForIconSetup) {
		t8 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-ed-border bg-ed-muted/40 p-3 shadow-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ed-background border border-ed-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoIcon$1, {
						width: 14,
						height: 14,
						className: "text-ed-muted-foreground"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs leading-4 font-medium text-ed-foreground",
							children: lastFailure ? "This icon package needs a little more setup." : "We couldn't complete that change."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-5 text-ed-muted-foreground break-words",
							children: error
						}),
						lastFailure && lastFailure.suggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: lastFailure.suggestions.map((suggestion) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setPackageName(suggestion);
									setError(null);
									setLastFailure(null);
								},
								className: "inline-flex items-center gap-1 rounded-md border border-ed-border bg-ed-background px-1.5 py-0.5 text-[11px] font-mono text-ed-foreground hover:bg-ed-accent",
								children: [suggestion, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightIcon, {
									width: 11,
									height: 11
								})]
							}, suggestion))
						}),
						lastFailure && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-2",
							children: [onAskAIForIconSetup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "xs",
								variant: "outline",
								LeftIcon: SparkleIcon,
								onClick: () => onAskAIForIconSetup({
									attemptedPackage: lastFailure.attemptedPackage,
									issue: lastFailure.issue,
									suggestions: lastFailure.suggestions,
									enabledLibraries: iconLibraries
								}),
								children: "Ask AI to help set up"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "xs",
								variant: "secondary",
								className: "text-ed-muted-foreground hover:text-ed-foreground",
								RightIcon: ArrowUpRightIcon,
								rightIconSize: 12,
								rightIconClassName: "shrink-0",
								onClick: () => window.open(getNpmPackageUrl(lastFailure.attemptedPackage), "_blank", "noreferrer"),
								children: "View on npm"
							})]
						})
					]
				})]
			})
		});
		$[18] = error;
		$[19] = iconLibraries;
		$[20] = lastFailure;
		$[21] = onAskAIForIconSetup;
		$[22] = t8;
	} else t8 = $[22];
	let t9;
	if ($[23] !== handleRemove || $[24] !== iconLibraries || $[25] !== removing) {
		t9 = iconLibraries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "tertiary",
			children: "No icon packages enabled."
		}) : iconLibraries.map((lib) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "inline-flex items-center gap-1 rounded border border-ed-border bg-ed-background px-1.5 py-0.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "2xs",
				className: "font-mono",
				children: lib
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => handleRemove(lib),
				disabled: removing === lib,
				"aria-label": `Remove ${lib}`,
				className: "text-ed-muted-foreground hover:text-ed-foreground disabled:opacity-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
					width: 12,
					height: 12
				})
			})]
		}, lib));
		$[23] = handleRemove;
		$[24] = iconLibraries;
		$[25] = removing;
		$[26] = t9;
	} else t9 = $[26];
	let t10;
	if ($[27] !== t9) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: t9
		});
		$[27] = t9;
		$[28] = t10;
	} else t10 = $[28];
	let t11;
	if ($[29] !== t10 || $[30] !== t7 || $[31] !== t8) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
				title: "Icon packages",
				description: "React icon import path, e.g. lucide-react or @heroicons/react/24/outline.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 w-full",
					children: [
						t7,
						t8,
						t10
					]
				})
			})
		});
		$[29] = t10;
		$[30] = t7;
		$[31] = t8;
		$[32] = t11;
	} else t11 = $[32];
	return t11;
}

export { IconsSettings };
