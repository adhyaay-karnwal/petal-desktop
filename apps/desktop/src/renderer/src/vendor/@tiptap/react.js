// Reconstructed from index-C74mRL57.js — original module: vendor/@tiptap/react
import { import_jsx_runtime, import_react } from "../@tanstack/react-query.js";
import { import_react_dom } from "../../packages/compiler/src/runtime/runtime.js";
import { import_shim } from "../@radix-ui/react-use-is-hydrated.js";
import { import_with_selector } from "../@base-ui-components/utils.js";
import { Editor } from "./core.js";
import { deepEqual } from "../fast-equals.js";

var mergeRefs = (...refs) => {
	return (node) => {
		refs.forEach((ref) => {
			if (typeof ref === "function") ref(node);
			else if (ref) ref.current = node;
		});
	};
};
var Portals = ({ contentComponent }) => {
	const renderers = (0, import_shim.useSyncExternalStore)(contentComponent.subscribe, contentComponent.getSnapshot, contentComponent.getServerSnapshot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: Object.values(renderers) });
};
function getInstance() {
	const subscribers = /* @__PURE__ */ new Set();
	let renderers = {};
	return {
		/**
		* Subscribe to the editor instance's changes.
		*/
		subscribe(callback) {
			subscribers.add(callback);
			return () => {
				subscribers.delete(callback);
			};
		},
		getSnapshot() {
			return renderers;
		},
		getServerSnapshot() {
			return renderers;
		},
		/**
		* Adds a new NodeView Renderer to the editor.
		*/
		setRenderer(id, renderer) {
			renderers = {
				...renderers,
				[id]: import_react_dom.createPortal(renderer.reactElement, renderer.element, id)
			};
			subscribers.forEach((subscriber) => subscriber());
		},
		/**
		* Removes a NodeView Renderer from the editor.
		*/
		removeRenderer(id) {
			const nextRenderers = { ...renderers };
			delete nextRenderers[id];
			renderers = nextRenderers;
			subscribers.forEach((subscriber) => subscriber());
		}
	};
}
var PureEditorContent = class extends import_react.Component {
	constructor(props) {
		super(props);
		this.editorContentRef = import_react.createRef();
	}
	componentDidMount() {
		this.init();
	}
	componentDidUpdate() {
		this.init();
	}
	init() {
		var _a;
		const editor = this.props.editor;
		if (editor && !editor.isDestroyed && ((_a = editor.view.dom) == null ? void 0 : _a.parentNode)) {
			if (editor.contentComponent) return;
			const element = this.editorContentRef.current;
			element.append(...editor.view.dom.parentNode.childNodes);
			editor.setOptions({ element });
			editor.contentComponent = getInstance();
			editor.createNodeViews();
			editor.isEditorContentInitialized = true;
			this.forceUpdate();
		}
	}
	componentWillUnmount() {
		var _a;
		const editor = this.props.editor;
		if (!editor) return;
		editor.isEditorContentInitialized = false;
		if (!editor.isDestroyed) editor.view.setProps({ nodeViews: {} });
		editor.contentComponent = null;
		try {
			if (!((_a = editor.view.dom) == null ? void 0 : _a.parentNode)) return;
			const newElement = document.createElement("div");
			newElement.append(...editor.view.dom.parentNode.childNodes);
			editor.setOptions({ element: newElement });
		} catch {}
	}
	render() {
		const { editor, innerRef, ...rest } = this.props;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: mergeRefs(innerRef, this.editorContentRef),
			...rest
		}), (editor == null ? void 0 : editor.contentComponent) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portals, { contentComponent: editor.contentComponent })] });
	}
};
var EditorContentWithKey = (0, import_react.forwardRef)((props, ref) => {
	const key = import_react.useMemo(() => {
		return Math.floor(Math.random() * 4294967295).toString();
	}, [props.editor]);
	return import_react.createElement(PureEditorContent, {
		key,
		innerRef: ref,
		...props
	});
});
var EditorContent = import_react.memo(EditorContentWithKey);
var useIsomorphicLayoutEffect$1 = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
var EditorStateManager = class {
	constructor(initialEditor) {
		this.transactionNumber = 0;
		this.lastTransactionNumber = 0;
		this.subscribers = /* @__PURE__ */ new Set();
		this.editor = initialEditor;
		this.lastSnapshot = {
			editor: initialEditor,
			transactionNumber: 0
		};
		this.getSnapshot = this.getSnapshot.bind(this);
		this.getServerSnapshot = this.getServerSnapshot.bind(this);
		this.watch = this.watch.bind(this);
		this.subscribe = this.subscribe.bind(this);
	}
	/**
	* Get the current editor instance.
	*/
	getSnapshot() {
		if (this.transactionNumber === this.lastTransactionNumber) return this.lastSnapshot;
		this.lastTransactionNumber = this.transactionNumber;
		this.lastSnapshot = {
			editor: this.editor,
			transactionNumber: this.transactionNumber
		};
		return this.lastSnapshot;
	}
	/**
	* Always disable the editor on the server-side.
	*/
	getServerSnapshot() {
		return {
			editor: null,
			transactionNumber: 0
		};
	}
	/**
	* Subscribe to the editor instance's changes.
	*/
	subscribe(callback) {
		this.subscribers.add(callback);
		return () => {
			this.subscribers.delete(callback);
		};
	}
	/**
	* Watch the editor instance for changes.
	*/
	watch(nextEditor) {
		this.editor = nextEditor;
		if (this.editor) {
			const fn = () => {
				this.transactionNumber += 1;
				this.subscribers.forEach((callback) => callback());
			};
			const currentEditor = this.editor;
			currentEditor.on("transaction", fn);
			return () => {
				currentEditor.off("transaction", fn);
			};
		}
	}
};
function useEditorState(options) {
	var _a;
	const [editorStateManager] = (0, import_react.useState)(() => new EditorStateManager(options.editor));
	const selectedState = (0, import_with_selector.useSyncExternalStoreWithSelector)(editorStateManager.subscribe, editorStateManager.getSnapshot, editorStateManager.getServerSnapshot, options.selector, (_a = options.equalityFn) != null ? _a : deepEqual);
	useIsomorphicLayoutEffect$1(() => {
		return editorStateManager.watch(options.editor);
	}, [options.editor, editorStateManager]);
	(0, import_react.useDebugValue)(selectedState);
	return selectedState;
}
var isDev = false;
var isSSR = typeof window === "undefined";
var isNext = isSSR || Boolean(typeof window !== "undefined" && window.next);
var EditorInstanceManager = class _EditorInstanceManager {
	constructor(options) {
		/**
		* The current editor instance.
		*/
		this.editor = null;
		/**
		* The subscriptions to notify when the editor instance
		* has been created or destroyed.
		*/
		this.subscriptions = /* @__PURE__ */ new Set();
		/**
		* Whether the editor has been mounted.
		*/
		this.isComponentMounted = false;
		/**
		* The most recent dependencies array.
		*/
		this.previousDeps = null;
		/**
		* The unique instance ID. This is used to identify the editor instance. And will be re-generated for each new instance.
		*/
		this.instanceId = "";
		this.options = options;
		this.subscriptions = /* @__PURE__ */ new Set();
		this.setEditor(this.getInitialEditor());
		this.scheduleDestroy();
		this.getEditor = this.getEditor.bind(this);
		this.getServerSnapshot = this.getServerSnapshot.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.refreshEditorInstance = this.refreshEditorInstance.bind(this);
		this.scheduleDestroy = this.scheduleDestroy.bind(this);
		this.onRender = this.onRender.bind(this);
		this.createEditor = this.createEditor.bind(this);
	}
	setEditor(editor) {
		this.editor = editor;
		this.instanceId = Math.random().toString(36).slice(2, 9);
		this.subscriptions.forEach((cb) => cb());
	}
	getInitialEditor() {
		if (this.options.current.immediatelyRender === void 0) {
			if (isSSR || isNext) {
				if (isDev) throw new Error("Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.");
				return null;
			}
			return this.createEditor();
		}
		if (this.options.current.immediatelyRender && isSSR && isDev) throw new Error("Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.");
		if (this.options.current.immediatelyRender) return this.createEditor();
		return null;
	}
	/**
	* Create a new editor instance. And attach event listeners.
	*/
	createEditor() {
		return new Editor({
			...this.options.current,
			onBeforeCreate: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onBeforeCreate) == null ? void 0 : _b.call(_a, ...args);
			},
			onBlur: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onBlur) == null ? void 0 : _b.call(_a, ...args);
			},
			onCreate: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onCreate) == null ? void 0 : _b.call(_a, ...args);
			},
			onDestroy: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onDestroy) == null ? void 0 : _b.call(_a, ...args);
			},
			onFocus: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onFocus) == null ? void 0 : _b.call(_a, ...args);
			},
			onSelectionUpdate: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onSelectionUpdate) == null ? void 0 : _b.call(_a, ...args);
			},
			onTransaction: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onTransaction) == null ? void 0 : _b.call(_a, ...args);
			},
			onUpdate: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onUpdate) == null ? void 0 : _b.call(_a, ...args);
			},
			onContentError: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onContentError) == null ? void 0 : _b.call(_a, ...args);
			},
			onDrop: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onDrop) == null ? void 0 : _b.call(_a, ...args);
			},
			onPaste: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onPaste) == null ? void 0 : _b.call(_a, ...args);
			},
			onDelete: (...args) => {
				var _a, _b;
				return (_b = (_a = this.options.current).onDelete) == null ? void 0 : _b.call(_a, ...args);
			}
		});
	}
	/**
	* Get the current editor instance.
	*/
	getEditor() {
		return this.editor;
	}
	/**
	* Always disable the editor on the server-side.
	*/
	getServerSnapshot() {
		return null;
	}
	/**
	* Subscribe to the editor instance's changes.
	*/
	subscribe(onStoreChange) {
		this.subscriptions.add(onStoreChange);
		return () => {
			this.subscriptions.delete(onStoreChange);
		};
	}
	static compareOptions(a, b) {
		return Object.keys(a).every((key) => {
			if ([
				"onCreate",
				"onBeforeCreate",
				"onDestroy",
				"onUpdate",
				"onTransaction",
				"onFocus",
				"onBlur",
				"onSelectionUpdate",
				"onContentError",
				"onDrop",
				"onPaste"
			].includes(key)) return true;
			if (key === "extensions" && a.extensions && b.extensions) {
				if (a.extensions.length !== b.extensions.length) return false;
				return a.extensions.every((extension, index) => {
					var _a;
					if (extension !== ((_a = b.extensions) == null ? void 0 : _a[index])) return false;
					return true;
				});
			}
			if (a[key] !== b[key]) return false;
			return true;
		});
	}
	/**
	* On each render, we will create, update, or destroy the editor instance.
	* @param deps The dependencies to watch for changes
	* @returns A cleanup function
	*/
	onRender(deps) {
		return () => {
			this.isComponentMounted = true;
			clearTimeout(this.scheduledDestructionTimeout);
			if (this.editor && !this.editor.isDestroyed && deps.length === 0) {
				if (!_EditorInstanceManager.compareOptions(this.options.current, this.editor.options)) this.editor.setOptions({
					...this.options.current,
					editable: this.editor.isEditable
				});
			} else this.refreshEditorInstance(deps);
			return () => {
				this.isComponentMounted = false;
				this.scheduleDestroy();
			};
		};
	}
	/**
	* Recreate the editor instance if the dependencies have changed.
	*/
	refreshEditorInstance(deps) {
		if (this.editor && !this.editor.isDestroyed) {
			if (this.previousDeps === null) {
				this.previousDeps = deps;
				return;
			}
			if (this.previousDeps.length === deps.length && this.previousDeps.every((dep, index) => dep === deps[index])) return;
		}
		if (this.editor && !this.editor.isDestroyed) this.editor.destroy();
		this.setEditor(this.createEditor());
		this.previousDeps = deps;
	}
	/**
	* Schedule the destruction of the editor instance.
	* This will only destroy the editor if it was not mounted on the next tick.
	* This is to avoid destroying the editor instance when it's actually still mounted.
	*/
	scheduleDestroy() {
		const currentInstanceId = this.instanceId;
		const currentEditor = this.editor;
		this.scheduledDestructionTimeout = setTimeout(() => {
			if (this.isComponentMounted && this.instanceId === currentInstanceId) {
				if (currentEditor) currentEditor.setOptions(this.options.current);
				return;
			}
			if (currentEditor && !currentEditor.isDestroyed) {
				currentEditor.destroy();
				if (this.instanceId === currentInstanceId) this.setEditor(null);
			}
		}, 1);
	}
};
function useEditor(options = {}, deps = []) {
	const mostRecentOptions = (0, import_react.useRef)(options);
	mostRecentOptions.current = options;
	const [instanceManager] = (0, import_react.useState)(() => new EditorInstanceManager(mostRecentOptions));
	const editor = (0, import_shim.useSyncExternalStore)(instanceManager.subscribe, instanceManager.getEditor, instanceManager.getServerSnapshot);
	(0, import_react.useDebugValue)(editor);
	(0, import_react.useEffect)(instanceManager.onRender(deps));
	useEditorState({
		editor,
		selector: ({ transactionNumber }) => {
			if (options.shouldRerenderOnTransaction === false || options.shouldRerenderOnTransaction === void 0) return null;
			if (options.immediatelyRender && transactionNumber === 0) return 0;
			return transactionNumber + 1;
		}
	});
	return editor;
}
var EditorContext = (0, import_react.createContext)({ editor: null });
EditorContext.Consumer;
var ReactNodeViewContext = (0, import_react.createContext)({
	onDragStart: () => {},
	nodeViewContentChildren: void 0,
	nodeViewContentRef: () => {}
});
var useReactNodeView = () => (0, import_react.useContext)(ReactNodeViewContext);
import_react.forwardRef((props, ref) => {
	const { onDragStart } = useReactNodeView();
	const Tag = props.as || "div";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, {
		...props,
		ref,
		"data-node-view-wrapper": "",
		onDragStart,
		style: {
			whiteSpace: "normal",
			...props.style
		}
	});
});
import_react.createContext({ markViewContentRef: () => {} });
var TiptapContext = (0, import_react.createContext)({ get editor() {
	throw new Error("useTiptap must be used within a <Tiptap> provider");
} });
TiptapContext.displayName = "TiptapContext";
var useTiptap = () => (0, import_react.useContext)(TiptapContext);
function TiptapWrapper({ editor, instance, children }) {
	const resolvedEditor = editor != null ? editor : instance;
	if (!resolvedEditor) throw new Error("Tiptap: An editor instance is required. Pass a non-null `editor` prop.");
	const tiptapContextValue = (0, import_react.useMemo)(() => ({ editor: resolvedEditor }), [resolvedEditor]);
	const legacyContextValue = (0, import_react.useMemo)(() => ({ editor: resolvedEditor }), [resolvedEditor]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorContext.Provider, {
		value: legacyContextValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TiptapContext.Provider, {
			value: tiptapContextValue,
			children
		})
	});
}
TiptapWrapper.displayName = "Tiptap";
function TiptapContent({ ...rest }) {
	const { editor } = useTiptap();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorContent, {
		editor,
		...rest
	});
}
TiptapContent.displayName = "Tiptap.Content";
Object.assign(TiptapWrapper, { 
/**
* The Tiptap Content component that renders the EditorContent with the editor instance from the context.
* @see TiptapContent
*/
Content: TiptapContent });

export { EditorContent, useEditor };
