// Reconstructed from index-C74mRL57.js — original module: vendor/prosemirror-keymap
import { Plugin } from "./prosemirror-state.js";
import { base, keyName } from "./w3c-keyname.js";

var mac = typeof navigator != "undefined" && /Mac|iP(hone|[oa]d)/.test(navigator.platform);
var windows$1 = typeof navigator != "undefined" && /Win/.test(navigator.platform);
function normalizeKeyName$2(name) {
	let parts = name.split(/-(?!$)/), result = parts[parts.length - 1];
	if (result == "Space") result = " ";
	let alt, ctrl, shift, meta;
	for (let i = 0; i < parts.length - 1; i++) {
		let mod = parts[i];
		if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
		else if (/^a(lt)?$/i.test(mod)) alt = true;
		else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
		else if (/^s(hift)?$/i.test(mod)) shift = true;
		else if (/^mod$/i.test(mod)) {
			if (mac) meta = true;
			else ctrl = true;
		} else throw new Error("Unrecognized modifier name: " + mod);
	}
	if (alt) result = "Alt-" + result;
	if (ctrl) result = "Ctrl-" + result;
	if (meta) result = "Meta-" + result;
	if (shift) result = "Shift-" + result;
	return result;
}
function normalize$4(map) {
	let copy = Object.create(null);
	for (let prop in map) copy[normalizeKeyName$2(prop)] = map[prop];
	return copy;
}
function modifiers$1(name, event, shift = true) {
	if (event.altKey) name = "Alt-" + name;
	if (event.ctrlKey) name = "Ctrl-" + name;
	if (event.metaKey) name = "Meta-" + name;
	if (shift && event.shiftKey) name = "Shift-" + name;
	return name;
}
/**
Create a keymap plugin for the given set of bindings.

Bindings should map key names to [command](https://prosemirror.net/docs/ref/#commands)-style
functions, which will be called with `(EditorState, dispatch,
EditorView)` arguments, and should return true when they've handled
the key. Note that the view argument isn't part of the command
protocol, but can be used as an escape hatch if a binding needs to
directly interact with the UI.

Key names may be strings like `"Shift-Ctrl-Enter"`—a key
identifier prefixed with zero or more modifiers. Key identifiers
are based on the strings that can appear in
[`KeyEvent.key`](https:developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use `"Space"` as an alias
for the `" "` name.

Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
`Meta-`) are recognized. For characters that are created by holding
shift, the `Shift-` prefix is implied, and should not be added
explicitly.

You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
other platforms.

You can add multiple keymap plugins to an editor. The order in
which they appear determines their precedence (the ones early in
the array get to dispatch first).
*/
function keymap$1(bindings) {
	return new Plugin({ props: { handleKeyDown: keydownHandler(bindings) } });
}
/**
Given a set of bindings (using the same format as
[`keymap`](https://prosemirror.net/docs/ref/#keymap.keymap)), return a [keydown
handler](https://prosemirror.net/docs/ref/#view.EditorProps.handleKeyDown) that handles them.
*/
function keydownHandler(bindings) {
	let map = normalize$4(bindings);
	return function(view, event) {
		let name = keyName(event), baseName, direct = map[modifiers$1(name, event)];
		if (direct && direct(view.state, view.dispatch, view)) return true;
		if (name.length == 1 && name != " ") {
			if (event.shiftKey) {
				let noShift = map[modifiers$1(name, event, false)];
				if (noShift && noShift(view.state, view.dispatch, view)) return true;
			}
			if ((event.altKey || event.metaKey || event.ctrlKey) && !(windows$1 && event.ctrlKey && event.altKey) && (baseName = base[event.keyCode]) && baseName != name) {
				let fromCode = map[modifiers$1(baseName, event)];
				if (fromCode && fromCode(view.state, view.dispatch, view)) return true;
			}
		}
		return false;
	};
}

export { keydownHandler, keymap$1 };
