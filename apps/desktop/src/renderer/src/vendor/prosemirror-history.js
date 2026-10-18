// Reconstructed from index-C74mRL57.js — original module: vendor/prosemirror-history
import { Mapping } from "./prosemirror-transform.js";
import { Plugin, PluginKey } from "./prosemirror-state.js";
import { Decoration$1, DecorationSet } from "./prosemirror-view.js";
import { Extension, callOrReturn, getExtensionField, isNodeEmpty, isNodeSelection } from "./@tiptap/core.js";
import { Blockquote } from "./@tiptap/extension-blockquote.js";
import { Bold } from "./@tiptap/extension-bold.js";
import { Code } from "./@tiptap/extension-code.js";
import { CodeBlock } from "./@tiptap/extension-code-block.js";
import { Document$1 } from "./@tiptap/extension-document.js";
import { HardBreak } from "./@tiptap/extension-hard-break.js";
import { Heading } from "./@tiptap/extension-heading.js";
import { HorizontalRule } from "./@tiptap/extension-horizontal-rule.js";
import { Italic } from "./@tiptap/extension-italic.js";
import { Link } from "./@tiptap/extension-link.js";
import { BulletList, ListItem, ListKeymap, OrderedList } from "./@tiptap/extension-list.js";
import { Paragraph } from "./@tiptap/extension-paragraph.js";
import { Strike } from "./@tiptap/extension-strike.js";
import { Text$2 } from "./@tiptap/extension-text.js";
import { Underline } from "./@tiptap/extension-underline.js";
import { dropCursor$1 } from "./prosemirror-dropcursor.js";
import { gapCursor } from "./prosemirror-gapcursor.js";
import { RopeSequence } from "./rope-sequence.js";

var max_empty_items = 500;
var Branch = class Branch {
	constructor(items, eventCount) {
		this.items = items;
		this.eventCount = eventCount;
	}
	popEvent(state, preserveItems) {
		if (this.eventCount == 0) return null;
		let end = this.items.length;
		for (;; end--) if (this.items.get(end - 1).selection) {
			--end;
			break;
		}
		let remap, mapFrom;
		if (preserveItems) {
			remap = this.remapping(end, this.items.length);
			mapFrom = remap.maps.length;
		}
		let transform = state.tr;
		let selection, remaining;
		let addAfter = [], addBefore = [];
		this.items.forEach((item, i) => {
			if (!item.step) {
				if (!remap) {
					remap = this.remapping(end, i + 1);
					mapFrom = remap.maps.length;
				}
				mapFrom--;
				addBefore.push(item);
				return;
			}
			if (remap) {
				addBefore.push(new Item(item.map));
				let step = item.step.map(remap.slice(mapFrom)), map;
				if (step && transform.maybeStep(step).doc) {
					map = transform.mapping.maps[transform.mapping.maps.length - 1];
					addAfter.push(new Item(map, void 0, void 0, addAfter.length + addBefore.length));
				}
				mapFrom--;
				if (map) remap.appendMap(map, mapFrom);
			} else transform.maybeStep(item.step);
			if (item.selection) {
				selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
				remaining = new Branch(this.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this.eventCount - 1);
				return false;
			}
		}, this.items.length, 0);
		return {
			remaining,
			transform,
			selection
		};
	}
	addTransform(transform, selection, histOptions, preserveItems) {
		let newItems = [], eventCount = this.eventCount;
		let oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;
		for (let i = 0; i < transform.steps.length; i++) {
			let step = transform.steps[i].invert(transform.docs[i]);
			let item = new Item(transform.mapping.maps[i], step, selection), merged;
			if (merged = lastItem && lastItem.merge(item)) {
				item = merged;
				if (i) newItems.pop();
				else oldItems = oldItems.slice(0, oldItems.length - 1);
			}
			newItems.push(item);
			if (selection) {
				eventCount++;
				selection = void 0;
			}
			if (!preserveItems) lastItem = item;
		}
		let overflow = eventCount - histOptions.depth;
		if (overflow > DEPTH_OVERFLOW) {
			oldItems = cutOffEvents(oldItems, overflow);
			eventCount -= overflow;
		}
		return new Branch(oldItems.append(newItems), eventCount);
	}
	remapping(from, to) {
		let maps = new Mapping();
		this.items.forEach((item, i) => {
			let mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from ? maps.maps.length - item.mirrorOffset : void 0;
			maps.appendMap(item.map, mirrorPos);
		}, from, to);
		return maps;
	}
	addMaps(array) {
		if (this.eventCount == 0) return this;
		return new Branch(this.items.append(array.map((map) => new Item(map))), this.eventCount);
	}
	rebased(rebasedTransform, rebasedCount) {
		if (!this.eventCount) return this;
		let rebasedItems = [], start = Math.max(0, this.items.length - rebasedCount);
		let mapping = rebasedTransform.mapping;
		let newUntil = rebasedTransform.steps.length;
		let eventCount = this.eventCount;
		this.items.forEach((item) => {
			if (item.selection) eventCount--;
		}, start);
		let iRebased = rebasedCount;
		this.items.forEach((item) => {
			let pos = mapping.getMirror(--iRebased);
			if (pos == null) return;
			newUntil = Math.min(newUntil, pos);
			let map = mapping.maps[pos];
			if (item.step) {
				let step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
				let selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
				if (selection) eventCount++;
				rebasedItems.push(new Item(map, step, selection));
			} else rebasedItems.push(new Item(map));
		}, start);
		let newMaps = [];
		for (let i = rebasedCount; i < newUntil; i++) newMaps.push(new Item(mapping.maps[i]));
		let items = this.items.slice(0, start).append(newMaps).append(rebasedItems);
		let branch = new Branch(items, eventCount);
		if (branch.emptyItemCount() > max_empty_items) branch = branch.compress(this.items.length - rebasedItems.length);
		return branch;
	}
	emptyItemCount() {
		let count = 0;
		this.items.forEach((item) => {
			if (!item.step) count++;
		});
		return count;
	}
	compress(upto = this.items.length) {
		let remap = this.remapping(0, upto), mapFrom = remap.maps.length;
		let items = [], events = 0;
		this.items.forEach((item, i) => {
			if (i >= upto) {
				items.push(item);
				if (item.selection) events++;
			} else if (item.step) {
				let step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap();
				mapFrom--;
				if (map) remap.appendMap(map, mapFrom);
				if (step) {
					let selection = item.selection && item.selection.map(remap.slice(mapFrom));
					if (selection) events++;
					let newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1;
					if (merged = items.length && items[last].merge(newItem)) items[last] = merged;
					else items.push(newItem);
				}
			} else if (item.map) mapFrom--;
		}, this.items.length, 0);
		return new Branch(RopeSequence.from(items.reverse()), events);
	}
};
Branch.empty = new Branch(RopeSequence.empty, 0);
function cutOffEvents(items, n) {
	let cutPoint;
	items.forEach((item, i) => {
		if (item.selection && n-- == 0) {
			cutPoint = i;
			return false;
		}
	});
	return items.slice(cutPoint);
}
var Item = class Item {
	constructor(map, step, selection, mirrorOffset) {
		this.map = map;
		this.step = step;
		this.selection = selection;
		this.mirrorOffset = mirrorOffset;
	}
	merge(other) {
		if (this.step && other.step && !other.selection) {
			let step = other.step.merge(this.step);
			if (step) return new Item(step.getMap().invert(), step, this.selection);
		}
	}
};
var HistoryState$1 = class {
	constructor(done, undone, prevRanges, prevTime, prevComposition) {
		this.done = done;
		this.undone = undone;
		this.prevRanges = prevRanges;
		this.prevTime = prevTime;
		this.prevComposition = prevComposition;
	}
};
var DEPTH_OVERFLOW = 20;
function applyTransaction(history, state, tr, options) {
	let historyTr = tr.getMeta(historyKey$1), rebased;
	if (historyTr) return historyTr.historyState;
	if (tr.getMeta(closeHistoryKey)) history = new HistoryState$1(history.done, history.undone, null, 0, -1);
	let appended = tr.getMeta("appendedTransaction");
	if (tr.steps.length == 0) return history;
	else if (appended && appended.getMeta(historyKey$1)) {
		if (appended.getMeta(historyKey$1).redo) return new HistoryState$1(history.done.addTransform(tr, void 0, options, mustPreserveItems(state)), history.undone, rangesFor(tr.mapping.maps), history.prevTime, history.prevComposition);
		else return new HistoryState$1(history.done, history.undone.addTransform(tr, void 0, options, mustPreserveItems(state)), null, history.prevTime, history.prevComposition);
	} else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
		let composition = tr.getMeta("composition");
		let newGroup = history.prevTime == 0 || !appended && history.prevComposition != composition && (history.prevTime < (tr.time || 0) - options.newGroupDelay || !isAdjacentTo(tr, history.prevRanges));
		let prevRanges = appended ? mapRanges(history.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps);
		return new HistoryState$1(history.done.addTransform(tr, newGroup ? state.selection.getBookmark() : void 0, options, mustPreserveItems(state)), Branch.empty, prevRanges, tr.time, composition == null ? history.prevComposition : composition);
	} else if (rebased = tr.getMeta("rebased")) return new HistoryState$1(history.done.rebased(tr, rebased), history.undone.rebased(tr, rebased), mapRanges(history.prevRanges, tr.mapping), history.prevTime, history.prevComposition);
	else return new HistoryState$1(history.done.addMaps(tr.mapping.maps), history.undone.addMaps(tr.mapping.maps), mapRanges(history.prevRanges, tr.mapping), history.prevTime, history.prevComposition);
}
function isAdjacentTo(transform, prevRanges) {
	if (!prevRanges) return false;
	if (!transform.docChanged) return true;
	let adjacent = false;
	transform.mapping.maps[0].forEach((start, end) => {
		for (let i = 0; i < prevRanges.length; i += 2) if (start <= prevRanges[i + 1] && end >= prevRanges[i]) adjacent = true;
	});
	return adjacent;
}
function rangesFor(maps) {
	let result = [];
	for (let i = maps.length - 1; i >= 0 && result.length == 0; i--) maps[i].forEach((_from, _to, from, to) => result.push(from, to));
	return result;
}
function mapRanges(ranges, mapping) {
	if (!ranges) return null;
	let result = [];
	for (let i = 0; i < ranges.length; i += 2) {
		let from = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
		if (from <= to) result.push(from, to);
	}
	return result;
}
function histTransaction(history, state, redo) {
	let preserveItems = mustPreserveItems(state);
	let histOptions = historyKey$1.get(state).spec.config;
	let pop = (redo ? history.undone : history.done).popEvent(state, preserveItems);
	if (!pop) return null;
	let selection = pop.selection.resolve(pop.transform.doc);
	let added = (redo ? history.done : history.undone).addTransform(pop.transform, state.selection.getBookmark(), histOptions, preserveItems);
	let newHist = new HistoryState$1(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0, -1);
	return pop.transform.setSelection(selection).setMeta(historyKey$1, {
		redo,
		historyState: newHist
	});
}
var cachedPreserveItems = false;
var cachedPreserveItemsPlugins = null;
function mustPreserveItems(state) {
	let plugins = state.plugins;
	if (cachedPreserveItemsPlugins != plugins) {
		cachedPreserveItems = false;
		cachedPreserveItemsPlugins = plugins;
		for (let i = 0; i < plugins.length; i++) if (plugins[i].spec.historyPreserveItems) {
			cachedPreserveItems = true;
			break;
		}
	}
	return cachedPreserveItems;
}
var historyKey$1 = new PluginKey("history");
var closeHistoryKey = new PluginKey("closeHistory");
/**
Returns a plugin that enables the undo history for an editor. The
plugin will track undo and redo stacks, which can be used with the
[`undo`](https://prosemirror.net/docs/ref/#history.undo) and [`redo`](https://prosemirror.net/docs/ref/#history.redo) commands.

You can set an `"addToHistory"` [metadata
property](https://prosemirror.net/docs/ref/#state.Transaction.setMeta) of `false` on a transaction
to prevent it from being rolled back by undo.
*/
function history$1(config = {}) {
	config = {
		depth: config.depth || 100,
		newGroupDelay: config.newGroupDelay || 500
	};
	return new Plugin({
		key: historyKey$1,
		state: {
			init() {
				return new HistoryState$1(Branch.empty, Branch.empty, null, 0, -1);
			},
			apply(tr, hist, state) {
				return applyTransaction(hist, state, tr, config);
			}
		},
		config,
		props: { handleDOMEvents: { beforeinput(view, e) {
			let inputType = e.inputType;
			let command = inputType == "historyUndo" ? undo$1 : inputType == "historyRedo" ? redo$1 : null;
			if (!command || !view.editable) return false;
			e.preventDefault();
			return command(view.state, view.dispatch);
		} } }
	});
}
function buildCommand(redo, scroll) {
	return (state, dispatch) => {
		let hist = historyKey$1.getState(state);
		if (!hist || (redo ? hist.undone : hist.done).eventCount == 0) return false;
		if (dispatch) {
			let tr = histTransaction(hist, state, redo);
			if (tr) dispatch(scroll ? tr.scrollIntoView() : tr);
		}
		return true;
	};
}
/**
A command function that undoes the last change, if any.
*/
var undo$1 = buildCommand(false, true);
/**
A command function that redoes the last undone change, if any.
*/
var redo$1 = buildCommand(true, true);
Extension.create({
	name: "characterCount",
	addOptions() {
		return {
			limit: null,
			mode: "textSize",
			textCounter: (text) => text.length,
			wordCounter: (text) => text.split(" ").filter((word) => word !== "").length
		};
	},
	addStorage() {
		return {
			characters: () => 0,
			words: () => 0
		};
	},
	onBeforeCreate() {
		this.storage.characters = (options) => {
			const node = (options == null ? void 0 : options.node) || this.editor.state.doc;
			if (((options == null ? void 0 : options.mode) || this.options.mode) === "textSize") {
				const text = node.textBetween(0, node.content.size, void 0, " ");
				return this.options.textCounter(text);
			}
			return node.nodeSize;
		};
		this.storage.words = (options) => {
			const node = (options == null ? void 0 : options.node) || this.editor.state.doc;
			const text = node.textBetween(0, node.content.size, " ", " ");
			return this.options.wordCounter(text);
		};
	},
	addProseMirrorPlugins() {
		let initialEvaluationDone = false;
		return [new Plugin({
			key: new PluginKey("characterCount"),
			appendTransaction: (transactions, oldState, newState) => {
				if (initialEvaluationDone) return;
				const limit = this.options.limit;
				if (limit === null || limit === void 0 || limit === 0) {
					initialEvaluationDone = true;
					return;
				}
				const initialContentSize = this.storage.characters({ node: newState.doc });
				if (initialContentSize > limit) {
					const over = initialContentSize - limit;
					const from = 0;
					const to = over;
					console.warn(`[CharacterCount] Initial content exceeded limit of ${limit} characters. Content was automatically trimmed.`);
					const tr = newState.tr.deleteRange(from, to);
					initialEvaluationDone = true;
					return tr;
				}
				initialEvaluationDone = true;
			},
			filterTransaction: (transaction, state) => {
				const limit = this.options.limit;
				if (!transaction.docChanged || limit === 0 || limit === null || limit === void 0) return true;
				const oldSize = this.storage.characters({ node: state.doc });
				const newSize = this.storage.characters({ node: transaction.doc });
				if (newSize <= limit) return true;
				if (oldSize > limit && newSize > limit && newSize <= oldSize) return true;
				if (oldSize > limit && newSize > limit && newSize > oldSize) return false;
				if (!transaction.getMeta("paste")) return false;
				const pos = transaction.selection.$head.pos;
				const from = pos - (newSize - limit);
				const to = pos;
				transaction.deleteRange(from, to);
				if (this.storage.characters({ node: transaction.doc }) > limit) return false;
				return true;
			}
		})];
	}
});
var Dropcursor = Extension.create({
	name: "dropCursor",
	addOptions() {
		return {
			color: "currentColor",
			width: 1,
			class: void 0
		};
	},
	addProseMirrorPlugins() {
		return [dropCursor$1(this.options)];
	}
});
Extension.create({
	name: "focus",
	addOptions() {
		return {
			className: "has-focus",
			mode: "all"
		};
	},
	addProseMirrorPlugins() {
		return [new Plugin({
			key: new PluginKey("focus"),
			props: { decorations: ({ doc, selection }) => {
				const { isEditable, isFocused } = this.editor;
				const { anchor } = selection;
				const decorations = [];
				if (!isEditable || !isFocused) return DecorationSet.create(doc, []);
				let maxLevels = 0;
				if (this.options.mode === "deepest") doc.descendants((node, pos) => {
					if (node.isText) return;
					if (!(anchor >= pos && anchor <= pos + node.nodeSize - 1)) return false;
					maxLevels += 1;
				});
				let currentLevel = 0;
				doc.descendants((node, pos) => {
					if (node.isText) return false;
					if (!(anchor >= pos && anchor <= pos + node.nodeSize - 1)) return false;
					currentLevel += 1;
					if (this.options.mode === "deepest" && maxLevels - currentLevel > 0 || this.options.mode === "shallowest" && currentLevel > 1) return this.options.mode === "deepest";
					decorations.push(Decoration$1.node(pos, pos + node.nodeSize, { class: this.options.className }));
				});
				return DecorationSet.create(doc, decorations);
			} }
		})];
	}
});
var Gapcursor = Extension.create({
	name: "gapCursor",
	addProseMirrorPlugins() {
		return [gapCursor()];
	},
	extendNodeSchema(extension) {
		var _a;
		return { allowGapCursor: (_a = callOrReturn(getExtensionField(extension, "allowGapCursor", {
			name: extension.name,
			options: extension.options,
			storage: extension.storage
		}))) != null ? _a : null };
	}
});
var DEFAULT_DATA_ATTRIBUTE = "placeholder";
function preparePlaceholderAttribute(attr) {
	return attr.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/^[0-9-]+/, "").replace(/^-+/, "").toLowerCase();
}
Extension.create({
	name: "placeholder",
	addOptions() {
		return {
			emptyEditorClass: "is-editor-empty",
			emptyNodeClass: "is-empty",
			dataAttribute: DEFAULT_DATA_ATTRIBUTE,
			placeholder: "Write something …",
			showOnlyWhenEditable: true,
			showOnlyCurrent: true,
			includeChildren: false
		};
	},
	addProseMirrorPlugins() {
		const dataAttribute = this.options.dataAttribute ? `data-${preparePlaceholderAttribute(this.options.dataAttribute)}` : `data-${DEFAULT_DATA_ATTRIBUTE}`;
		return [new Plugin({
			key: new PluginKey("placeholder"),
			props: { decorations: ({ doc, selection }) => {
				const active = this.editor.isEditable || !this.options.showOnlyWhenEditable;
				const { anchor } = selection;
				const decorations = [];
				if (!active) return null;
				const isEmptyDoc = this.editor.isEmpty;
				doc.descendants((node, pos) => {
					const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
					const isEmpty = !node.isLeaf && isNodeEmpty(node);
					if (!node.type.isTextblock) return this.options.includeChildren;
					if ((hasAnchor || !this.options.showOnlyCurrent) && isEmpty) {
						const classes = [this.options.emptyNodeClass];
						if (isEmptyDoc) classes.push(this.options.emptyEditorClass);
						const decoration = Decoration$1.node(pos, pos + node.nodeSize, {
							class: classes.join(" "),
							[dataAttribute]: typeof this.options.placeholder === "function" ? this.options.placeholder({
								editor: this.editor,
								node,
								pos,
								hasAnchor
							}) : this.options.placeholder
						});
						decorations.push(decoration);
					}
					return this.options.includeChildren;
				});
				return DecorationSet.create(doc, decorations);
			} }
		})];
	}
});
Extension.create({
	name: "selection",
	addOptions() {
		return { className: "selection" };
	},
	addProseMirrorPlugins() {
		const { editor, options } = this;
		return [new Plugin({
			key: new PluginKey("selection"),
			props: { decorations(state) {
				if (state.selection.empty || editor.isFocused || !editor.isEditable || isNodeSelection(state.selection) || editor.view.dragging) return null;
				return DecorationSet.create(state.doc, [Decoration$1.inline(state.selection.from, state.selection.to, { class: options.className })]);
			} }
		})];
	}
});
function nodeEqualsType({ types, node }) {
	return node && Array.isArray(types) && types.includes(node.type) || (node == null ? void 0 : node.type) === types;
}
var TrailingNode = Extension.create({
	name: "trailingNode",
	addOptions() {
		return {
			node: void 0,
			notAfter: []
		};
	},
	addProseMirrorPlugins() {
		var _a;
		const plugin = new PluginKey(this.name);
		const defaultNode = this.options.node || ((_a = this.editor.schema.topNodeType.contentMatch.defaultType) == null ? void 0 : _a.name) || "paragraph";
		const disabledNodes = Object.entries(this.editor.schema.nodes).map(([, value]) => value).filter((node) => (this.options.notAfter || []).concat(defaultNode).includes(node.name));
		return [new Plugin({
			key: plugin,
			appendTransaction: (transactions, __, state) => {
				const { doc, tr, schema } = state;
				const shouldInsertNodeAtEnd = plugin.getState(state);
				const endPosition = doc.content.size;
				const type = schema.nodes[defaultNode];
				if (transactions.some((transaction) => transaction.getMeta("skipTrailingNode"))) return;
				if (!shouldInsertNodeAtEnd) return;
				return tr.insert(endPosition, type.create());
			},
			state: {
				init: (_, state) => {
					const lastNode = state.tr.doc.lastChild;
					return !nodeEqualsType({
						node: lastNode,
						types: disabledNodes
					});
				},
				apply: (tr, value) => {
					if (!tr.docChanged) return value;
					if (tr.getMeta("__uniqueIDTransaction")) return value;
					const lastNode = tr.doc.lastChild;
					return !nodeEqualsType({
						node: lastNode,
						types: disabledNodes
					});
				}
			}
		})];
	}
});
var UndoRedo = Extension.create({
	name: "undoRedo",
	addOptions() {
		return {
			depth: 100,
			newGroupDelay: 500
		};
	},
	addCommands() {
		return {
			undo: () => ({ state, dispatch }) => {
				return undo$1(state, dispatch);
			},
			redo: () => ({ state, dispatch }) => {
				return redo$1(state, dispatch);
			}
		};
	},
	addProseMirrorPlugins() {
		return [history$1(this.options)];
	},
	addKeyboardShortcuts() {
		return {
			"Mod-z": () => this.editor.commands.undo(),
			"Shift-Mod-z": () => this.editor.commands.redo(),
			"Mod-y": () => this.editor.commands.redo(),
			"Mod-я": () => this.editor.commands.undo(),
			"Shift-Mod-я": () => this.editor.commands.redo()
		};
	}
});
var index_default = Extension.create({
	name: "starterKit",
	addExtensions() {
		var _a, _b, _c, _d;
		const extensions = [];
		if (this.options.bold !== false) extensions.push(Bold.configure(this.options.bold));
		if (this.options.blockquote !== false) extensions.push(Blockquote.configure(this.options.blockquote));
		if (this.options.bulletList !== false) extensions.push(BulletList.configure(this.options.bulletList));
		if (this.options.code !== false) extensions.push(Code.configure(this.options.code));
		if (this.options.codeBlock !== false) extensions.push(CodeBlock.configure(this.options.codeBlock));
		if (this.options.document !== false) extensions.push(Document$1.configure(this.options.document));
		if (this.options.dropcursor !== false) extensions.push(Dropcursor.configure(this.options.dropcursor));
		if (this.options.gapcursor !== false) extensions.push(Gapcursor.configure(this.options.gapcursor));
		if (this.options.hardBreak !== false) extensions.push(HardBreak.configure(this.options.hardBreak));
		if (this.options.heading !== false) extensions.push(Heading.configure(this.options.heading));
		if (this.options.undoRedo !== false) extensions.push(UndoRedo.configure(this.options.undoRedo));
		if (this.options.horizontalRule !== false) extensions.push(HorizontalRule.configure(this.options.horizontalRule));
		if (this.options.italic !== false) extensions.push(Italic.configure(this.options.italic));
		if (this.options.listItem !== false) extensions.push(ListItem.configure(this.options.listItem));
		if (this.options.listKeymap !== false) extensions.push(ListKeymap.configure((_a = this.options) == null ? void 0 : _a.listKeymap));
		if (this.options.link !== false) extensions.push(Link.configure((_b = this.options) == null ? void 0 : _b.link));
		if (this.options.orderedList !== false) extensions.push(OrderedList.configure(this.options.orderedList));
		if (this.options.paragraph !== false) extensions.push(Paragraph.configure(this.options.paragraph));
		if (this.options.strike !== false) extensions.push(Strike.configure(this.options.strike));
		if (this.options.text !== false) extensions.push(Text$2.configure(this.options.text));
		if (this.options.underline !== false) extensions.push(Underline.configure((_c = this.options) == null ? void 0 : _c.underline));
		if (this.options.trailingNode !== false) extensions.push(TrailingNode.configure((_d = this.options) == null ? void 0 : _d.trailingNode));
		return extensions;
	}
});

export { index_default };
