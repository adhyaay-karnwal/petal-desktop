// Reconstructed from index-C74mRL57.js — original module: vendor/bippy
import { _$2, d$2, h$3 } from "../packages/editor/src/shared/utils/captureElementImage.js";

/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
_$2();
var x$3 = (e) => {
	/**
	* @license bippy
	*
	* Copyright (c) Aiden Bai
	*
	* This source code is licensed under the MIT license found in the
	* LICENSE file in the root directory of this source tree.
	*/
	switch (e.tag) {
		case 5:
		case 26:
		case 27: return !0;
		default: return typeof e.type == `string`;
	}
};
var ve$2 = (e) => {
	switch (e.tag) {
		case 1:
		case 11:
		case 0:
		case 14:
		case 15: return !0;
		default: return !1;
	}
};
var be$2 = (e, t) => e === t || e.alternate === t || t.alternate === e;
function j$2(e, t, n = !1) {
	if (!e) return null;
	let r = t(e);
	if (r instanceof Promise) return (async () => {
		if (await r === !0) return e;
		let i = n ? e.return : e.child;
		for (; i;) {
			let e = await N$2(i, t, n);
			if (e) return e;
			i = n ? null : i.sibling;
		}
		return null;
	})();
	if (r === !0) return e;
	let i = n ? e.return : e.child;
	for (; i;) {
		let e = M$2(i, t, n);
		if (e) return e;
		i = n ? null : i.sibling;
	}
	return null;
}
var M$2 = (e, t, n = !1) => {
	if (!e) return null;
	if (t(e) === !0) return e;
	let r = n ? e.return : e.child;
	for (; r;) {
		let e = M$2(r, t, n);
		if (e) return e;
		r = n ? null : r.sibling;
	}
	return null;
};
var N$2 = async (e, t, n = !1) => {
	if (!e) return null;
	if (await t(e) === !0) return e;
	let r = n ? e.return : e.child;
	for (; r;) {
		let e = await N$2(r, t, n);
		if (e) return e;
		r = n ? null : r.sibling;
	}
	return null;
};
var P$2 = (e) => {
	let t = e;
	return typeof t == `function` ? t : typeof t == `object` && t ? P$2(t.type || t.render) : null;
};
var we$2 = (e) => {
	let t = e;
	if (typeof t == `string`) return t;
	if (typeof t != `function` && !(typeof t == `object` && t)) return null;
	let n = t.displayName || t.name || null;
	if (n) return n;
	let r = P$2(t);
	return r && (r.displayName || r.name) || null;
};
var Z$2 = (e) => {
	let t = globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__;
	if (t?.renderers) for (let n of t.renderers.values()) try {
		let t = n.findFiberByHostInstance?.(e);
		if (t) return t;
	} catch {}
	if (typeof e == `object` && e) {
		if (`_reactRootContainer` in e) return e._reactRootContainer?._internalRoot?.current?.child;
		for (let t in e) if (t.startsWith(`__reactContainer$`) || t.startsWith(`__reactInternalInstance$`) || t.startsWith(`__reactFiber`)) return e[t] || null;
	}
	return null;
};
/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
/**
* @license bippy
*
* Copyright (c) Aiden Bai
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var i$3 = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
var a$1 = [
	`rsc://`,
	`file:///`,
	`webpack-internal://`,
	`webpack://`,
	`node:`,
	`turbopack://`,
	`metro://`,
	`/app-pages-browser/`,
	`/(app-pages-browser)/`
];
var o$1 = [
	`<anonymous>`,
	`eval`,
	``
];
var s$1 = /\.(jsx|tsx|ts|js)$/;
var c$2 = /(\.min|bundle|chunk|vendor|vendors|runtime|polyfill|polyfills)\.(js|mjs|cjs)$|(chunk|bundle|vendor|vendors|runtime|polyfill|polyfills|framework|app|main|index)[-_.][A-Za-z0-9_-]{4,}\.(js|mjs|cjs)$|[\da-f]{8,}\.(js|mjs|cjs)$|[-_.][\da-f]{20,}\.(js|mjs|cjs)$|\/dist\/|\/build\/|\/.next\/|\/out\/|\/node_modules\/|\.webpack\.|\.vite\.|\.turbopack\./i;
var l$1 = /^\?[\w~.-]+(?:=[^&#]*)?(?:&[\w~.-]+(?:=[^&#]*)?)*$/;
var u$1 = /(^|@)\S+:\d+/;
var d$1 = /^\s*at .*(\S+:\d+|\(native\))/m;
var f$1 = /^(eval@)?(\[native code\])?$/;
var m$1 = (e, t) => {
	if (t?.includeInElement !== !1) {
		let n = e.split(`
`), r = [];
		for (let e of n) if (/^\s*at\s+/.test(e)) {
			let t = _$1(e, void 0)[0];
			t && r.push(t);
		} else if (/^\s*in\s+/.test(e)) {
			let t = e.replace(/^\s*in\s+/, ``).replace(/\s*\(at .*\)$/, ``);
			r.push({
				functionName: t,
				source: e
			});
		} else if (e.match(u$1)) {
			let t = v$1(e, void 0)[0];
			t && r.push(t);
		}
		return g$1(r, t);
	}
	return e.match(d$1) ? _$1(e, t) : v$1(e, t);
};
var h$2 = (e) => {
	if (!e.includes(`:`)) return [
		e,
		void 0,
		void 0
	];
	let t = e.startsWith(`(`) && /:\d+\)$/.test(e) ? e.slice(1, -1) : e, n = /(.+?)(?::(\d+))?(?::(\d+))?$/.exec(t);
	return n ? [
		n[1],
		n[2] || void 0,
		n[3] || void 0
	] : [
		t,
		void 0,
		void 0
	];
};
var g$1 = (e, t) => t && t.slice != null ? Array.isArray(t.slice) ? e.slice(t.slice[0], t.slice[1]) : e.slice(0, t.slice) : e;
var _$1 = (e, t) => g$1(e.split(`
`).filter((e) => !!e.match(d$1)), t).map((e) => {
	let t = e;
	t.includes(`(eval `) && (t = t.replace(/eval code/g, `eval`).replace(/(\(eval at [^()]*)|(,.*$)/g, ``));
	let n = t.replace(/^\s+/, ``).replace(/\(eval code/g, `(`).replace(/^.*?\s+/, ``), r = n.match(/ (\(.+\)$)/);
	n = r ? n.replace(r[0], ``) : n;
	let i = h$2(r ? r[1] : n);
	return {
		functionName: r && n || void 0,
		fileName: [`eval`, `<anonymous>`].includes(i[0]) ? void 0 : i[0],
		lineNumber: i[1] ? +i[1] : void 0,
		columnNumber: i[2] ? +i[2] : void 0,
		source: t
	};
});
var v$1 = (e, t) => g$1(e.split(`
`).filter((e) => !e.match(f$1)), t).map((e) => {
	let t = e;
	if (t.includes(` > eval`) && (t = t.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, `:$1`)), !t.includes(`@`) && !t.includes(`:`)) return { functionName: t };
	{
		let e = /(([^\n\r"\u2028\u2029]*".[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*(?:@[^\n\r"\u2028\u2029]*"[^\n\r@\u2028\u2029]*)*(?:[\n\r\u2028\u2029][^@]*)?)?[^@]*)@/, n = t.match(e), r = n && n[1] ? n[1] : void 0, i = h$2(t.replace(e, ``));
		return {
			functionName: r,
			fileName: i[0],
			lineNumber: i[1] ? +i[1] : void 0,
			columnNumber: i[2] ? +i[2] : void 0,
			source: t
		};
	}
});
var ie$4 = 44;
var ae$1 = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`;
var oe$1 = /* @__PURE__ */ new Uint8Array(64);
var se$1 = /* @__PURE__ */ new Uint8Array(128);
for (let e = 0; e < ae$1.length; e++) {
	let t = ae$1.charCodeAt(e);
	oe$1[e] = t, se$1[t] = e;
}
function x$2(e, t) {
	let n = 0, r = 0, i = 0;
	do
		i = se$1[e.next()], n |= (i & 31) << r, r += 5;
	while (i & 32);
	let a = n & 1;
	return n >>>= 1, a && (n = -2147483648 | -n), t + n;
}
function ce$1(e, t) {
	return e.pos >= t ? !1 : e.peek() !== ie$4;
}
var le$1 = class {
	constructor(e) {
		this.pos = 0, this.buffer = e;
	}
	next() {
		return this.buffer.charCodeAt(this.pos++);
	}
	peek() {
		return this.buffer.charCodeAt(this.pos);
	}
	indexOf(e) {
		let { buffer: t, pos: n } = this, r = t.indexOf(e, n);
		return r === -1 ? t.length : r;
	}
};
function ue$1(e) {
	let { length: t } = e, n = new le$1(e), r = [], i = 0, a = 0, o = 0, s = 0, c = 0;
	do {
		let e = n.indexOf(`;`), t = [], l = !0, u = 0;
		for (i = 0; n.pos < e;) {
			let r;
			i = x$2(n, i), i < u && (l = !1), u = i, ce$1(n, e) ? (a = x$2(n, a), o = x$2(n, o), s = x$2(n, s), ce$1(n, e) ? (c = x$2(n, c), r = [
				i,
				a,
				o,
				s,
				c
			]) : r = [
				i,
				a,
				o,
				s
			]) : r = [i], t.push(r), n.pos++;
		}
		l || de$1(t), r.push(t), n.pos = e + 1;
	} while (n.pos <= t);
	return r;
}
function de$1(e) {
	e.sort(fe$1);
}
function fe$1(e, t) {
	return e[0] - t[0];
}
var pe$1 = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
var me$1 = /^data:application\/json[^,]+base64,/;
var he$1 = /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^*]+?)[ \t]*(?:\*\/)[ \t]*$)/;
var S$2 = typeof WeakRef < `u`;
var C$2 = /* @__PURE__ */ new Map();
var w$1 = /* @__PURE__ */ new Map();
var ge$1 = (e) => S$2 && e instanceof WeakRef;
var _e$1 = (e, t, n, r) => {
	if (n < 0 || n >= e.length) return null;
	let i = e[n];
	if (!i || i.length === 0) return null;
	let a = null;
	for (let e of i) if (e[0] <= r) a = e;
	else break;
	if (!a || a.length < 4) return null;
	let [, o, s, c] = a;
	if (o === void 0 || s === void 0 || c === void 0) return null;
	let l = t[o];
	return l ? {
		columnNumber: c,
		fileName: l,
		lineNumber: s + 1
	} : null;
};
var T$1 = (e, t, n) => {
	if (e.sections) {
		let r = null;
		for (let i of e.sections) if (t > i.offset.line || t === i.offset.line && n >= i.offset.column) r = i;
		else break;
		if (!r) return null;
		let i = t - r.offset.line, a = t === r.offset.line ? n - r.offset.column : n;
		return _e$1(r.map.mappings, r.map.sources, i, a);
	}
	return _e$1(e.mappings, e.sources, t - 1, n);
};
var ve$1 = (e, t) => {
	let n = t.split(`
`), r;
	for (let e = n.length - 1; e >= 0 && !r; e--) {
		let t = n[e].match(he$1);
		t && (r = t[1] || t[2]);
	}
	if (!r) return null;
	let i = pe$1.test(r);
	if (!(me$1.test(r) || i || r.startsWith(`/`))) {
		let t = e.split(`/`);
		t[t.length - 1] = r, r = t.join(`/`);
	}
	return r;
};
var ye$1 = (e) => ({
	file: e.file,
	mappings: ue$1(e.mappings),
	names: e.names,
	sourceRoot: e.sourceRoot,
	sources: e.sources,
	sourcesContent: e.sourcesContent,
	version: 3
});
var be$1 = (e) => {
	let t = e.sections.map(({ map: e, offset: t }) => ({
		map: {
			...e,
			mappings: ue$1(e.mappings)
		},
		offset: t
	})), n = /* @__PURE__ */ new Set();
	for (let e of t) for (let t of e.map.sources) n.add(t);
	return {
		file: e.file,
		mappings: [],
		names: [],
		sections: t,
		sourceRoot: void 0,
		sources: Array.from(n),
		sourcesContent: void 0,
		version: 3
	};
};
var E$1 = (e) => {
	if (!e) return !1;
	let t = e.trim();
	if (!t) return !1;
	let n = t.match(pe$1);
	if (!n) return !0;
	let r = n[0].toLowerCase();
	return r === `http:` || r === `https:`;
};
var D$1 = async (e, t = fetch) => {
	if (!E$1(e)) return null;
	let n;
	try {
		let r = await t(e);
		if (!r.ok) return null;
		n = await r.text();
	} catch {
		return null;
	}
	if (!n) return null;
	let r = ve$1(e, n);
	if (!r || !E$1(r)) return null;
	try {
		let e = await t(r);
		if (!e.ok) return null;
		let n = await e.json();
		return `sections` in n ? be$1(n) : ye$1(n);
	} catch {
		return null;
	}
};
var O$1 = async (e, t = !0, n) => {
	if (t && C$2.has(e)) {
		let t = C$2.get(e);
		if (t == null) return null;
		if (ge$1(t)) {
			let n = t.deref();
			if (n) return n;
			C$2.delete(e);
		} else return t;
	}
	if (t && w$1.has(e)) return w$1.get(e);
	let r = D$1(e, n);
	t && w$1.set(e, r);
	let i = await r;
	return t && w$1.delete(e), t && (i === null ? C$2.set(e, null) : C$2.set(e, S$2 ? new WeakRef(i) : i)), i;
};
var xe$1 = async (e, t = !0, n) => await Promise.all(e.map(async (e) => {
	if (!e.fileName) return e;
	let r = await O$1(e.fileName, t, n);
	if (!r || typeof e.lineNumber != `number` || typeof e.columnNumber != `number`) return e;
	let i = T$1(r, e.lineNumber, e.columnNumber);
	return i ? {
		...e,
		source: i.fileName && e.source ? e.source.replace(e.fileName, i.fileName) : e.source,
		fileName: i.fileName,
		lineNumber: i.lineNumber,
		columnNumber: i.columnNumber,
		isSymbolicated: !0
	} : e;
}));
var Se$1 = (e) => e._debugStack instanceof Error && typeof e._debugStack?.stack == `string`;
var Ce$1 = () => {
	let n = h$3();
	for (let t of [...Array.from(d$2), ...Array.from(n.renderers.values())]) {
		let e = t.currentDispatcherRef;
		if (e && typeof e == `object`) return `H` in e ? e.H : e.current;
	}
	return null;
};
var k$1 = (t) => {
	for (let n of d$2) {
		let e = n.currentDispatcherRef;
		e && typeof e == `object` && (`H` in e ? e.H = t : e.current = t);
	}
};
var A$1 = (e) => `\n    in ${e}`;
var j$1 = (e, t) => {
	let n = A$1(e);
	return t && (n += ` (at ${t})`), n;
};
var M$1 = !1;
var N$1 = (e, t) => {
	if (!e || M$1) return ``;
	let r = Error.prepareStackTrace;
	Error.prepareStackTrace = void 0, M$1 = !0;
	let i = Ce$1();
	k$1(null);
	let a = console.error, o = console.warn;
	console.error = () => {}, console.warn = () => {};
	try {
		let r = { DetermineComponentFrameRoot() {
			let n;
			try {
				if (t) {
					let t = function() {
						throw Error();
					};
					if (Object.defineProperty(t.prototype, `props`, { set: function() {
						throw Error();
					} }), typeof Reflect == `object` && Reflect.construct) {
						try {
							Reflect.construct(t, []);
						} catch (e) {
							n = e;
						}
						Reflect.construct(e, [], t);
					} else {
						try {
							t.call();
						} catch (e) {
							n = e;
						}
						e.call(t.prototype);
					}
				} else {
					try {
						throw Error();
					} catch (e) {
						n = e;
					}
					let t = e();
					t && typeof t.catch == `function` && t.catch(() => {});
				}
			} catch (e) {
				if (e instanceof Error && n instanceof Error && typeof e.stack == `string`) return [e.stack, n.stack];
			}
			return [null, null];
		} };
		r.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`, Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, `name`)?.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, `name`, { value: `DetermineComponentFrameRoot` });
		let [i, a] = r.DetermineComponentFrameRoot();
		if (i && a) {
			let t = i.split(`
`), r = a.split(`
`), o = 0, s = 0;
			for (; o < t.length && !t[o].includes(`DetermineComponentFrameRoot`);) o++;
			for (; s < r.length && !r[s].includes(`DetermineComponentFrameRoot`);) s++;
			if (o === t.length || s === r.length) for (o = t.length - 1, s = r.length - 1; o >= 1 && s >= 0 && t[o] !== r[s];) s--;
			for (; o >= 1 && s >= 0; o--, s--) if (t[o] !== r[s]) {
				if (o !== 1 || s !== 1) do
					if (o--, s--, s < 0 || t[o] !== r[s]) {
						let r = `\n${t[o].replace(` at new `, ` at `)}`, i = we$2(e);
						return i && r.includes(`<anonymous>`) && (r = r.replace(`<anonymous>`, i)), r;
					}
				while (o >= 1 && s >= 0);
				break;
			}
		}
	} finally {
		M$1 = !1, Error.prepareStackTrace = r, k$1(i), console.error = a, console.warn = o;
	}
	let s = e ? we$2(e) : ``;
	return s ? A$1(s) : ``;
};
var P$1 = (e, t) => {
	let n = e.tag, r = ``;
	switch (n) {
		case 28:
			r = A$1(`Activity`);
			break;
		case 1:
			r = N$1(e.type, !0);
			break;
		case 11:
			r = N$1(e.type.render, !1);
			break;
		case 0:
		case 15:
			r = N$1(e.type, !1);
			break;
		case 5:
		case 26:
		case 27:
			r = A$1(e.type);
			break;
		case 16:
			r = A$1(`Lazy`);
			break;
		case 13:
			r = e.child !== t && t !== null ? A$1(`Suspense Fallback`) : A$1(`Suspense`);
			break;
		case 19:
			r = A$1(`SuspenseList`);
			break;
		case 30:
			r = A$1(`ViewTransition`);
			break;
		default: return ``;
	}
	return r;
};
var F$1 = (e) => {
	try {
		let t = ``, n = e, r = null;
		do {
			t += P$1(n, r);
			let e = n._debugInfo;
			if (e && Array.isArray(e)) for (let n = e.length - 1; n >= 0; n--) {
				let r = e[n];
				typeof r.name == `string` && (t += j$1(r.name, r.env));
			}
			r = n, n = n.return;
		} while (n);
		return t;
	} catch (e) {
		return e instanceof Error ? `\nError generating stack: ${e.message}\n${e.stack}` : ``;
	}
};
var I$1 = (e) => {
	let t = Error.prepareStackTrace;
	Error.prepareStackTrace = void 0;
	let n = e;
	if (!n) return ``;
	Error.prepareStackTrace = t, n.startsWith(`Error: react-stack-top-frame
`) && (n = n.slice(29));
	let r = n.indexOf(`
`);
	if (r !== -1 && (n = n.slice(r + 1)), r = Math.max(n.indexOf(`react_stack_bottom_frame`), n.indexOf(`react-stack-bottom-frame`)), r !== -1 && (r = n.lastIndexOf(`
`, r)), r !== -1) n = n.slice(0, r);
	else return ``;
	return n;
};
var we$1 = (e) => !!(e.fileName?.startsWith(`rsc://`) && e.functionName);
var Te$1 = (e, t) => e.fileName === t.fileName && e.lineNumber === t.lineNumber && e.columnNumber === t.columnNumber;
var Ee$1 = (e) => {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) for (let e of n.stackFrames) {
		if (!we$1(e)) continue;
		let n = e.functionName, r = t.get(n) ?? [];
		r.some((t) => Te$1(t, e)) || (r.push(e), t.set(n, r));
	}
	return t;
};
var De$1 = (e, t, n) => {
	if (!e.functionName) return {
		...e,
		isServer: !0
	};
	let r = t.get(e.functionName);
	if (!r || r.length === 0) return {
		...e,
		isServer: !0
	};
	let i = n.get(e.functionName) ?? 0, a = r[i % r.length];
	return n.set(e.functionName, i + 1), {
		...e,
		isServer: !0,
		fileName: a.fileName,
		lineNumber: a.lineNumber,
		columnNumber: a.columnNumber,
		source: e.source?.replace(`(at Server)`, `(${a.fileName}:${a.lineNumber}:${a.columnNumber})`)
	};
};
var Oe$1 = (e) => {
	let t = [];
	return j$2(e, (e) => {
		if (!Se$1(e)) return;
		let r = typeof e.type == `string` ? e.type : we$2(e.type) || `<anonymous>`;
		t.push({
			componentName: r,
			stackFrames: m$1(I$1(e._debugStack?.stack))
		});
	}, !0), t;
};
var L$1 = async (e, t = !0, n) => {
	let r = Oe$1(e), i = m$1(F$1(e)), a = Ee$1(r), o = /* @__PURE__ */ new Map();
	return xe$1(i.map((e) => e.source?.includes(`(at Server)`) ?? !1 ? De$1(e, a, o) : e).filter((e, t, n) => {
		if (t === 0) return !0;
		let r = n[t - 1];
		return e.functionName !== r.functionName;
	}), t, n);
};
var R$1 = (e) => {
	let t = e._debugSource;
	return t ? typeof t == `object` && !!t && `fileName` in t && typeof t.fileName == `string` && `lineNumber` in t && typeof t.lineNumber == `number` : !1;
};
var ke$1 = async (e, t = !0, n) => {
	if (R$1(e)) return e._debugSource || null;
	let r = await L$1(e, t, n);
	for (let e of r) if (e.fileName) return {
		fileName: e.fileName,
		lineNumber: e.lineNumber,
		columnNumber: e.columnNumber,
		functionName: e.functionName
	};
	return null;
};
var z$2 = (e) => e.split(`/`).filter(Boolean).length;
var Ae$1 = (e) => e.split(`/`).filter(Boolean)[0] ?? null;
var je$1 = (e) => {
	let t = e.indexOf(`/`, 1);
	if (t === -1 || z$2(e.slice(0, t)) !== 1) return e;
	let n = e.slice(t);
	if (!s$1.test(n) || z$2(n) < 2) return e;
	let r = Ae$1(n);
	return !r || r.startsWith(`@`) || r.length > 4 ? e : n;
};
var Me$1 = (e) => {
	if (!e || o$1.some((t) => t === e)) return ``;
	let t = e, n = t.startsWith(`http://`) || t.startsWith(`https://`);
	if (n) try {
		t = new URL(t).pathname;
	} catch {}
	if (n && (t = je$1(t)), t.startsWith(`about://React/`)) {
		let e = t.slice(14), n = e.indexOf(`/`), r = e.indexOf(`:`);
		t = n !== -1 && (r === -1 || n < r) ? e.slice(n + 1) : e;
	}
	let r = !0;
	for (; r;) {
		r = !1;
		for (let e of a$1) if (t.startsWith(e)) {
			t = t.slice(e.length), e === `file:///` && (t = `/${t.replace(/^\/+/, ``)}`), r = !0;
			break;
		}
	}
	if (i$3.test(t)) {
		let e = t.match(i$3);
		e && (t = t.slice(e[0].length));
	}
	if (t.startsWith(`//`)) {
		let e = t.indexOf(`/`, 2);
		t = e === -1 ? `` : t.slice(e);
	}
	let s = t.indexOf(`?`);
	if (s !== -1) {
		let e = t.slice(s);
		l$1.test(e) && (t = t.slice(0, s));
	}
	return t;
};
var Ne$1 = (e) => {
	let t = Me$1(e);
	return !(!t || !s$1.test(t) || c$2.test(t));
};
var Ie$1 = Symbol.for(`react.context`);
var Le$1 = Symbol.for(`react.memo_cache_sentinel`);
var B$1 = [];
var H$1 = null;
var U$1 = null;
var W$1 = null;
var G$1 = 0;
var K$1 = null;
var q$1 = Error("Suspense Exception: This is not a real error! It's an implementation detail of `use` to interrupt the current render.");
var Y$1 = () => {
	let e = U$1;
	return e !== null && (U$1 = e.next), e;
};
var X$2 = (e) => {
	if (H$1 === null) return e._currentValue;
	if (W$1 === null) throw Error(`Context reads do not line up with context dependencies.`);
	if (Object.prototype.hasOwnProperty.call(W$1, `memoizedValue`)) {
		let e = W$1.memoizedValue;
		return W$1 = W$1.next, e;
	}
	return e._currentValue;
};
var Z$1 = (e, t, n, r = null) => {
	B$1.push({
		displayName: r,
		primitive: e,
		stackError: Error(),
		value: t,
		dispatcherHookName: n
	});
};
var Ve$1 = (e) => {
	if (typeof e == `object` && e) {
		let t = e;
		if (typeof t.then == `function`) {
			let e = K$1 !== null && G$1 < K$1.length ? K$1[G$1++] : t;
			switch (e.status) {
				case `fulfilled`: return Z$1(`Promise`, e.value, `Use`), e.value;
				case `rejected`: throw e.reason;
			}
			throw Z$1(`Unresolved`, e, `Use`), q$1;
		}
		if (t.$$typeof === Ie$1 && `_currentValue` in t) {
			let e = t, n = X$2(e);
			return Z$1(`Context (use)`, n, `Use`, e.displayName || `Context`), n;
		}
	}
	throw Error(`An unsupported type was passed to use(): ` + String(e));
};
var He$1 = (e) => {
	let t = X$2(e);
	return Z$1(`Context`, t, `Context`, e.displayName || null), t;
};
var Ue$1 = (e) => {
	let t = Y$1(), n = t === null ? typeof e == `function` ? e() : e : t.memoizedState;
	return Z$1(`State`, n, `State`), [n, () => {}];
};
var We$1 = (e, t, n) => {
	let r = Y$1(), i = r === null ? n === void 0 ? t : n(t) : r.memoizedState;
	return Z$1(`Reducer`, i, `Reducer`), [i, () => {}];
};
var Ge$1 = (e) => {
	let t = Y$1(), n = t === null ? { current: e } : t.memoizedState;
	return Z$1(`Ref`, n.current, `Ref`), n;
};
var Ke$1 = () => {
	let e = Y$1();
	return Z$1(`CacheRefresh`, e === null ? () => {} : e.memoizedState, `CacheRefresh`), () => {};
};
var qe$1 = (e) => {
	Y$1(), Z$1(`LayoutEffect`, e, `LayoutEffect`);
};
var Je$1 = (e) => {
	Y$1(), Z$1(`InsertionEffect`, e, `InsertionEffect`);
};
var Ye$1 = (e) => {
	Y$1(), Z$1(`Effect`, e, `Effect`);
};
var Xe$1 = (e) => {
	Y$1();
	let t;
	typeof e == `object` && e && `current` in e && (t = e.current), Z$1(`ImperativeHandle`, t, `ImperativeHandle`);
};
var Ze$1 = (e, t) => {
	Z$1(`DebugValue`, typeof t == `function` ? t(e) : e, `DebugValue`);
};
var Qe$1 = (e) => {
	let t = Y$1();
	return Z$1(`Callback`, t === null ? e : t.memoizedState[0], `Callback`), e;
};
var $e$1 = (e) => {
	let t = Y$1(), n = t === null ? e() : t.memoizedState[0];
	return Z$1(`Memo`, n, `Memo`), n;
};
var et$2 = (e, t) => {
	let n = Y$1();
	Y$1();
	let r = n === null ? t() : n.memoizedState;
	return Z$1(`SyncExternalStore`, r, `SyncExternalStore`), r;
};
var tt$2 = () => {
	let e = Y$1();
	Y$1();
	let t = e === null ? !1 : e.memoizedState;
	return Z$1(`Transition`, t, `Transition`), [t, () => {}];
};
var nt$1 = (e) => {
	let t = Y$1(), n = t === null ? e : t.memoizedState;
	return Z$1(`DeferredValue`, n, `DeferredValue`), n;
};
var rt$1 = () => {
	let e = Y$1(), t = e === null ? `` : e.memoizedState;
	return Z$1(`Id`, t, `Id`), t;
};
var it$1 = (e) => {
	let t = H$1;
	if (t == null) return [];
	let n = t.updateQueue?.memoCache;
	if (n == null) return [];
	let r = n.data[n.index];
	return r === void 0 && (r = n.data[n.index] = Array.from({ length: e }, () => Le$1)), n.index++, r;
};
var at$1 = (e) => {
	let t = Y$1(), n = t === null ? e : t.memoizedState;
	return Z$1(`Optimistic`, n, `Optimistic`), [n, () => {}];
};
var ot$1 = (e, t) => {
	let n, r = null;
	if (e !== null) {
		let t = e.memoizedState;
		if (typeof t == `object` && t && `then` in t && typeof t.then == `function`) {
			let e = t;
			switch (e.status) {
				case `fulfilled`:
					n = e.value;
					break;
				case `rejected`:
					r = e.reason;
					break;
				default: r = q$1, n = e;
			}
		} else n = t;
	} else n = t;
	return {
		value: n,
		error: r
	};
};
var st$1 = (e) => (t, n) => {
	let r = Y$1();
	Y$1(), Y$1();
	let i = Error(), { value: a, error: o } = ot$1(r, n);
	if (B$1.push({
		displayName: null,
		primitive: e,
		stackError: i,
		value: a,
		dispatcherHookName: e
	}), o !== null) throw o;
	return [
		a,
		() => {},
		!1
	];
};
var ct$1 = st$1(`ActionState`);
var Q$1 = {
	readContext: X$2,
	use: Ve$1,
	useCallback: Qe$1,
	useContext: He$1,
	useEffect: Ye$1,
	useImperativeHandle: Xe$1,
	useLayoutEffect: qe$1,
	useInsertionEffect: Je$1,
	useMemo: $e$1,
	useReducer: We$1,
	useRef: Ge$1,
	useState: Ue$1,
	useDebugValue: Ze$1,
	useDeferredValue: nt$1,
	useTransition: tt$2,
	useSyncExternalStore: et$2,
	useId: rt$1,
	useHostTransitionStatus: () => {
		let e = X$2({ _currentValue: null });
		return Z$1(`HostTransitionStatus`, e, `HostTransitionStatus`), e;
	},
	useFormState: st$1(`FormState`),
	useActionState: ct$1,
	useOptimistic: at$1,
	useMemoCache: it$1,
	useCacheRefresh: Ke$1,
	useEffectEvent: (e) => (Y$1(), Z$1(`EffectEvent`, e, `EffectEvent`), e)
};
typeof Proxy > `u` || new Proxy(Q$1, { get(e, t) {
	if (Object.prototype.hasOwnProperty.call(e, t)) return e[t];
	let n = Error(`Missing method in Dispatcher: ` + t);
	throw n.name = `ReactDebugToolsUnsupportedHookError`, n;
} });

export { F$1, L$1, Me$1, Ne$1, O$1, Se$1, Z$2, be$2, ke$1, m$1, ve$2, we$2, x$3, xe$1 };
