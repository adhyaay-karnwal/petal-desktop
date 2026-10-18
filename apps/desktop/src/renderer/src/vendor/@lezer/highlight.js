// Reconstructed from index-C74mRL57.js — original module: vendor/@lezer/highlight
import { NodeProp$1 } from "./common.js";

var nextTagID = 0;
/**
Highlighting tags are markers that denote a highlighting category.
They are [associated](#highlight.styleTags) with parts of a syntax
tree by a language mode, and then mapped to an actual CSS style by
a [highlighter](#highlight.Highlighter).

Because syntax tree node types and highlight styles have to be
able to talk the same language, CodeMirror uses a mostly _closed_
[vocabulary](#highlight.tags) of syntax tags (as opposed to
traditional open string-based systems, which make it hard for
highlighting themes to cover all the tokens produced by the
various languages).

It _is_ possible to [define](#highlight.Tag^define) your own
highlighting tags for system-internal use (where you control both
the language package and the highlighter), but such tags will not
be picked up by regular highlighters (though you can derive them
from standard tags to allow highlighters to fall back to those).
*/
var Tag = class Tag {
	/**
	@internal
	*/
	constructor(name, set, base, modified) {
		this.name = name;
		this.set = set;
		this.base = base;
		this.modified = modified;
		/**
		@internal
		*/
		this.id = nextTagID++;
	}
	toString() {
		let { name } = this;
		for (let mod of this.modified) if (mod.name) name = `${mod.name}(${name})`;
		return name;
	}
	static define(nameOrParent, parent) {
		let name = typeof nameOrParent == "string" ? nameOrParent : "?";
		if (nameOrParent instanceof Tag) parent = nameOrParent;
		if (parent === null || parent === void 0 ? void 0 : parent.base) throw new Error("Can not derive from a modified tag");
		let tag = new Tag(name, [], null, []);
		tag.set.push(tag);
		if (parent) for (let t of parent.set) tag.set.push(t);
		return tag;
	}
	/**
	Define a tag _modifier_, which is a function that, given a tag,
	will return a tag that is a subtag of the original. Applying the
	same modifier to a twice tag will return the same value (`m1(t1)
	== m1(t1)`) and applying multiple modifiers will, regardless or
	order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
	
	When multiple modifiers are applied to a given base tag, each
	smaller set of modifiers is registered as a parent, so that for
	example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
	`m1(m3(t1)`, and so on.
	*/
	static defineModifier(name) {
		let mod = new Modifier(name);
		return (tag) => {
			if (tag.modified.indexOf(mod) > -1) return tag;
			return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
		};
	}
};
var nextModifierID = 0;
var Modifier = class Modifier {
	constructor(name) {
		this.name = name;
		this.instances = [];
		this.id = nextModifierID++;
	}
	static get(base, mods) {
		if (!mods.length) return base;
		let exists = mods[0].instances.find((t) => t.base == base && sameArray$1(mods, t.modified));
		if (exists) return exists;
		let set = [], tag = new Tag(base.name, set, base, mods);
		for (let m of mods) m.instances.push(tag);
		let configs = powerSet(mods);
		for (let parent of base.set) if (!parent.modified.length) for (let config of configs) set.push(Modifier.get(parent, config));
		return tag;
	}
};
function sameArray$1(a, b) {
	return a.length == b.length && a.every((x, i) => x == b[i]);
}
function powerSet(array) {
	let sets = [[]];
	for (let i = 0; i < array.length; i++) for (let j = 0, e = sets.length; j < e; j++) sets.push(sets[j].concat(array[i]));
	return sets.sort((a, b) => b.length - a.length);
}
/**
This function is used to add a set of tags to a language syntax
via [`NodeSet.extend`](#common.NodeSet.extend) or
[`LRParser.configure`](#lr.LRParser.configure).

The argument object maps node selectors to [highlighting
tags](#highlight.Tag) or arrays of tags.

Node selectors may hold one or more (space-separated) node paths.
Such a path can be a [node name](#common.NodeType.name), or
multiple node names (or `*` wildcards) separated by slash
characters, as in `"Block/Declaration/VariableName"`. Such a path
matches the final node but only if its direct parent nodes are the
other nodes mentioned. A `*` in such a path matches any parent,
but only a single level—wildcards that match multiple parents
aren't supported, both for efficiency reasons and because Lezer
trees make it rather hard to reason about what they would match.)

A path can be ended with `/...` to indicate that the tag assigned
to the node should also apply to all child nodes, even if they
match their own style (by default, only the innermost style is
used).

When a path ends in `!`, as in `Attribute!`, no further matching
happens for the node's child nodes, and the entire node gets the
given style.

In this notation, node names that contain `/`, `!`, `*`, or `...`
must be quoted as JSON strings.

For example:

```javascript
parser.configure({props: [
styleTags({
// Style Number and BigNumber nodes
"Number BigNumber": tags.number,
// Style Escape nodes whose parent is String
"String/Escape": tags.escape,
// Style anything inside Attributes nodes
"Attributes!": tags.meta,
// Add a style to all content inside Italic nodes
"Italic/...": tags.emphasis,
// Style InvalidString nodes as both `string` and `invalid`
"InvalidString": [tags.string, tags.invalid],
// Style the node named "/" as punctuation
'"/"': tags.punctuation
})
]})
```
*/
function styleTags(spec) {
	let byName = Object.create(null);
	for (let prop in spec) {
		let tags = spec[prop];
		if (!Array.isArray(tags)) tags = [tags];
		for (let part of prop.split(" ")) if (part) {
			let pieces = [], mode = 2, rest = part;
			for (let pos = 0;;) {
				if (rest == "..." && pos > 0 && pos + 3 == part.length) {
					mode = 1;
					break;
				}
				let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
				if (!m) throw new RangeError("Invalid path: " + part);
				pieces.push(m[0] == "*" ? "" : m[0][0] == "\"" ? JSON.parse(m[0]) : m[0]);
				pos += m[0].length;
				if (pos == part.length) break;
				let next = part[pos++];
				if (pos == part.length && next == "!") {
					mode = 0;
					break;
				}
				if (next != "/") throw new RangeError("Invalid path: " + part);
				rest = part.slice(pos);
			}
			let last = pieces.length - 1, inner = pieces[last];
			if (!inner) throw new RangeError("Invalid path: " + part);
			byName[inner] = new Rule(tags, mode, last > 0 ? pieces.slice(0, last) : null).sort(byName[inner]);
		}
	}
	return ruleNodeProp.add(byName);
}
var ruleNodeProp = new NodeProp$1({ combine(a, b) {
	let cur, root, take;
	while (a || b) {
		if (!a || b && a.depth >= b.depth) {
			take = b;
			b = b.next;
		} else {
			take = a;
			a = a.next;
		}
		if (cur && cur.mode == take.mode && !take.context && !cur.context) continue;
		let copy = new Rule(take.tags, take.mode, take.context);
		if (cur) cur.next = copy;
		else root = copy;
		cur = copy;
	}
	return root;
} });
var Rule = class {
	constructor(tags, mode, context, next) {
		this.tags = tags;
		this.mode = mode;
		this.context = context;
		this.next = next;
	}
	get opaque() {
		return this.mode == 0;
	}
	get inherit() {
		return this.mode == 1;
	}
	sort(other) {
		if (!other || other.depth < this.depth) {
			this.next = other;
			return this;
		}
		other.next = this.sort(other.next);
		return other;
	}
	get depth() {
		return this.context ? this.context.length : 0;
	}
};
Rule.empty = new Rule([], 2, null);
/**
Define a [highlighter](#highlight.Highlighter) from an array of
tag/class pairs. Classes associated with more specific tags will
take precedence.
*/
function tagHighlighter(tags, options) {
	let map = Object.create(null);
	for (let style of tags) if (!Array.isArray(style.tag)) map[style.tag.id] = style.class;
	else for (let tag of style.tag) map[tag.id] = style.class;
	let { scope, all = null } = options || {};
	return {
		style: (tags) => {
			let cls = all;
			for (let tag of tags) for (let sub of tag.set) {
				let tagClass = map[sub.id];
				if (tagClass) {
					cls = cls ? cls + " " + tagClass : tagClass;
					break;
				}
			}
			return cls;
		},
		scope
	};
}
function highlightTags(highlighters, tags) {
	let result = null;
	for (let highlighter of highlighters) {
		let value = highlighter.style(tags);
		if (value) result = result ? result + " " + value : value;
	}
	return result;
}
/**
Highlight the given [tree](#common.Tree) with the given
[highlighter](#highlight.Highlighter). Often, the higher-level
[`highlightCode`](#highlight.highlightCode) function is easier to
use.
*/
function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
	let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
	builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
	builder.flush(to);
}
var HighlightBuilder = class {
	constructor(at, highlighters, span) {
		this.at = at;
		this.highlighters = highlighters;
		this.span = span;
		this.class = "";
	}
	startSpan(at, cls) {
		if (cls != this.class) {
			this.flush(at);
			if (at > this.at) this.at = at;
			this.class = cls;
		}
	}
	flush(to) {
		if (to > this.at && this.class) this.span(this.at, to, this.class);
	}
	highlightRange(cursor, from, to, inheritedClass, highlighters) {
		let { type, from: start, to: end } = cursor;
		if (start >= to || end <= from) return;
		if (type.isTop) highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type));
		let cls = inheritedClass;
		let rule = getStyleTags(cursor) || Rule.empty;
		let tagCls = highlightTags(highlighters, rule.tags);
		if (tagCls) {
			if (cls) cls += " ";
			cls += tagCls;
			if (rule.mode == 1) inheritedClass += (inheritedClass ? " " : "") + tagCls;
		}
		this.startSpan(Math.max(from, start), cls);
		if (rule.opaque) return;
		let mounted = cursor.tree && cursor.tree.prop(NodeProp$1.mounted);
		if (mounted && mounted.overlay) {
			let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
			let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
			let hasChild = cursor.firstChild();
			for (let i = 0, pos = start;; i++) {
				let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
				let nextPos = next ? next.from + start : end;
				let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos);
				if (rangeFrom < rangeTo && hasChild) while (cursor.from < rangeTo) {
					this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters);
					this.startSpan(Math.min(rangeTo, cursor.to), cls);
					if (cursor.to >= nextPos || !cursor.nextSibling()) break;
				}
				if (!next || nextPos > to) break;
				pos = next.to + start;
				if (pos > from) {
					this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), "", innerHighlighters);
					this.startSpan(Math.min(to, pos), cls);
				}
			}
			if (hasChild) cursor.parent();
		} else if (cursor.firstChild()) {
			if (mounted) inheritedClass = "";
			do {
				if (cursor.to <= from) continue;
				if (cursor.from >= to) break;
				this.highlightRange(cursor, from, to, inheritedClass, highlighters);
				this.startSpan(Math.min(to, cursor.to), cls);
			} while (cursor.nextSibling());
			cursor.parent();
		}
	}
};
/**
Match a syntax node's [highlight rules](#highlight.styleTags). If
there's a match, return its set of tags, and whether it is
opaque (uses a `!`) or applies to all child nodes (`/...`).
*/
function getStyleTags(node) {
	let rule = node.type.prop(ruleNodeProp);
	while (rule && rule.context && !node.matchContext(rule.context)) rule = rule.next;
	return rule || null;
}
var t$1 = Tag.define;
var comment = t$1();
var name$4 = t$1();
var typeName = t$1(name$4);
var propertyName = t$1(name$4);
var literal$1 = t$1();
var string$4 = t$1(literal$1);
var number$3 = t$1(literal$1);
var content$2 = t$1();
var heading$2 = t$1(content$2);
var keyword = t$1();
var operator$1 = t$1();
var punctuation = t$1();
var bracket = t$1(punctuation);
var meta = t$1();
/**
The default set of highlighting [tags](#highlight.Tag).

This collection is heavily biased towards programming languages,
and necessarily incomplete. A full ontology of syntactic
constructs would fill a stack of books, and be impractical to
write themes for. So try to make do with this set. If all else
fails, [open an
issue](https://github.com/codemirror/codemirror.next) to propose a
new tag, or [define](#highlight.Tag^define) a local custom tag for
your use case.

Note that it is not obligatory to always attach the most specific
tag possible to an element—if your grammar can't easily
distinguish a certain type of element (such as a local variable),
it is okay to style it as its more general variant (a variable).

For tags that extend some parent tag, the documentation links to
the parent.
*/
var tags$1 = {
	/**
	A comment.
	*/
	comment,
	/**
	A line [comment](#highlight.tags.comment).
	*/
	lineComment: t$1(comment),
	/**
	A block [comment](#highlight.tags.comment).
	*/
	blockComment: t$1(comment),
	/**
	A documentation [comment](#highlight.tags.comment).
	*/
	docComment: t$1(comment),
	/**
	Any kind of identifier.
	*/
	name: name$4,
	/**
	The [name](#highlight.tags.name) of a variable.
	*/
	variableName: t$1(name$4),
	/**
	A type [name](#highlight.tags.name).
	*/
	typeName,
	/**
	A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
	*/
	tagName: t$1(typeName),
	/**
	A property or field [name](#highlight.tags.name).
	*/
	propertyName,
	/**
	An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
	*/
	attributeName: t$1(propertyName),
	/**
	The [name](#highlight.tags.name) of a class.
	*/
	className: t$1(name$4),
	/**
	A label [name](#highlight.tags.name).
	*/
	labelName: t$1(name$4),
	/**
	A namespace [name](#highlight.tags.name).
	*/
	namespace: t$1(name$4),
	/**
	The [name](#highlight.tags.name) of a macro.
	*/
	macroName: t$1(name$4),
	/**
	A literal value.
	*/
	literal: literal$1,
	/**
	A string [literal](#highlight.tags.literal).
	*/
	string: string$4,
	/**
	A documentation [string](#highlight.tags.string).
	*/
	docString: t$1(string$4),
	/**
	A character literal (subtag of [string](#highlight.tags.string)).
	*/
	character: t$1(string$4),
	/**
	An attribute value (subtag of [string](#highlight.tags.string)).
	*/
	attributeValue: t$1(string$4),
	/**
	A number [literal](#highlight.tags.literal).
	*/
	number: number$3,
	/**
	An integer [number](#highlight.tags.number) literal.
	*/
	integer: t$1(number$3),
	/**
	A floating-point [number](#highlight.tags.number) literal.
	*/
	float: t$1(number$3),
	/**
	A boolean [literal](#highlight.tags.literal).
	*/
	bool: t$1(literal$1),
	/**
	Regular expression [literal](#highlight.tags.literal).
	*/
	regexp: t$1(literal$1),
	/**
	An escape [literal](#highlight.tags.literal), for example a
	backslash escape in a string.
	*/
	escape: t$1(literal$1),
	/**
	A color [literal](#highlight.tags.literal).
	*/
	color: t$1(literal$1),
	/**
	A URL [literal](#highlight.tags.literal).
	*/
	url: t$1(literal$1),
	/**
	A language keyword.
	*/
	keyword,
	/**
	The [keyword](#highlight.tags.keyword) for the self or this
	object.
	*/
	self: t$1(keyword),
	/**
	The [keyword](#highlight.tags.keyword) for null.
	*/
	null: t$1(keyword),
	/**
	A [keyword](#highlight.tags.keyword) denoting some atomic value.
	*/
	atom: t$1(keyword),
	/**
	A [keyword](#highlight.tags.keyword) that represents a unit.
	*/
	unit: t$1(keyword),
	/**
	A modifier [keyword](#highlight.tags.keyword).
	*/
	modifier: t$1(keyword),
	/**
	A [keyword](#highlight.tags.keyword) that acts as an operator.
	*/
	operatorKeyword: t$1(keyword),
	/**
	A control-flow related [keyword](#highlight.tags.keyword).
	*/
	controlKeyword: t$1(keyword),
	/**
	A [keyword](#highlight.tags.keyword) that defines something.
	*/
	definitionKeyword: t$1(keyword),
	/**
	A [keyword](#highlight.tags.keyword) related to defining or
	interfacing with modules.
	*/
	moduleKeyword: t$1(keyword),
	/**
	An operator.
	*/
	operator: operator$1,
	/**
	An [operator](#highlight.tags.operator) that dereferences something.
	*/
	derefOperator: t$1(operator$1),
	/**
	Arithmetic-related [operator](#highlight.tags.operator).
	*/
	arithmeticOperator: t$1(operator$1),
	/**
	Logical [operator](#highlight.tags.operator).
	*/
	logicOperator: t$1(operator$1),
	/**
	Bit [operator](#highlight.tags.operator).
	*/
	bitwiseOperator: t$1(operator$1),
	/**
	Comparison [operator](#highlight.tags.operator).
	*/
	compareOperator: t$1(operator$1),
	/**
	[Operator](#highlight.tags.operator) that updates its operand.
	*/
	updateOperator: t$1(operator$1),
	/**
	[Operator](#highlight.tags.operator) that defines something.
	*/
	definitionOperator: t$1(operator$1),
	/**
	Type-related [operator](#highlight.tags.operator).
	*/
	typeOperator: t$1(operator$1),
	/**
	Control-flow [operator](#highlight.tags.operator).
	*/
	controlOperator: t$1(operator$1),
	/**
	Program or markup punctuation.
	*/
	punctuation,
	/**
	[Punctuation](#highlight.tags.punctuation) that separates
	things.
	*/
	separator: t$1(punctuation),
	/**
	Bracket-style [punctuation](#highlight.tags.punctuation).
	*/
	bracket,
	/**
	Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
	tokens).
	*/
	angleBracket: t$1(bracket),
	/**
	Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
	tokens).
	*/
	squareBracket: t$1(bracket),
	/**
	Parentheses (usually `(` and `)` tokens). Subtag of
	[bracket](#highlight.tags.bracket).
	*/
	paren: t$1(bracket),
	/**
	Braces (usually `{` and `}` tokens). Subtag of
	[bracket](#highlight.tags.bracket).
	*/
	brace: t$1(bracket),
	/**
	Content, for example plain text in XML or markup documents.
	*/
	content: content$2,
	/**
	[Content](#highlight.tags.content) that represents a heading.
	*/
	heading: heading$2,
	/**
	A level 1 [heading](#highlight.tags.heading).
	*/
	heading1: t$1(heading$2),
	/**
	A level 2 [heading](#highlight.tags.heading).
	*/
	heading2: t$1(heading$2),
	/**
	A level 3 [heading](#highlight.tags.heading).
	*/
	heading3: t$1(heading$2),
	/**
	A level 4 [heading](#highlight.tags.heading).
	*/
	heading4: t$1(heading$2),
	/**
	A level 5 [heading](#highlight.tags.heading).
	*/
	heading5: t$1(heading$2),
	/**
	A level 6 [heading](#highlight.tags.heading).
	*/
	heading6: t$1(heading$2),
	/**
	A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
	*/
	contentSeparator: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that represents a list.
	*/
	list: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that represents a quote.
	*/
	quote: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that is emphasized.
	*/
	emphasis: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that is styled strong.
	*/
	strong: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that is part of a link.
	*/
	link: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that is styled as code or
	monospace.
	*/
	monospace: t$1(content$2),
	/**
	[Content](#highlight.tags.content) that has a strike-through
	style.
	*/
	strikethrough: t$1(content$2),
	/**
	Inserted text in a change-tracking format.
	*/
	inserted: t$1(),
	/**
	Deleted text.
	*/
	deleted: t$1(),
	/**
	Changed text.
	*/
	changed: t$1(),
	/**
	An invalid or unsyntactic element.
	*/
	invalid: t$1(),
	/**
	Metadata or meta-instruction.
	*/
	meta,
	/**
	[Metadata](#highlight.tags.meta) that applies to the entire
	document.
	*/
	documentMeta: t$1(meta),
	/**
	[Metadata](#highlight.tags.meta) that annotates or adds
	attributes to a given syntactic element.
	*/
	annotation: t$1(meta),
	/**
	Processing instruction or preprocessor directive. Subtag of
	[meta](#highlight.tags.meta).
	*/
	processingInstruction: t$1(meta),
	/**
	[Modifier](#highlight.Tag^defineModifier) that indicates that a
	given element is being defined. Expected to be used with the
	various [name](#highlight.tags.name) tags.
	*/
	definition: Tag.defineModifier("definition"),
	/**
	[Modifier](#highlight.Tag^defineModifier) that indicates that
	something is constant. Mostly expected to be used with
	[variable names](#highlight.tags.variableName).
	*/
	constant: Tag.defineModifier("constant"),
	/**
	[Modifier](#highlight.Tag^defineModifier) used to indicate that
	a [variable](#highlight.tags.variableName) or [property
	name](#highlight.tags.propertyName) is being called or defined
	as a function.
	*/
	function: Tag.defineModifier("function"),
	/**
	[Modifier](#highlight.Tag^defineModifier) that can be applied to
	[names](#highlight.tags.name) to indicate that they belong to
	the language's standard environment.
	*/
	standard: Tag.defineModifier("standard"),
	/**
	[Modifier](#highlight.Tag^defineModifier) that indicates a given
	[names](#highlight.tags.name) is local to some scope.
	*/
	local: Tag.defineModifier("local"),
	/**
	A generic variant [modifier](#highlight.Tag^defineModifier) that
	can be used to tag language-specific alternative variants of
	some common tag. It is recommended for themes to define special
	forms of at least the [string](#highlight.tags.string) and
	[variable name](#highlight.tags.variableName) tags, since those
	come up a lot.
	*/
	special: Tag.defineModifier("special")
};
for (let name in tags$1) {
	let val = tags$1[name];
	if (val instanceof Tag) val.name = name;
}
tagHighlighter([
	{
		tag: tags$1.link,
		class: "tok-link"
	},
	{
		tag: tags$1.heading,
		class: "tok-heading"
	},
	{
		tag: tags$1.emphasis,
		class: "tok-emphasis"
	},
	{
		tag: tags$1.strong,
		class: "tok-strong"
	},
	{
		tag: tags$1.keyword,
		class: "tok-keyword"
	},
	{
		tag: tags$1.atom,
		class: "tok-atom"
	},
	{
		tag: tags$1.bool,
		class: "tok-bool"
	},
	{
		tag: tags$1.url,
		class: "tok-url"
	},
	{
		tag: tags$1.labelName,
		class: "tok-labelName"
	},
	{
		tag: tags$1.inserted,
		class: "tok-inserted"
	},
	{
		tag: tags$1.deleted,
		class: "tok-deleted"
	},
	{
		tag: tags$1.literal,
		class: "tok-literal"
	},
	{
		tag: tags$1.string,
		class: "tok-string"
	},
	{
		tag: tags$1.number,
		class: "tok-number"
	},
	{
		tag: [
			tags$1.regexp,
			tags$1.escape,
			tags$1.special(tags$1.string)
		],
		class: "tok-string2"
	},
	{
		tag: tags$1.variableName,
		class: "tok-variableName"
	},
	{
		tag: tags$1.local(tags$1.variableName),
		class: "tok-variableName tok-local"
	},
	{
		tag: tags$1.definition(tags$1.variableName),
		class: "tok-variableName tok-definition"
	},
	{
		tag: tags$1.special(tags$1.variableName),
		class: "tok-variableName2"
	},
	{
		tag: tags$1.definition(tags$1.propertyName),
		class: "tok-propertyName tok-definition"
	},
	{
		tag: tags$1.typeName,
		class: "tok-typeName"
	},
	{
		tag: tags$1.namespace,
		class: "tok-namespace"
	},
	{
		tag: tags$1.className,
		class: "tok-className"
	},
	{
		tag: tags$1.macroName,
		class: "tok-macroName"
	},
	{
		tag: tags$1.propertyName,
		class: "tok-propertyName"
	},
	{
		tag: tags$1.operator,
		class: "tok-operator"
	},
	{
		tag: tags$1.comment,
		class: "tok-comment"
	},
	{
		tag: tags$1.meta,
		class: "tok-meta"
	},
	{
		tag: tags$1.invalid,
		class: "tok-invalid"
	},
	{
		tag: tags$1.punctuation,
		class: "tok-punctuation"
	}
]);

export { Tag, highlightTree, styleTags, tagHighlighter, tags$1 };
