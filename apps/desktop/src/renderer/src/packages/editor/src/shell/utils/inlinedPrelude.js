// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/inlinedPrelude.ts
import { tags$1 } from "../../../../../vendor/@lezer/highlight.js";
import { EditorState, Facet, StateEffect, StateField, Transaction } from "../../../../../vendor/@codemirror/state.js";
import { Decoration, EditorView$1, WidgetType } from "../../../../../vendor/@codemirror/view.js";
import { highlightingFor } from "../../../../../vendor/@codemirror/language.js";

var preludeFacet = Facet.define({ combine: (values) => values[0] ?? null });
var toggleFile = StateEffect.define();
/** Expanded file paths. Kept by path, so it survives selection changes. */
var expandedFiles = StateField.define({
	create: () => /* @__PURE__ */ new Set(),
	update(value, tr) {
		let next = value;
		for (const effect of tr.effects) {
			if (!effect.is(toggleFile)) continue;
			const copy = new Set(next);
			if (!copy.delete(effect.value)) copy.add(effect.value);
			next = copy;
		}
		return next;
	}
});
/** The prelude only applies while the document actually starts with it. */
function activePrelude(state) {
	const prelude = state.facet(preludeFacet);
	if (!prelude || state.doc.length < prelude.text.length) return null;
	return state.sliceDoc(0, prelude.text.length) === prelude.text ? prelude : null;
}
/** The folded line count, styled as the rest of the `// path` comment. */
var LineCountWidget = class extends WidgetType {
	constructor(path, label, commentClass) {
		super();
		this.path = path;
		this.label = label;
		this.commentClass = commentClass;
	}
	eq(other) {
		return other.path === this.path && other.label === this.label && other.commentClass === this.commentClass;
	}
	toDOM(view) {
		const el = document.createElement("span");
		el.className = `cm-inlined-line-count ${this.commentClass}`;
		el.textContent = this.label;
		el.addEventListener("mousedown", (event) => {
			event.preventDefault();
			view.dispatch({ effects: toggleFile.of(this.path) });
		});
		return el;
	}
};
var SVG_NS = "http://www.w3.org/2000/svg";
var CARET_RIGHT = "M6 4L10 8L6 12";
var CARET_DOWN = "M12 6L8 10L4 6";
var ChevronWidget = class extends WidgetType {
	constructor(path, expanded) {
		super();
		this.path = path;
		this.expanded = expanded;
	}
	eq(other) {
		return other.path === this.path && other.expanded === this.expanded;
	}
	toDOM(view) {
		const el = document.createElement("span");
		el.className = "cm-inlined-chevron";
		el.setAttribute("aria-label", this.expanded ? "Collapse" : "Expand");
		const svg = document.createElementNS(SVG_NS, "svg");
		svg.setAttribute("viewBox", "0 0 16 16");
		svg.setAttribute("fill", "none");
		const stroke = document.createElementNS(SVG_NS, "path");
		stroke.setAttribute("d", this.expanded ? CARET_DOWN : CARET_RIGHT);
		stroke.setAttribute("stroke", "currentColor");
		stroke.setAttribute("stroke-linecap", "round");
		stroke.setAttribute("stroke-linejoin", "round");
		svg.appendChild(stroke);
		el.appendChild(svg);
		el.addEventListener("mousedown", (event) => {
			event.preventDefault();
			view.dispatch({ effects: toggleFile.of(this.path) });
		});
		return el;
	}
};
var fileLine = Decoration.line({ class: "cm-inlined-file-line" });
function buildDecorations(state) {
	const prelude = activePrelude(state);
	if (!prelude) return Decoration.none;
	const expanded = state.field(expandedFiles);
	const commentClass = highlightingFor(state, [tags$1.comment]) ?? "";
	const ranges = [];
	for (const file of prelude.files) {
		const header = state.doc.lineAt(file.from);
		if (file.to <= header.to) continue;
		const open = expanded.has(file.path);
		ranges.push(fileLine.range(header.from));
		ranges.push(Decoration.widget({
			widget: new ChevronWidget(file.path, open),
			side: -1
		}).range(file.from));
		if (!open) {
			const lines = state.doc.lineAt(file.to).number - header.number;
			ranges.push(Decoration.replace({ widget: new LineCountWidget(file.path, ` · ${lines} ${lines === 1 ? "line" : "lines"}`, commentClass) }).range(header.to, file.to));
		}
	}
	return Decoration.set(ranges, true);
}
var inlinedPreludeBase = [
	expandedFiles,
	StateField.define({
		create: buildDecorations,
		update(value, tr) {
			const prelude = tr.state.facet(preludeFacet);
			return prelude !== tr.startState.facet(preludeFacet) || tr.effects.some((e) => e.is(toggleFile)) || prelude && tr.docChanged && tr.changes.touchesRange(0, prelude.text.length) ? buildDecorations(tr.state) : value.map(tr.changes);
		},
		provide: (field) => EditorView$1.decorations.from(field)
	}),
	EditorState.changeFilter.of((tr) => {
		if (tr.annotation(Transaction.userEvent) === void 0) return true;
		const prelude = activePrelude(tr.startState);
		return prelude ? [0, prelude.text.length] : true;
	}),
	EditorView$1.domEventHandlers({ mousedown(event, view) {
		const prelude = activePrelude(view.state);
		const pos = prelude && view.posAtCoords({
			x: event.clientX,
			y: event.clientY
		});
		if (pos == null || !prelude) return false;
		const file = prelude.files.find((f) => view.state.doc.lineAt(f.from).number === view.state.doc.lineAt(pos).number);
		if (!file) return false;
		event.preventDefault();
		view.dispatch({ effects: toggleFile.of(file.path) });
		return true;
	} }),
	EditorView$1.baseTheme({
		".cm-inlined-file-line": { cursor: "default" },
		".cm-inlined-file-line:hover": { backgroundColor: "color-mix(in oklab, var(--ed-foreground) 6%, transparent)" },
		".cm-inlined-chevron": {
			display: "inline-flex",
			verticalAlign: "middle",
			marginRight: "4px",
			cursor: "default",
			color: "var(--ed-muted-foreground)"
		},
		".cm-inlined-chevron svg": {
			width: "12px",
			height: "12px"
		},
		".cm-inlined-line-count": { cursor: "default" }
	})
];
function inlinedPrelude(prelude) {
	return [preludeFacet.of(prelude), inlinedPreludeBase];
}

export { inlinedPrelude };
