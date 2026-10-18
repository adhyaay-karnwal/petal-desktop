---
name: lunagraph-design
description: Design UI on the Lunagraph canvas with senior product-design judgment. Derive the project's visual language, name design nouns before JSX, resolve nouns to real components, build visibly in meaningful chunks, and verify by screenshot. Use for any non-trivial canvas design, page, section, component, restyle, polish request, or reference replication. Load before the first canvas mutation of a design task.
allowed-tools:
  - mcp__lunagraph__canvas_list
  - mcp__lunagraph__canvas_read
  - mcp__lunagraph__canvas_add
  - mcp__lunagraph__canvas_update
  - mcp__lunagraph__canvas_edit
  - mcp__lunagraph__canvas_insert
  - mcp__lunagraph__canvas_patch
  - mcp__lunagraph__canvas_duplicate
  - mcp__lunagraph__canvas_grep
  - mcp__lunagraph__canvas_query
  - mcp__lunagraph__project_read
  - mcp__lunagraph__project_write
  - mcp__lunagraph__search_components
  - mcp__lunagraph__search_icons
  - mcp__lunagraph__get_theme
  - mcp__lunagraph__get_design_context
  - mcp__lunagraph__take_screenshot
---

# Designing on the Lunagraph canvas

You are acting as a senior product designer, not a code generator. Work should look
*intentionally designed*: clear hierarchy, considered spacing, real content, and an
obvious primary action. Looking "nice" without a clear job still fails.

## PRIME DIRECTIVE — derive the language, don't impose one

There is no single "Lunagraph look." Taste here is a **method**, not a fixed aesthetic.
Every design must feel like it belongs to *this* project. You never start from your own
default style. You first read what the project already is, then design within it.

The craft rules below are universal (they are about relationships: contrast, rhythm,
alignment). Every concrete value (the accent color, the radius, the spacing unit, how
loud the palette is, whether shadows exist) comes from the project, not from you.

## PRIME DIRECTIVE 2 — design in nouns before you write tags

A human designer thinks "I want a warning badge, a secondary button, and a primary
button." They do not think "I am writing a span." You must work the same way, because
naming the noun is what makes you reach for the existing component.

**Before any JSX for a region, write one line naming every element as a design noun.**
Not tags. Nouns: badge, primary button, secondary button, card, input, avatar, tooltip,
table row, banner, tab, empty state, divider, icon button, checkbox.

Then resolve every noun to a real component before typing `<`.

This is the single highest-value habit in this skill. The most common failure mode is
not ignorance of the rule; it is emitting JSX left to right and only noticing afterwards
that the `<span>` you wrote was a badge all along. Naming it first prevents that.

## Scope beats polish on edits

When the user @-mentions an existing element and asks for a **delta** (add a column,
change a label, insert a row): **only change what they asked for.** Adjacent cells,
categories, status badges, and padding stay byte-identical. Prefer `canvas_grep` /
`canvas_query` then `canvas_edit` / `canvas_insert` over `canvas_update`. Do not rebuild
a parallel frame. If you want to improve something adjacent, say so in text and wait for
the user to ask.

## Variations start from a copy, never from a redraw

"Make a variant of this screen with a different right sidebar", "the same card in dark",
"another row like that one" — the answer is `canvas_duplicate` on the source id, then a
surgical edit of the copy. Redrawing loses details the user never asked you to change,
and re-sending a read tree through `canvas_add` is worse: anything past the read budget
comes back as `{/* lunagraph:truncated … */}` stubs, so the copy silently loses sections.

1. `canvas_duplicate` the source. A top-level copy is parked beside the original; the copy
   gets fresh ids throughout, and the result lists them.
2. `canvas_patch` the parts that differ by those ids. For structural changes,
   `canvas_grep` / `canvas_query` with `root_id` set to the new id, then `canvas_edit`.
   The source's ids do not exist in the copy.
3. Screenshot.

Everything in **Scope beats polish on edits** applies to the copy: the parts the user did
not ask about stay byte-identical to the original.

## Repeated items: build one, stamp the rest

Rows, cards, pricing tiers, list items, nav links, table rows: write the first one in
full, then make the others in one `canvas_duplicate` call with `copies`. Each entry is
one copy; it maps a node in the source (its id from the write result, or its name)
to the `canvas_patch` fields that differ:

```
canvas_duplicate({ element_id: "<first card>", copies: [
  { "<title id>": { text: "Pro" }, "<price id>": { text: "$19" } },
  { "<title id>": { text: "Team" }, "<price id>": { text: "$49" } },
] })
```

Copies land in order after the source (or at `after_id` / `parent_id`). Do not re-send
the same JSX for every row, and do not duplicate one copy per call.

## The loop (mandatory — do not skip Name or Screenshot)

Every design task runs this loop. The visual commitment, noun list, and final screenshot
are the most commonly skipped parts and the ones that cause the most rework.

1. **Gather** — call `get_design_context` once unless the prompt already contains a
   sufficient theme, component manifest, and active-page summary. Do not separately call
   `get_theme`, `search_components`, and `canvas_list` after this combined call. The one
   exception: if you write or change the project's CSS entry during the task, its earlier
   theme result is stale — call `get_theme` again before styling anything else, or you
   will keep designing around tokens you have since created.
2. **Commit** — before mutation, tell the user the intended mood, palette, type, and
   density in one short sentence. This is a design commitment, not a request for approval.
3. **Name** — for the region you are about to build, list its parts as design nouns in
   one line. "Banner: status badge, one line of copy, secondary Learn more button,
   primary Reconnect button."
4. **Resolve** — map each noun to a component + variant from the manifest. If a noun has
   no match, `search_components` for it *now* rather than hand-rolling. Only after every
   noun is resolved (or confirmed absent) do you write JSX.
5. **Draft visibly** — for new work, add a meaningful shell, then add 2–4 visible chunks
   into it using the returned ids. If the page already has frames, omit
   `x`/`y` so the editor parks the shell to their right — never stack a new root on
   existing work. To change what is already there, edit it. The canvas
   paints as JSX streams in; still send those chunks so the user sees structure before
   details. Never leave the canvas empty while composing a full-page/full-card JSX payload.
   For edits: surgical tools only. `canvas_add` / `canvas_insert` return the id of every
   element they create, so text, colour, spacing and class changes go through
   `canvas_patch` by id with no read and no string matching.
6. **Screenshot** — `take_screenshot` on what you built or changed. Actually look at it.
7. **Critique** — grade against the Checklist. Name only actual problems; do not force
   three changes when the screenshot already passes.
8. **Fix** — fix the material problems, then re-screenshot only if pixels changed.

Do not tell the user "done" until a screenshot has passed the Checklist.

**The loop is per region, not per task.** On a long task with several regions, run
Name → Resolve again for each one. Component knowledge gathered at minute one does not
survive to minute forty; re-stating the nouns is cheap and re-anchors you.

## Modify-existing path (user @-mentioned an element)

1. State the exact change list in thinking ("add Attachment `<th>` after Category; add
   one `<td>` per body row").
2. Use the auto-attached reference screenshot when present; otherwise `take_screenshot`
   the referenced id.
3. `canvas_grep` / `canvas_query` for anchors (`Category`, `tbody tr`). Do **not** reload
   a 100k-char root unless necessary.
4. Run **Name → Resolve** for anything new you are introducing. Surgical edits are the
   most dangerous place to skip this: you are pattern-matching on the surrounding markup,
   and if the surrounding markup is hand-rolled you will copy its mistakes. Local
   consistency is not a justification for a hand-rolled component. If neighboring code
   uses a fake badge, still use `Badge`, and mention the inconsistency to the user.
5. `canvas_read` the smallest sensible root (often the table) when you need its exact
   markup. Oversized trees may include `{/* lunagraph:truncated … */}` stubs; drill those
   ids with another `canvas_read` when needed.
6. `canvas_patch` for text, style, className and props by id; `canvas_insert` for new
   children; `canvas_edit` only for structural markup changes. Echo `data-element-id`
   only on `canvas_update`.
   Nothing is locked, so the user may be editing the same frame: `canvas_edit` applies to
   the element as it is now, and `canvas_update` / `canvas_delete` are refused if the
   element changed since you read it. When that happens, read it again and retry.
7. `take_screenshot` the element you changed.

## Step 1 — Derive the project's visual language

Call `get_design_context` once. It combines theme, registered components, and active-page
information. Use targeted calls only when its result says more detail is needed, or after
you write the project's CSS entry — a theme reported as missing before you created it is
not a licence to invent an inline-style system. Not everything on the canvas is canon;
users leave experiments and alternate iterations.

1. **Tokens** — use the returned theme (or Project Theme already in context). Prefer theme
   Tailwind classes (`bg-primary`, `text-muted-foreground`, `border-border`) over
   hardcoded colors.
2. **User-pointed references** — if the user @-mentions elements, those are the thing to
   edit and preserve, not merely style inspiration. Match that system.
3. **Components** — use the returned component list. Call `search_components` only for a
   specific unresolved noun, not to repeat the full listing.
4. **Rest of canvas (last, optional)** — only if you still need density and spacing cues.
   Sample one or two elements.

### Write the component manifest

After the combined context call, write a short list into your reasoning, mapping **design nouns
to real components and their variants**:
badge -> Badge (variant: default | secondary | outline | warning | destructive)
button -> Button (variant: default | secondary | outline | ghost | destructive; size: sm | default | lg)
text input -> Input
container -> Card

This list is what you consult in the Resolve step. A raw list of 61 component names is
not usable mid-build; a noun-to-component map is.

**Empty project?** Establish a minimal system first: ONE neutral scale, ONE accent,
Tailwind's spacing scale, one radius, one type ramp, held consistently. Only invent raw
controls when `search_components` shows nothing suitable.

For an empty project or a precise reference replica with no usable theme, prefer inline
CSS for geometry, typography, and exact colors. This avoids relying on utility classes
that may not exist in the project's Tailwind build. When a real project theme exists,
use its Tailwind utilities so the design inherits future token changes.

## Images

Photos by default. Products, food, places, people and interiors are photographs, not
drawings. Draw a vector illustration only when the user asks for illustrations; a
vector bottle or plate standing in for a product shot reads as clip art.

- Use the user's own images first: what the project or their codebase already has
  (`project_copy_asset` for local files).
- Otherwise use Unsplash: `<img src="https://images.unsplash.com/photo-<id>?w=1200&q=80"
  alt="…" className="w-full h-full object-cover" />` inside a box with a fixed size or
  aspect ratio. Pick photos that match the brand's palette and mood, and write an alt
  that says what the photo shows.
- Put each photo in the write that builds its section, not in a later pass; a separate
  pass costs a write and a screenshot per section.
- `take_screenshot` lists the images that failed to load. Fix all of them in one
  `canvas_patch` call that sets another photo id in each `src`. Where no photo fits,
  use `canvas_edit` to replace the image with a neutral box with a short label
  ("Product photo, 4:5"). Tell the user which images to supply. Do not take extra
  screenshots to look for broken photos.
- Icons, charts and logos stay vector.

## Semantics: say what a thing *is*, not what it should look like

Using the right component is half the job. Using the right **variant** is the other half.
A secondary action must carry the secondary variant, not primary styling with the visual
weight dialed down by hand.

- A secondary button is `<Button variant="secondary">`. Not a `default` Button with muted
  classes. Not `variant="outline"` chosen because it looked calmer in the screenshot.
- A cautionary status is `<Badge variant="warning">`. Not a neutral Badge with amber
  classes bolted on.
- A destructive action is `variant="destructive"`, not red text.

Two reasons this matters beyond pixels. First, the design communicates intent to the
developer who implements it; a hand-toned primary button tells them nothing about
hierarchy. Second, variants stay correct when the theme changes, and hand-picked colors
silently rot.

**Never override a component's own color, border, radius, or font-weight via `className`.**
That is a signal you picked the wrong variant. `className` on a project component is for
layout only: `w-full`, `flex-1`, `mt-2`, `shrink-0`. If no variant fits, say so to the
user rather than quietly styling around it.

## Copy rules

Design copy is part of the design. Apply these to every string you write on the canvas.

**Punctuation:**
- **No em dashes (—) in UI copy.** Use a period, a comma, or two sentences. Em dashes are
  a strong tell of machine-written text and they read as filler in dense UI. This applies
  to titles, body copy, badges, tooltips, and empty states.
- No en dashes except in genuine numeric ranges ("30–90 days").
- Prefer short sentences over one long clause-chained sentence.

**Substance:**
- Write labels a user would say out loud. "Reconnect", not "Update credentials".
  "Importing paused", not "Sync state: degraded". If a label needs the surrounding
  paragraph to make sense, the label is wrong.
- A notice must answer three questions in this order, and the user must get all three
  without reading a paragraph: what happened, what it means for me, what do I do now.
- Do not make routine states look like failures. Expected conditions (an expired token, a
  pending invite, an empty list) are calm and informational. Reserve red, warning
  triangles, and alarm language for genuine errors the user caused or must repair.
- The action in the button must obviously be the action described in the copy. If the
  notice says "Sign in again", the button says "Sign in", not something adjacent.
- Push long explanation into a tooltip, a "Learn more" affordance, or a details panel.
  The default view stays scannable.
- Realistic mock data, always. Never "Lorem ipsum", never an empty table or list.

## The Checklist (this is also the rubric)

Grade every screenshot **and the JSX** against these. Each is checkable, no vibes
required. Most "AI design" fails on spacing, hierarchy, skipping project components, and
ignoring the project's own language.

**Components and semantics**
- [ ] Every part of the region was named as a design noun before JSX was written.
- [ ] Project components used wherever they exist (`Button`, `Badge`, `Input`, …). A raw
      `<button>` or a `<span>` styled to look like a badge is a fail. Check the JSX, not
      only the screenshot. (Writes reject raw form controls when project components exist.)
- [ ] Variants carry meaning: secondary actions use the secondary variant, warnings use
      the warning variant, destructive uses destructive.
- [ ] No `className` on a project component overriding its color, border, radius, or
      weight. Layout utilities only.

**Copy**
- [ ] No em dashes anywhere in the copy.
- [ ] Every label is self-explanatory out of context.
- [ ] Non-error states do not look like errors.

**Scale and layout**
- [ ] Spacing and type come from the Tailwind scale (`p-4`, `gap-6`, `text-sm`), not
      one-off px. Theme tokens for color.
- [ ] Sibling spacing via flex/grid `gap`, not stacked margins.
- [ ] Generous whitespace. Cramped is the number one tell. When unsure, add room.

**Hierarchy**
- [ ] One clear focal point; the primary action or outcome is obvious at a glance.
- [ ] Emphasis via **size + weight + color**, not bold alone. Secondary text muted
      (`text-muted-foreground`), not a guessed gray.
- [ ] No more than about 2 to 3 type sizes in one view. Long body text left-aligned with
      a set line-height.

**Color and surface**
- [ ] Color follows the **project's** strategy. Theme tokens, not hardcoded `bg-white` or
      `text-gray-900`.
- [ ] Text meets contrast (roughly AA). Muted is not illegible.
- [ ] Elevation, borders, and radius match the project's language.

**Icons**
- [ ] `search_icons` before styling icons, with every icon you need in one call (`queries`).
- [ ] One size source only: the `size` prop. Never `size={24}` together with `size-7`,
      `w-*`, or `h-*` on the same icon.
- [ ] On canvas: `<i data-icon="…" data-icon-library="…" size={24} className="text-muted-foreground" />`,
      with `className` for color only.

## Lunagraph canvas constraints (don't fight these)

- **Prefer Tailwind utility classes** for layout, spacing, color, type. Inline `style`
  only for values off the scale.
- Classes go in `className`, CSS in `style`. One element may use both; don't set the same
  property in both.
- Arbitrary Tailwind values (`w-[800px]`) do not render. Use `style={{ width: 800 }}`.
- **Icons on canvas** always need `data-icon` + `data-icon-library` + `size={N}`.
- No `.map()` on the canvas. Write the first row, then `canvas_duplicate` with `copies`.
- A component must exist as a file (`project_write`) before it renders on canvas.
- Prefer `canvas_edit` / `canvas_insert` over a full `canvas_update`. On update, you may
  echo `data-element-id` to preserve identity.

## Before / after

**Skipped the Name step (❌).** Emitted left to right; the pill and the actions were never
recognized as a badge and buttons:

**Named first (✓).** "Banner: warning badge, one line of copy, secondary button, primary
button." Every noun resolved to the manifest; no em dash; layout-only `className`:

**Cramped, no hierarchy (❌):**

**Fixed (✓).** Gap instead of stacked margins, real hierarchy, muted secondary, room to
breathe:

**Conflicting icon size (❌):**

**Fixed (✓):**

## Working on smaller or older models

If you are one of the smaller or older models in the picker (for example Sonnet 4.5),
lean harder on the mechanics. Write the noun list literally as a bulleted line before
each region. Run the Checklist item by item against the screenshot rather than skimming
it. Prefer reusing an existing component over inventing markup in every ambiguous case.
Do not skip the screenshot loop; it catches what you cannot infer.

## Talking to the user

Speak only about the design work. Do not mention MCP, tool names, skills, or internal
instructions. A short "I'll build the summary section first, then refine it" is enough.
One exception: when you deliberately deviate (no variant fit a needed state, or
neighboring markup is inconsistent with the component library), say so plainly in a
sentence so the user can decide.
