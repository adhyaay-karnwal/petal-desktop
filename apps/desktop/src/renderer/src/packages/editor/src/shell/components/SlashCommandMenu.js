// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/SlashCommandMenu.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { ComposerSuggestionGroup, ComposerSuggestionItem, ComposerSuggestionMenu } from "./ComposerSuggestionMenu.js";

function SkillDescription$1(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { description } = t0;
	let t1;
	if ($[0] !== description) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, {
			canOpen: _temp$46,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate text-ed-muted-foreground",
					children: description
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
				side: "right",
				className: "max-w-48 whitespace-pre-wrap break-words",
				children: description
			})]
		});
		$[0] = description;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
/**
* The `/` picker above the chat composer. Two groups: what Petal adds, and
* every skill and custom command the user's Claude Code would accept, filtered
* by what they typed. Styled as the shared menu surface. Keyboard handling
* lives in the composer; this only renders and keeps the selected row in view.
*/
function _temp$46(text) {
	return text.scrollWidth > text.clientWidth;
}
function SlashCommandMenu(t0) {
	const $ = (0, import_compiler_runtime.c)(13);
	const { commands, selectedIndex, onHover, onSelect, loading, agentName: t1 } = t0;
	const agentName = t1 === void 0 ? "Claude Code" : t1;
	let t2;
	if ($[0] !== agentName || $[1] !== commands || $[2] !== loading || $[3] !== onHover || $[4] !== onSelect || $[5] !== selectedIndex) {
		const entries = commands.map(_temp2$29);
		const petal = entries.filter(_temp3$22);
		const skills = entries.filter(_temp4$22);
		let t3;
		if ($[7] !== onHover || $[8] !== onSelect || $[9] !== selectedIndex) {
			t3 = (t4) => {
				const { command: command_2, i: i_0 } = t4;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposerSuggestionItem, {
					index: i_0,
					selected: i_0 === selectedIndex,
					onHover,
					onSelect: () => onSelect(command_2),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-ed-muted-foreground",
							children: "/"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-medium",
							children: command_2.name
						}),
						command_2.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillDescription$1, { description: command_2.description })
					]
				}, command_2.name);
			};
			$[7] = onHover;
			$[8] = onSelect;
			$[9] = selectedIndex;
			$[10] = t3;
		} else t3 = $[10];
		const row = t3;
		const t4 = `${agentName} Skills`;
		let t5;
		if ($[11] !== t4) {
			t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerSuggestionGroup, { children: t4 });
			$[11] = t4;
			$[12] = t5;
		} else t5 = $[12];
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposerSuggestionMenu, {
			label: "Slash commands",
			selectedIndex,
			children: [
				petal.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComposerSuggestionGroup, { children: "Petal" }),
					petal.map(row),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-1",
						"aria-hidden": true
					})
				] }),
				t5,
				skills.length > 0 ? skills.map(row) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-6.5 items-center px-1.5 text-ed-muted-foreground",
					children: loading ? "Reading your skills…" : "No matching skills or commands"
				})
			]
		});
		$[0] = agentName;
		$[1] = commands;
		$[2] = loading;
		$[3] = onHover;
		$[4] = onSelect;
		$[5] = selectedIndex;
		$[6] = t2;
	} else t2 = $[6];
	return t2;
}
function _temp4$22(t0) {
	const { command: command_1 } = t0;
	return command_1.scope !== "petal";
}
function _temp3$22(t0) {
	const { command: command_0 } = t0;
	return command_0.scope === "petal";
}
function _temp2$29(command, i) {
	return {
		command,
		i
	};
}

export { SlashCommandMenu };
