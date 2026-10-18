// Reconstructed from index-C74mRL57.js — original module: vendor/@uiw/react-codemirror
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { Annotation, EditorState, StateEffect } from "../@codemirror/state.js";
import { EditorView$1, keymap, placeholder } from "../@codemirror/view.js";
import { _extends, _objectWithoutPropertiesLoose } from "../@babel/runtime.js";
import { indentWithTab } from "../@codemirror/commands.js";
import { basicSetup } from "./codemirror-extensions-basic-setup.js";
import { oneDark } from "../@codemirror/theme-one-dark.js";

var defaultLightThemeOption = EditorView$1.theme({ "&": { backgroundColor: "#fff" } }, { dark: false });
var getDefaultExtensions = function getDefaultExtensions(optios) {
	if (optios === void 0) optios = {};
	var { indentWithTab: defaultIndentWithTab = true, editable = true, readOnly = false, theme = "light", placeholder: placeholderStr = "", basicSetup: defaultBasicSetup = true } = optios;
	var getExtensions = [];
	if (defaultIndentWithTab) getExtensions.unshift(keymap.of([indentWithTab]));
	if (defaultBasicSetup) {
		if (typeof defaultBasicSetup === "boolean") getExtensions.unshift(basicSetup());
		else getExtensions.unshift(basicSetup(defaultBasicSetup));
	}
	if (placeholderStr) getExtensions.unshift(placeholder(placeholderStr));
	switch (theme) {
		case "light":
			getExtensions.push(defaultLightThemeOption);
			break;
		case "dark":
			getExtensions.push(oneDark);
			break;
		case "none": break;
		default: getExtensions.push(theme);
	}
	if (editable === false) getExtensions.push(EditorView$1.editable.of(false));
	if (readOnly) getExtensions.push(EditorState.readOnly.of(true));
	return [...getExtensions];
};
var getStatistics = (view) => {
	return {
		line: view.state.doc.lineAt(view.state.selection.main.from),
		lineCount: view.state.doc.lines,
		lineBreak: view.state.lineBreak,
		length: view.state.doc.length,
		readOnly: view.state.readOnly,
		tabSize: view.state.tabSize,
		selection: view.state.selection,
		selectionAsSingle: view.state.selection.asSingle().main,
		ranges: view.state.selection.ranges,
		selectionCode: view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to),
		selections: view.state.selection.ranges.map((r) => view.state.sliceDoc(r.from, r.to)),
		selectedText: view.state.selection.ranges.some((r) => !r.empty)
	};
};
var TimeoutLatch = class {
	constructor(callback, timeoutMS) {
		this.timeLeftMS = void 0;
		this.timeoutMS = void 0;
		this.isCancelled = false;
		this.isTimeExhausted = false;
		this.callbacks = [];
		this.timeLeftMS = timeoutMS;
		this.timeoutMS = timeoutMS;
		this.callbacks.push(callback);
	}
	tick() {
		if (!this.isCancelled && !this.isTimeExhausted) {
			this.timeLeftMS--;
			if (this.timeLeftMS <= 0) {
				this.isTimeExhausted = true;
				var callbacks = this.callbacks.slice();
				this.callbacks.length = 0;
				callbacks.forEach((callback) => {
					try {
						callback();
					} catch (error) {
						console.error("TimeoutLatch callback error:", error);
					}
				});
			}
		}
	}
	cancel() {
		this.isCancelled = true;
		this.callbacks.length = 0;
	}
	reset() {
		this.timeLeftMS = this.timeoutMS;
		this.isCancelled = false;
		this.isTimeExhausted = false;
	}
	get isDone() {
		return this.isCancelled || this.isTimeExhausted;
	}
};
var Scheduler = class {
	constructor() {
		this.interval = null;
		this.latches = /* @__PURE__ */ new Set();
	}
	add(latch) {
		this.latches.add(latch);
		this.start();
	}
	remove(latch) {
		this.latches.delete(latch);
		if (this.latches.size === 0) this.stop();
	}
	start() {
		if (this.interval === null) this.interval = setInterval(() => {
			this.latches.forEach((latch) => {
				latch.tick();
				if (latch.isDone) this.remove(latch);
			});
		}, 1);
	}
	stop() {
		if (this.interval !== null) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
};
var globalScheduler = null;
var getScheduler = () => {
	if (typeof window === "undefined") return new Scheduler();
	if (!globalScheduler) globalScheduler = new Scheduler();
	return globalScheduler;
};
var ExternalChange = Annotation.define();
var TYPING_TIMOUT = 200;
var emptyExtensions = [];
function useCodeMirror(props) {
	var { value, selection, onChange, onStatistics, onCreateEditor, onUpdate, extensions = emptyExtensions, autoFocus, theme = "light", height = null, minHeight = null, maxHeight = null, width = null, minWidth = null, maxWidth = null, placeholder: placeholderStr = "", editable = true, readOnly = false, indentWithTab: defaultIndentWithTab = true, basicSetup: defaultBasicSetup = true, root, initialState } = props;
	var [container, setContainer] = (0, import_react.useState)();
	var [view, setView] = (0, import_react.useState)();
	var [state, setState] = (0, import_react.useState)();
	var typingLatch = (0, import_react.useState)(() => ({ current: null }))[0];
	var pendingUpdate = (0, import_react.useState)(() => ({ current: null }))[0];
	var defaultThemeOption = EditorView$1.theme({
		"&": {
			height,
			minHeight,
			maxHeight,
			width,
			minWidth,
			maxWidth
		},
		"& .cm-scroller": { height: "100% !important" }
	});
	var getExtensions = [
		EditorView$1.updateListener.of((vu) => {
			if (vu.docChanged && typeof onChange === "function" && !vu.transactions.some((tr) => tr.annotation(ExternalChange))) {
				if (typingLatch.current) typingLatch.current.reset();
				else {
					typingLatch.current = new TimeoutLatch(() => {
						if (pendingUpdate.current) {
							var forceUpdate = pendingUpdate.current;
							pendingUpdate.current = null;
							forceUpdate();
						}
						typingLatch.current = null;
					}, TYPING_TIMOUT);
					getScheduler().add(typingLatch.current);
				}
				onChange(vu.state.doc.toString(), vu);
			}
			onStatistics && onStatistics(getStatistics(vu));
		}),
		defaultThemeOption,
		...getDefaultExtensions({
			theme,
			editable,
			readOnly,
			placeholder: placeholderStr,
			indentWithTab: defaultIndentWithTab,
			basicSetup: defaultBasicSetup
		})
	];
	if (onUpdate && typeof onUpdate === "function") getExtensions.push(EditorView$1.updateListener.of(onUpdate));
	getExtensions = getExtensions.concat(extensions);
	(0, import_react.useLayoutEffect)(() => {
		if (container && !state) {
			var config = {
				doc: value,
				selection,
				extensions: getExtensions
			};
			var stateCurrent = initialState ? EditorState.fromJSON(initialState.json, config, initialState.fields) : EditorState.create(config);
			setState(stateCurrent);
			if (!view) {
				var viewCurrent = new EditorView$1({
					state: stateCurrent,
					parent: container,
					root
				});
				setView(viewCurrent);
				onCreateEditor && onCreateEditor(viewCurrent, stateCurrent);
			}
		}
		return () => {
			if (view) {
				setState(void 0);
				setView(void 0);
			}
		};
	}, [container, state]);
	(0, import_react.useEffect)(() => {
		if (props.container) setContainer(props.container);
	}, [props.container]);
	(0, import_react.useEffect)(() => () => {
		if (view) {
			view.destroy();
			setView(void 0);
		}
		if (typingLatch.current) {
			typingLatch.current.cancel();
			typingLatch.current = null;
		}
	}, [view]);
	(0, import_react.useEffect)(() => {
		if (autoFocus && view) view.focus();
	}, [autoFocus, view]);
	(0, import_react.useEffect)(() => {
		if (view) view.dispatch({ effects: StateEffect.reconfigure.of(getExtensions) });
	}, [
		theme,
		extensions,
		height,
		minHeight,
		maxHeight,
		width,
		minWidth,
		maxWidth,
		placeholderStr,
		editable,
		readOnly,
		defaultIndentWithTab,
		defaultBasicSetup,
		onChange,
		onUpdate
	]);
	(0, import_react.useEffect)(() => {
		if (value === void 0) return;
		var currentValue = view ? view.state.doc.toString() : "";
		if (view && value !== currentValue) {
			var isTyping = typingLatch.current && !typingLatch.current.isDone;
			var forceUpdate = () => {
				if (view && value !== view.state.doc.toString()) view.dispatch({
					changes: {
						from: 0,
						to: view.state.doc.toString().length,
						insert: value || ""
					},
					annotations: [ExternalChange.of(true)]
				});
			};
			if (!isTyping) forceUpdate();
			else pendingUpdate.current = forceUpdate;
		}
	}, [value, view]);
	return {
		state,
		setState,
		view,
		setView,
		container,
		setContainer
	};
}
var _excluded = [
	"className",
	"value",
	"selection",
	"extensions",
	"onChange",
	"onStatistics",
	"onCreateEditor",
	"onUpdate",
	"autoFocus",
	"theme",
	"height",
	"minHeight",
	"maxHeight",
	"width",
	"minWidth",
	"maxWidth",
	"basicSetup",
	"placeholder",
	"indentWithTab",
	"editable",
	"readOnly",
	"root",
	"initialState"
];
var ReactCodeMirror = /*#__PURE__*/ (0, import_react.forwardRef)((props, ref) => {
	var { className, value = "", selection, extensions = [], onChange, onStatistics, onCreateEditor, onUpdate, autoFocus, theme = "light", height, minHeight, maxHeight, width, minWidth, maxWidth, basicSetup, placeholder, indentWithTab, editable, readOnly, root, initialState } = props, other = _objectWithoutPropertiesLoose(props, _excluded);
	var editor = (0, import_react.useRef)(null);
	var { state, view, container, setContainer } = useCodeMirror({
		root,
		value,
		autoFocus,
		theme,
		height,
		minHeight,
		maxHeight,
		width,
		minWidth,
		maxWidth,
		basicSetup,
		placeholder,
		indentWithTab,
		editable,
		readOnly,
		selection,
		onChange,
		onStatistics,
		onCreateEditor,
		onUpdate,
		extensions,
		initialState
	});
	(0, import_react.useImperativeHandle)(ref, () => ({
		editor: editor.current,
		state,
		view
	}), [
		editor,
		container,
		state,
		view
	]);
	var setEditorRef = (0, import_react.useCallback)((el) => {
		editor.current = el;
		setContainer(el);
	}, [setContainer]);
	if (typeof value !== "string") throw new Error("value must be typeof string but got " + typeof value);
	var defaultClassNames = typeof theme === "string" ? "cm-theme-" + theme : "cm-theme";
	return /*#__PURE__*/ (0, import_jsx_runtime.jsx)("div", _extends({
		ref: setEditorRef,
		className: "" + defaultClassNames + (className ? " " + className : "")
	}, other));
});
ReactCodeMirror.displayName = "CodeMirror";

export { ExternalChange, ReactCodeMirror };
