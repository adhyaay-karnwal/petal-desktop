// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/webviewGuestScripts.ts

/**
* Scripts injected into a Live Preview guest (Electron `<webview>`) for
* snapshotting it onto the canvas as layers.
*
* Both are self-contained strings: no imports, no chrome.* / electron APIs.
*
* `buildSnapshotScript` installs `window.__lgSnapshot.capture(el?)` in the
* page's own world (`executeJavaScript`): the capture engine the Chrome
* extension also runs (`__petalCapture`, the bundled artifact the host
* injects first — see `ensureCaptureArtifactInWebview`) with the extension's
* options, hover shield and portal pickup.
*
* `buildPickScript` installs selecting inside the page: hover/selection
* outlines drawn like the canvas's, picks in the Capture tool, Esc to let
* go, and dragging a pick out (Capture tool),
* which captures the grabbed element and reports the drag to the host so it
* can land on the canvas. It runs in the isolated world of the webview's
* preload (apps/electron/src/preload/webview.ts), which the page cannot reach,
* acts only on trusted input, and reports through the preload's
* `__lgHost.send` (an `ipc-message` on the host's `<webview>`). Anything the
* page itself can do (log, call a global, dispatch an event) is not a pick.
*/
/** Marks every node the scripts add to the guest, so captures skip them. */
var GUEST_UI_ATTR = "data-lg-pick-ui";
/** Guest-side JS defining `__lgFingerprint(el)` → LiveFingerprint. Shared by the Select script and the ⇧⌘S probe. */
var GUEST_FINGERPRINT_SRC = `function __lgFingerprint(el){
  function getFiber(n){ for (var k in n) { if (k.indexOf('__reactFiber$') === 0 || k.indexOf('__reactInternalInstance$') === 0) return n[k]; } return null; }
  // React 19: _debugStack holds the stack at the element's creation. Line 0 is
  // the error, line 1 React's jsx/createElement, line 2 the JSX call site.
  function callSite(f){
    var s = f._debugStack && f._debugStack.stack;
    var m = typeof s === 'string' && /(https?:\\/\\/[^\\s()]+):(\\d+):(\\d+)/.exec(s.split('\\n')[2] || '');
    return m ? { url: m[1], line: +m[2], column: +m[3] } : null;
  }
  var f = getFiber(el), file = null, comp = null, frames = [], hops = 0;
  while (f && hops < 40) {
    if (!file && f._debugSource && f._debugSource.fileName) file = f._debugSource.fileName;
    var t = f.type;
    if (!comp && t && typeof t !== 'string') { comp = t.displayName || t.name || (t.render && (t.render.displayName || t.render.name)) || null; }
    var c = frames.length < 8 ? callSite(f) : null;
    if (c && !frames.some(function(x){ return x.url === c.url && x.line === c.line && x.column === c.column; })) frames.push(c);
    if (file && comp && frames.length >= 8) break;
    f = f.return; hops++;
  }
  var isLeaf = el.children && el.children.length === 0;
  // Its text nodes, spaced apart (textContent runs blocks together), capped.
  var words = [], length = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
  while (length < 200 && (node = walker.nextNode())) {
    var piece = node.nodeValue.replace(/\\s+/g, ' ').trim();
    if (piece) { words.push(piece); length += piece.length + 1; }
  }
  return {
    tag: (el.tagName || '').toLowerCase(),
    className: (el.getAttribute && el.getAttribute('class')) || '',
    text: isLeaf ? ((el.textContent || '').trim() || null) : null,
    visibleText: words.join(' ').slice(0, 200) || null,
    file: file,
    componentName: comp,
    frames: frames
  };
}`;
/**
* Page-world `async function(frames)` → the first frame in the page's own
* code as `{ file, line, column }` (1-based), or null. Fetches each bundle's
* source map (same origin, cached on the page), reads `sections` index maps
* as Turbopack serves them, and skips frames that map into node_modules.
*/
var PAGE_SOURCE_AT = `async function(frames){
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var cache = window.__lgSourceMaps || (window.__lgSourceMaps = {});
  function json(url){ return fetch(url).then(function(r){ return r.ok ? r.json() : null; }); }
  function load(url){
    var bare = url.split(/[?#]/)[0];
    if (!cache[bare]) cache[bare] = json(bare + '.map').catch(function(){ return null; }).then(function(map){
      if (map) return map;
      return fetch(url).then(function(r){ return r.ok ? r.text() : ''; }).then(function(code){
        var m = /\\/\\/[#@] sourceMappingURL=(\\S+)\\s*$/.exec(code);
        return m ? json(new URL(m[1], url).href) : null;
      });
    }).catch(function(){ return null; });
    return cache[bare];
  }
  function vlq(str){
    var out = [], shift = 0, value = 0;
    for (var i = 0; i < str.length; i++) {
      var d = B64.indexOf(str[i]);
      value += (d & 31) << shift;
      if (d & 32) { shift += 5; continue; }
      out.push(value & 1 ? -(value >>> 1) : value >>> 1);
      value = 0; shift = 0;
    }
    return out;
  }
  // Generated 0-based line l, column c → { source, line, column } (0-based).
  function flat(map, l, c){
    var lines = (map.mappings || '').split(';');
    if (l < 0 || l >= lines.length) return null;
    var src = 0, ol = 0, oc = 0, best = null, first = null;
    for (var i = 0; i <= l; i++) {
      var col = 0, segs = lines[i] ? lines[i].split(',') : [];
      for (var j = 0; j < segs.length; j++) {
        var v = vlq(segs[j]);
        if (!v.length) continue;
        col += v[0];
        if (v.length < 4) continue;
        src += v[1]; ol += v[2]; oc += v[3];
        if (i !== l) continue;
        var hit = { source: src, line: ol, column: oc };
        if (!first) first = hit;
        if (col <= c) best = hit;
      }
    }
    var at = best || first;
    if (!at) return null;
    var name = map.sources && map.sources[at.source];
    return name == null ? null : { source: (map.sourceRoot || '') + name, line: at.line, column: at.column };
  }
  function lookup(map, l, c){
    if (!map.sections) return flat(map, l, c);
    var section = null;
    for (var i = 0; i < map.sections.length; i++) {
      var o = map.sections[i].offset;
      if (o.line < l || (o.line === l && o.column <= c)) section = map.sections[i]; else break;
    }
    if (!section || !section.map) return null;
    var sl = l - section.offset.line;
    return flat(section.map, sl, sl === 0 ? c - section.offset.column : c);
  }
  for (var k = 0; k < frames.length; k++) {
    var frame = frames[k];
    var map = await load(frame.url);
    var at = map && lookup(map, frame.line - 1, frame.column - 1);
    if (!at || /\\/node_modules\\//.test(at.source)) continue;
    var file = at.source.indexOf('file://') === 0 ? decodeURIComponent(at.source.slice(7)) : at.source;
    return { file: file, line: at.line + 1, column: at.column + 1 };
  }
  return null;
}`;
/** The `ipc-message` channel the pick script reports on; its args are a `PickMessage`. */
var PICK_CHANNEL = "lg-pick";
function buildSnapshotScript() {
	return `(function(){
  if (window.__lgSnapshot) return;
  // The Chrome extension's capture, option for option (BASE_RUN_OPTS in
  // apps/chrome-extension/content.js): a snapshot of how the page looks, with
  // component names as hints for the agent.
  var OPTS = {
    snapshot: true,
    withFiber: true,
    maxDepth: 400,
    knownComponents: [],
    skipSelector: '[${GUEST_UI_ATTR}]'
  };
  function run(extra){
    var o = {}; for (var k in OPTS) o[k] = OPTS[k]; for (var j in extra) o[j] = extra[j];
    return globalThis.__petalCapture.run(o);
  }
  // The element under the cursor would be captured in its :hover state. Cover
  // the page for two frames so hover styles clear before reading them.
  function withoutHover(capture){
    var shield = document.createElement('div');
    shield.setAttribute('${GUEST_UI_ATTR}', '');
    shield.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:transparent';
    document.documentElement.appendChild(shield);
    var done = function(){ shield.remove(); };
    return new Promise(function(resolve){ requestAnimationFrame(function(){ requestAnimationFrame(resolve); }); })
      .then(capture)
      .then(function(r){ done(); return r; }, function(err){ done(); throw err; });
  }
  // Fixed/absolute body children outside the picked root (portals: menus,
  // dialogs, toasts) — captured alongside it, as the extension does.
  function portalsFor(root){
    var out = [];
    var kids = Array.prototype.slice.call(document.body.children);
    return kids.reduce(function(p, child){
      return p.then(function(){
        if (child === root || root.contains(child) || child.contains(root)) return;
        if (child.hasAttribute('${GUEST_UI_ATTR}')) return;
        var cs = window.getComputedStyle(child);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if (cs.position !== 'fixed' && cs.position !== 'absolute') return;
        var r = child.getBoundingClientRect();
        if (!(r.width > 0 && r.height > 0)) return;
        return run({ rootElement: child, includeRoot: true }).then(function(res){
          if (res && !res.error && res.elements && res.elements[0]) out.push(res.elements[0]);
        });
      });
    }, Promise.resolve()).then(function(){ return out; });
  }
  window.__lgSnapshot = {
    // Resolves to JSON: { element, elementCount, componentCount, projectRoot } or { error }.
    // No element: the whole page, <body> as one root (fixed navs and the page
    // background come along).
    capture: function(el){
      if (!globalThis.__petalCapture) return Promise.resolve(JSON.stringify({ error: 'no_capture_engine' }));
      var root = el || document.body;
      var p = withoutHover(function(){ return run({ rootElement: root, includeRoot: true }); }).then(function(res){
        if (!res || res.error || !res.elements || !res.elements[0]) return { error: (res && res.error) || 'no_elements' };
        var captured = res.elements[0];
        var portals = el ? portalsFor(el) : Promise.resolve([]);
        return portals.then(function(found){
          if (found.length && captured.type === 'html') captured.children = (captured.children || []).concat(found);
          return { element: captured, elementCount: res.elementCount, componentCount: res.componentCount, projectRoot: res.projectRoot };
        });
      });
      return p.then(function(r){ return JSON.stringify(r); }, function(err){ return JSON.stringify({ error: String(err && err.message || err) }); });
    }
  };
})()`;
}
var PAGE_FINGERPRINT = `function(el){ ${GUEST_FINGERPRINT_SRC} return __lgFingerprint(el); }`;
var PAGE_CAPTURE = `function(el){ return window.__lgSnapshot ? window.__lgSnapshot.capture(el) : JSON.stringify({ error: 'no_snapshot' }); }`;
var PAGE_CLIPBOARD = `function(el){
  if (!window.__lgSnapshot) return null;
  return window.__lgSnapshot.capture(el).then(function(json){
    var r = JSON.parse(json);
    if (!r || r.error || !r.element) return null;
    r.element.canvasPosition = { x: 100, y: 100 };
    var schema = (globalThis.__petalCapture && globalThis.__petalCapture.version) || '1';
    return JSON.stringify({ __petal: true, element: r.element, __schema: schema });
  });
}`;
/**
* The guest half of picking inside a Live Preview, installed whenever the
* preview is on the canvas.
*  - The Capture tool (`setCapture`) picks like the canvas's own cursor: a
*    click picks the element under the cursor at the current level (at first
*    the page's outermost blocks), each further click of a quick burst goes a
*    level deeper, and hover outlines what a click would pick. Held ⌘ picks
*    the deepest element under the cursor instead, as on the canvas. ⌘C
*    copies the pick and ⌘V pastes onto the canvas, a press-drag pulls it
*    out. Outside Capture a click is the page's.
*  - ⌘ going down or up is reported (`meta`): held in Interact, the host
*    switches to Capture until it is released.
*  - `setInteractive`: interactive, plain clicks go to the page; otherwise
*    space-drag pans the canvas. A static preview gets no events: the host's
*    overlay covers it until a double-click makes it live, and reports ⌘-hover
*    (`hoverDeepAt`) and ⌘-click (`pickDeepAt`) so ⌘ picks the deepest
*    element, as in a component.
*  - A plain wheel scrolls the page, or pans the canvas where nothing under
*    the cursor scrolls. Pinch and ⌘-wheel zoom the canvas and a middle-drag
*    pans it, in every mode.
*  - Esc lets go of a pick; with nothing picked it makes the preview static
*    (in Interact the page keeps its own Esc).
* Runs in the webview preload's isolated world (see the file comment); it
* needs that world's `__lgHost`.
*/
function buildPickScript(enable, color = "rgb(59, 130, 246)") {
	if (!enable) return `(function(){try{if(window.__lgPick){window.__lgPick.cleanup();}}catch(e){}})()`;
	return `(function(){
  try {
    if (window.__lgPick) window.__lgPick.cleanup();
    var host = globalThis.__lgHost;
    if (!host) return;
    var BLUE = ${JSON.stringify(color)};
    var UI = '${GUEST_UI_ATTR}';
    // Messages leave in the order they were made, though some wait on the page's world first.
    var outbox = Promise.resolve();
    function send(kind, payload){
      outbox = outbox.then(function(){ return payload; }).then(function(p){
        if (p === undefined) host.send('${PICK_CHANNEL}', kind); else host.send('${PICK_CHANNEL}', kind, p);
      }, function(){});
    }
    // Runs a page-world function(el) on el. The element crosses worlds as a
    // one-off attribute the page-world side reads and removes.
    var MARK = 'data-lg-pick-target', marks = 0;
    function inPage(el, fnSrc){
      var id = String(++marks);
      el.setAttribute(MARK, id);
      var find = JSON.stringify('[' + MARK + '="' + id + '"]');
      return host.inPage('(function(){var el=document.querySelector(' + find + ');if(!el)return null;el.removeAttribute(' + JSON.stringify(MARK) + ');return (' + fnSrc + ')(el);})()')
        .finally(function(){ if (el.getAttribute(MARK) === id) el.removeAttribute(MARK); });
    }
    var PAGE_FINGERPRINT = ${JSON.stringify(PAGE_FINGERPRINT)};
    var PAGE_CAPTURE = ${JSON.stringify(PAGE_CAPTURE)};
    var PAGE_CLIPBOARD = ${JSON.stringify(PAGE_CLIPBOARD)};
    // Capture tool: hover outlines, a click picks (and copies), a press-drag
    // pulls the element out onto the canvas. Its crosshair goes on at the first
    // pointer move over the page: adding the sheet restyles the whole page,
    // and a ⌘ held for ⌘C or ⌘Tab (which flips Interact to Capture) never moves.
    var interactive = false, capture = false, enabled = true;
    // The canvas's ⌘: ⌘ on macOS, Ctrl elsewhere (on macOS Ctrl-click is a right click).
    var MAC = /Mac/.test(navigator.platform);
    function primary(e){ return MAC ? e.metaKey : e.ctrlKey; }
    var PRIMARY_KEY = MAC ? 'Meta' : 'Control';
    var captureCursor = null;
    function setCaptureCursor(on){
      if (on && !captureCursor) {
        captureCursor = document.createElement('style');
        captureCursor.setAttribute(UI, '');
        captureCursor.textContent = '*{cursor:crosshair!important}';
        document.documentElement.appendChild(captureCursor);
      } else if (!on && captureCursor) { captureCursor.remove(); captureCursor = null; }
    }
    function box(z, extra){
      var d = document.createElement('div');
      d.setAttribute(UI, '');
      d.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;display:none;box-sizing:border-box;z-index:' + z + ';' + extra;
      document.documentElement.appendChild(d);
      return d;
    }
    // The canvas look: 1px outlines, no label, no handles. The page is
    // drawn through the canvas zoom, so sizes divide by it to match on screen.
    var zoom = 1;
    var hov = box(2147483640, 'outline:1px solid ' + BLUE + ';');
    var sel = box(2147483641, 'outline:1px solid ' + BLUE + ';');

    // The page's scrollbar as an overlay, like the editor's ScrollArea: the
    // native one is hidden so the page keeps its full width, and a slim thumb
    // (4px in an 8px track) is drawn over the content while the pointer is on
    // the page or it scrolls, hidden 400ms after. The thumb drags. Only the
    // document's own scroll; inner scrollers keep theirs. A static preview
    // (neither Interact nor Capture) is a layer and shows none.
    var hideNativeBar = document.createElement('style');
    hideNativeBar.setAttribute(UI, '');
    hideNativeBar.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}';
    document.documentElement.appendChild(hideNativeBar);
    var thumb = box(2147483643, 'border-radius:999px;background:rgba(128,128,128,0.5);');
    thumb.style.pointerEvents = 'auto';
    var thumbShown = false, thumbHide = 0, thumbRaf = 0, thumbDrag = null;
    function thumbMetrics(){
      var se = document.scrollingElement || document.documentElement;
      var view = window.innerHeight, total = se.scrollHeight;
      if (total <= view + 1) return null;
      var length = Math.max(24 / zoom, view * view / total);
      return { se: se, view: view, length: length, travel: view - length, range: total - view };
    }
    function paintThumb(){
      thumbRaf = 0;
      var m = thumbShown && (interactive || capture) ? thumbMetrics() : null;
      if (!m) { thumb.style.display = 'none'; return; }
      var inset = 2 / zoom, width = 4 / zoom;
      thumb.style.display = 'block';
      thumb.style.width = width + 'px';
      thumb.style.height = (m.length - inset * 2) + 'px';
      thumb.style.transform = 'translate(' + (window.innerWidth - width - inset) + 'px,' + (inset + m.travel * (m.se.scrollTop / m.range)) + 'px)';
    }
    // Called per pointer move and scroll: the measuring (a layout read) runs at most once a frame.
    function showThumb(){
      if (!interactive && !capture) return;
      thumbShown = true;
      clearTimeout(thumbHide);
      if (!thumbDrag) thumbHide = setTimeout(function(){ thumbShown = false; paintThumb(); }, 400);
      if (!thumbRaf) thumbRaf = requestAnimationFrame(paintThumb);
    }
    function onThumbDown(e){
      if (!e.isTrusted || e.button !== 0) return;
      var m = thumbMetrics(); if (!m) return;
      e.preventDefault(); e.stopPropagation();
      thumbDrag = { y: e.clientY, top: m.se.scrollTop, perPx: m.range / m.travel };
      thumb.setPointerCapture(e.pointerId);
      thumb.style.background = 'rgba(128,128,128,0.7)';
    }
    function onThumbMove(e){
      if (!thumbDrag || !e.isTrusted) return;
      var se = document.scrollingElement || document.documentElement;
      se.scrollTop = thumbDrag.top + (e.clientY - thumbDrag.y) * thumbDrag.perPx;
    }
    function onThumbUp(){
      if (!thumbDrag) return;
      thumbDrag = null;
      thumb.style.background = 'rgba(128,128,128,0.5)';
      showThumb();
    }
    thumb.addEventListener('pointerdown', onThumbDown);
    thumb.addEventListener('pointermove', onThumbMove);
    thumb.addEventListener('pointerup', onThumbUp);
    thumb.addEventListener('pointercancel', onThumbUp);

    function applyZoom(){
      var w = (1 / zoom) + 'px';
      hov.style.outlineWidth = w; sel.style.outlineWidth = w;
      paintThumb();
    }

    function isUi(n){ while (n && n.nodeType === 1) { if (n.hasAttribute(UI)) return true; n = n.parentElement; } return false; }
    function place(b, el){
      var r = el.getBoundingClientRect();
      b.style.display = 'block';
      b.style.transform = 'translate(' + r.left + 'px,' + r.top + 'px)';
      b.style.width = r.width + 'px'; b.style.height = r.height + 'px';
      return r;
    }
    // The pick's file, component and creation frames come from its fiber, read
    // once per pick in the page's world; the rest is read here.
    var fiberInfo = null; // { el, info: Promise<{ file, componentName, frames } | null> }
    function fiberOf(el){
      if (!fiberInfo || fiberInfo.el !== el) fiberInfo = { el: el, info: inPage(el, PAGE_FINGERPRINT).catch(function(){ return null; }) };
      return fiberInfo.info;
    }
    function describe(el){
      return fiberOf(el).then(function(f){
        var r = el.getBoundingClientRect();
        var isLeaf = el.children && el.children.length === 0;
        return {
          tag: (el.tagName || '').toLowerCase(),
          className: el.getAttribute('class') || '',
          text: isLeaf ? ((el.textContent || '').trim() || null) : null,
          visibleText: (f && typeof f.visibleText === 'string') ? f.visibleText : null,
          file: (f && typeof f.file === 'string') ? f.file : null,
          componentName: (f && typeof f.componentName === 'string') ? f.componentName : null,
          frames: (f && Array.isArray(f.frames)) ? f.frames : [],
          left: r.left, top: r.top, width: Math.round(r.width), height: Math.round(r.height)
        };
      });
    }

    var selected = null;
    function targetAt(x, y){ var el = document.elementFromPoint(x, y); if (!el || isUi(el)) return null; return el; }

    // Levels, as on the canvas. The page's root is like a frame on the
    // canvas, which is never picked itself: its children are the top level.
    // It is <body>, narrowed through wrappers that fill it (#__next, an app
    // shell the size of the body) or are its only visible child (empty
    // portal and toast roots beside it have no size). A pick makes its
    // siblings the level; a further click in a burst goes one level into the
    // pick. display:contents wrappers have no box, so they are not a level.
    var scope = null;
    function boxed(n){ return window.getComputedStyle(n).display !== 'contents'; }
    function sameSize(a, b){ return Math.abs(a.offsetWidth - b.offsetWidth) <= 1 && Math.abs(a.offsetHeight - b.offsetHeight) <= 1; }
    function pageRoot(){
      var body = document.body || document.documentElement;
      var root = body;
      for (;;) {
        var only = null, count = 0, filling = null;
        for (var c = root.firstElementChild; c; c = c.nextElementSibling) {
          if (isUi(c) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK|META)$/.test(c.tagName)) continue;
          if (!c.getClientRects().length && boxed(c)) continue; // no box: display:none
          if (boxed(c) && !c.offsetWidth && !c.offsetHeight) continue; // an empty portal root
          only = c; count++;
          if (!filling && sameSize(c, body)) filling = c;
        }
        var next = filling || (count === 1 ? only : null);
        if (!next) return root;
        root = next;
      }
    }
    // The root is picked only when it is smaller than the body (a single
    // centred column), and then only by a click on its own padding.
    function pickableRoot(root){
      var body = document.body || document.documentElement;
      return root !== body && !sameSize(root, body);
    }
    // The outermost boxed element strictly inside level on t's ancestor path.
    function childOf(level, t){
      if (!level || t === level || !level.contains(t)) return null;
      var hit = null;
      for (var n = t; n && n !== level; n = n.parentElement) if (boxed(n)) hit = n;
      return hit;
    }
    // What a plain click on t picks: its element at the current level, else
    // at the top level, else the root itself when the click is on its padding.
    function pickAt(t){
      if (!t) return null;
      var root = pageRoot();
      var level = scope && scope.isConnected && root.contains(scope) ? scope : root;
      var hit = childOf(level, t);
      if (!hit && level !== root) hit = childOf(root, t);
      return hit || (t === root && pickableRoot(root) ? root : null);
    }
    // The nearest boxed ancestor: the level a pick's siblings sit on.
    function levelOf(el){
      for (var p = el.parentElement; p; p = p.parentElement) if (boxed(p)) return p;
      return null;
    }
    // A click's place in its burst: clicks within 500ms and 16px of the last
    // continue it (MouseEvent.detail stops at 3; see countClick on the canvas).
    var burst = { count: 0, at: 0, x: 0, y: 0 };
    function countClick(x, y){
      var now = Date.now();
      burst.count = now - burst.at < 500 && Math.hypot(x - burst.x, y - burst.y) <= 16 ? burst.count + 1 : 1;
      burst.at = now; burst.x = x; burst.y = y;
      return burst.count;
    }

    // ⌘ held: the deepest element under the cursor, whatever the level (the
    // canvas's ⌘-select). Read off pointer events, and keys while the page has focus.
    var deep = false;
    function setDeep(on){
      if (deep === on) return;
      deep = on;
      if (enabled) send('meta', on);
      if (!raf) raf = requestAnimationFrame(paintHover);
    }
    function pickFor(t){ return deep ? t : pickAt(t); }

    var raf = 0, lastMove = null;
    function paintHover(){
      raf = 0;
      if (!enabled || !lastMove || !(capture || lastMove.overlay)) { hov.style.display = 'none'; return; }
      var el = pickFor(targetAt(lastMove.x, lastMove.y));
      if (!el || el === selected) { hov.style.display = 'none'; return; }
      place(hov, el);
    }
    function payloadFor(el){
      if (!el) return Promise.resolve(null);
      return inPage(el, PAGE_CLIPBOARD).then(function(text){ return typeof text === 'string' ? text : null; });
    }
    // navigator.clipboard is missing outside secure contexts (a dev server on a LAN IP).
    function writeClipboard(text){
      var api = navigator.clipboard;
      return (api ? api.writeText(text) : Promise.reject(new Error('no clipboard'))).catch(function(){
        var ta = document.createElement('textarea');
        ta.setAttribute(UI, '');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px';
        document.documentElement.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        ta.remove();
        if (!ok) throw new Error('copy');
      });
    }
    function copy(el){
      payloadFor(el).then(function(text){ if (!text) throw new Error('capture'); return writeClipboard(text); })
        .then(function(){ send('copied'); }, function(){ send('copyFailed'); });
    }
    // The box last reported for the pick: a re-report of the same box (a
    // ticking clock elsewhere on the page) sends nothing.
    var selBox = '';
    function setSelected(el, refresh){
      selected = el;
      if (!el) { scope = null; selBox = ''; sel.style.display = 'none'; send('select', null); return; }
      if (!refresh) scope = levelOf(el);
      var r = place(sel, el);
      var key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
      if (refresh && key === selBox) return;
      selBox = key;
      hov.style.display = 'none';
      send('select', describe(el).then(function(d){
        if (refresh) d.refresh = true; // re-reporting, not a new pick
        return d;
      }));
    }
    // A first Esc lets go of a pick; with nothing picked it steps out.
    function escape(){
      if (drag) { drag = null; send('dragCancel'); return; }
      if (selected) { setSelected(null); return; }
      send('exit');
    }

    // The canvas's own gestures over the page: space-drag (when the page isn't
    // in use) and middle-drag pan it, pinch and ⌘-wheel zoom it.
    var spaceHeld = false;
    var pan = null; // { x, y }
    // Pinch and ⌘-wheel zoom the canvas in every mode; a plain wheel scrolls the page.
    // A plain wheel over a page with nothing to scroll that way pans the
    // canvas, as it would anywhere else on it.
    function onWheel(e){
      if (!e.isTrusted) return;
      if (!(e.ctrlKey || e.metaKey)) {
        var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
        if (scrollsAt(e.clientX, e.clientY, Math.abs(e.deltaY) >= Math.abs(e.deltaX))) return;
        e.preventDefault(); e.stopPropagation();
        send('pan', { x: -e.deltaX * unit, y: -e.deltaY * unit });
        return;
      }
      e.preventDefault(); e.stopPropagation();
      send('wheel', { dy: e.deltaY, x: e.clientX, y: e.clientY });
    }
    function scrollRange(el, vertical){
      var cs = window.getComputedStyle(el);
      var overflow = vertical ? cs.overflowY : cs.overflowX;
      if (overflow !== 'auto' && overflow !== 'scroll' && overflow !== 'overlay') return 0;
      return vertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
    }
    function pageScrolls(vertical){
      var page = document.scrollingElement || document.documentElement;
      var range = vertical ? page.scrollHeight - page.clientHeight : page.scrollWidth - page.clientWidth;
      var bodyCS = window.getComputedStyle(document.body);
      var htmlCS = window.getComputedStyle(document.documentElement);
      var clipped = (vertical ? [bodyCS.overflowY, htmlCS.overflowY] : [bodyCS.overflowX, htmlCS.overflowX]).indexOf('hidden') !== -1;
      return range > 0 && !clipped;
    }
    // Whether anything under (x, y) scrolls on that axis at all (at its end or not).
    function scrollsAt(x, y, vertical){
      var page = document.scrollingElement || document.documentElement;
      for (var n = targetAt(x, y); n && n !== page && n !== document.body; n = n.parentElement) {
        if (scrollRange(n, vertical) > 0) return true;
      }
      return pageScrolls(vertical);
    }
    // The page element under a left press the preview keeps from the page
    // (Capture, or a static preview), else null.
    function pressTarget(e){
      if (!enabled || e.button !== 0 || (interactive && !capture)) return null;
      return targetAt(e.clientX, e.clientY);
    }
    // Capture: a press-drag pulls the pick out; the host runs the drag.
    var drag = null; // { el, x, y, started }
    function onDown(e){
      // A middle-drag pans the canvas in every mode, like anywhere else on it;
      // space-drag does when the page isn't in use.
      if (e.button === 1 || (enabled && !interactive && e.button === 0 && spaceHeld)) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        // Screen px: the page moves with the canvas as it pans, so a delta in
        // its own coordinates would fight the pan it just caused.
        if (e.isTrusted) pan = { x: e.screenX, y: e.screenY };
        return;
      }
      var t = pressTarget(e); if (!t) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if (!capture || !e.isTrusted) return;
      // The pick is made on click, or when the press becomes a drag: the pick
      // when pressing inside it, else what the capture outline shows.
      setDeep(primary(e));
      var el = deep ? t : (selected && selected.contains(t)) ? selected : pickAt(t);
      if (el) drag = { el: el, x: e.clientX, y: e.clientY, started: false };
    }
    // The rest of a press the preview keeps goes no further either: a menu
    // that opens on pointerdown must not open on a Capture click. pointerdown
    // is not prevented, or mousedown would never fire.
    function onPointerPress(e){ if (pressTarget(e)) { e.stopPropagation(); e.stopImmediatePropagation(); } }
    function onMove(e){
      if (!e.isTrusted) return;
      showThumb();
      if (pan) {
        send('pan', { x: e.screenX - pan.x, y: e.screenY - pan.y });
        pan = { x: e.screenX, y: e.screenY };
        return;
      }
      if (!enabled) return;
      if (capture && !captureCursor) setCaptureCursor(true);
      if (drag) {
        if (!drag.started) {
          if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return;
          drag.started = true;
          var el = drag.el;
          if (el !== selected) setSelected(el);
          var r = el.getBoundingClientRect();
          var start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top, width: r.width, height: r.height };
          window.__lgPick.pending = inPage(el, PAGE_CAPTURE).catch(function(){ return null; });
          send('dragStart', fiberOf(el).then(function(f){
            start.label = ((f && f.componentName) || el.tagName.toLowerCase()) + '  ' + Math.round(r.width) + ' \\u00d7 ' + Math.round(r.height);
            return start;
          }));
        }
        send('dragMove', { x: e.clientX, y: e.clientY });
        return;
      }
      lastMove = { x: e.clientX, y: e.clientY };
      setDeep(primary(e));
      if (!raf) raf = requestAnimationFrame(paintHover);
    }
    function onUp(e){
      if (!e.isTrusted) return;
      if (pan) { pan = null; e.preventDefault(); e.stopPropagation(); return; }
      var d = drag; drag = null;
      if (d && d.started) {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        send('dragEnd', { x: e.clientX, y: e.clientY });
        // The pull-out is the pick's purpose: let go of it and step out.
        setSelected(null); send('exit');
        return;
      }
      onPointerPress(e);
    }
    function onClick(e){
      if (!enabled) return;
      var t = targetAt(e.clientX, e.clientY);
      if (!t) return;
      if (interactive && !capture) { if (selected && e.isTrusted) setSelected(null); return; } // the page's click; a pick lets go
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if (!capture || !e.isTrusted) return; // outside Capture a click never picks
      // A further click of a burst inside the pick goes one level into it.
      var burstClick = countClick(e.clientX, e.clientY) >= 2;
      setDeep(primary(e));
      var inner = !deep && burstClick && selected ? childOf(selected, t) : null;
      var next = inner || pickFor(t);
      if (next && next !== selected) setSelected(next);
    }
    function onKey(e){
      if (!e.isTrusted) return;
      if (e.key === PRIMARY_KEY) setDeep(true);
      // ⌘L adds the pick (or the preview) to the chat, from a page field too,
      // as it does with the editor focused. The host window never sees this key.
      if (primary(e) && !e.altKey && !e.shiftKey && e.code === 'KeyL') {
        e.preventDefault(); e.stopPropagation();
        if (!e.repeat) send('addToChat');
        return;
      }
      if (!enabled) return;
      var target = e.target;
      var typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (typing) return;
      if (!interactive && e.code === 'Space' && !e.repeat) { spaceHeld = true; e.preventDefault(); return; }
      var cmd = primary(e);
      // I switches the tool, as it does with the editor focused. In Capture the
      // page gets no clicks, so a key pressed here is not the page's.
      if (capture && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && e.code === 'KeyI') {
        e.preventDefault(); e.stopPropagation();
        if (!e.repeat) send('toggleTool');
        return;
      }
      // ⌘C copies the pick (picks are made in Capture), unless page text is selected.
      if (cmd && !e.altKey && !e.shiftKey && e.code === 'KeyC' && selected && !String(window.getSelection() || '')) {
        e.preventDefault(); e.stopPropagation();
        copy(selected);
        return;
      }
      if (e.key !== 'Escape') return;
      if (interactive && !selected && !drag) return; // the page's Escape
      e.preventDefault(); e.stopPropagation();
      escape();
      send('escape');
    }
    // The release of a middle-drag would be the page's middle click (a link opens in a new window).
    function onAuxClick(e){ if (e.button === 1) { e.preventDefault(); e.stopPropagation(); } }
    function onKeyUp(e){
      if (!e.isTrusted) return;
      if (e.code === 'Space') { spaceHeld = false; pan = null; }
      if (e.key === PRIMARY_KEY) setDeep(false);
    }
    function onBlur(){
      spaceHeld = false; pan = null; lastMove = null; setDeep(false); hov.style.display = 'none';
      if (drag) { drag = null; send('dragCancel'); }
    }
    function onLeave(){ hov.style.display = 'none'; }
    // A scroll re-reports the pick at most once a frame.
    var scrollRaf = 0;
    function onScroll(){
      if (selected && !scrollRaf) scrollRaf = requestAnimationFrame(function(){ scrollRaf = 0; if (selected) setSelected(selected, true); });
      if (!raf) raf = requestAnimationFrame(paintHover);
      showThumb();
    }
    // The page re-rendered or navigated within itself: a pick whose element is
    // gone is gone too, and one that moved is re-outlined. Marking an element
    // for the page's world is not a change.
    var mutRaf = 0;
    var observer = new MutationObserver(function(mutations){
      if (mutRaf || !selected || !mutations.some(function(m){ return m.attributeName !== MARK && !isUi(m.target.nodeType === 1 ? m.target : m.target.parentElement); })) return;
      mutRaf = requestAnimationFrame(function(){
        mutRaf = 0;
        if (!selected) return;
        if (!selected.isConnected) { setSelected(null); return; }
        setSelected(selected, true);
      });
    });
    try { observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true }); } catch (e) {}
    document.addEventListener('pointerdown', onPointerPress, true);
    document.addEventListener('pointerup', onPointerPress, true);
    document.addEventListener('mousedown', onDown, true);
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onAuxClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('keyup', onKeyUp, true);
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    document.addEventListener('mouseleave', onLeave, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    window.addEventListener('blur', onBlur);
    window.__lgPick = {
      pending: null,
      get selected(){ return selected; },
      setInteractive: function(on){ interactive = !!on; if (!raf) raf = requestAnimationFrame(paintHover); paintThumb(); },
      setCapture: function(on){
        capture = !!on; if (!capture) setCaptureCursor(false); paintThumb();
        if (lastMove) lastMove.deep = capture;
        if (!raf) raf = requestAnimationFrame(paintHover);
      },
      setEnabled: function(on){ enabled = !!on; if (!enabled) setCaptureCursor(false); if (!enabled) { onBlur(); if (selected) setSelected(null); } },
      // The editor had focus on Enter: it writes the clipboard itself.
      copyPayload: function(){ return payloadFor(selected); },
      // The pick's snapshot, or null with nothing picked.
      capturePick: function(){ return selected ? inPage(selected, PAGE_CAPTURE) : Promise.resolve(null); },
      setZoom: function(k){ zoom = k > 0 ? k : 1; applyZoom(); },
      clearSelection: function(){ if (selected) setSelected(null); },
      // The host overlay over a static preview: ⌘-hover outlines and ⌘-click
      // picks the deepest element under the point (guest client px).
      hoverDeepAt: function(x, y){
        if (!enabled) return;
        lastMove = { x: x, y: y, overlay: true };
        deep = true;
        if (!raf) raf = requestAnimationFrame(paintHover);
      },
      clearHover: function(){ if (lastMove && lastMove.overlay) { lastMove = null; hov.style.display = 'none'; } },
      pickDeepAt: function(x, y){
        if (!enabled) return;
        var t = targetAt(x, y);
        if (t && t !== selected) setSelected(t);
      },
      escape: escape,
      cancelDrag: function(){ drag = null; pan = null; },
      cleanup: function(){
        document.removeEventListener('pointerdown', onPointerPress, true);
        document.removeEventListener('pointerup', onPointerPress, true);
        document.removeEventListener('mousedown', onDown, true);
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup', onUp, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('auxclick', onAuxClick, true);
        document.removeEventListener('keydown', onKey, true);
        document.removeEventListener('keyup', onKeyUp, true);
        document.removeEventListener('wheel', onWheel, true);
        document.removeEventListener('mouseleave', onLeave, true);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onScroll);
        window.removeEventListener('blur', onBlur);
        if (raf) cancelAnimationFrame(raf);
        if (mutRaf) cancelAnimationFrame(mutRaf);
        if (scrollRaf) cancelAnimationFrame(scrollRaf);
        observer.disconnect();
        hov.remove(); sel.remove(); setCaptureCursor(false);
        clearTimeout(thumbHide); if (thumbRaf) cancelAnimationFrame(thumbRaf); thumb.remove(); hideNativeBar.remove();
        window.__lgPick = null;
      }
    };
  } catch (e) { /* guest not ready */ }
})()`;
}

export { GUEST_FINGERPRINT_SRC, PAGE_SOURCE_AT, buildPickScript, buildSnapshotScript };
