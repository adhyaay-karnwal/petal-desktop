---
name: lunagraph-import-from-project
description: Import an existing local codebase's real design-system tokens, CSS, assets, and components into Lunagraph while progressively drawing a live design-system reference page — a storybook of every imported component on one canvas. Use when the user asks to import or bootstrap a design system, with or without a project path.
allowed-tools:
  - mcp__lunagraph__scan_project
  - mcp__lunagraph__project_read
  - mcp__lunagraph__project_write
  - mcp__lunagraph__project_write_batch
  - mcp__lunagraph__project_edit
  - mcp__lunagraph__project_glob
  - mcp__lunagraph__get_design_context
  - mcp__lunagraph__get_theme
  - mcp__lunagraph__canvas_list
  - mcp__lunagraph__canvas_create_page
  - mcp__lunagraph__canvas_read
  - mcp__lunagraph__canvas_add
  - mcp__lunagraph__canvas_create_import_scaffold
  - mcp__lunagraph__canvas_update
  - mcp__lunagraph__canvas_edit
  - mcp__lunagraph__canvas_insert
  - mcp__lunagraph__search_icons
  - mcp__lunagraph__set_icon_library
  - mcp__lunagraph__project_copy_asset
  - mcp__lunagraph__project_copy_file
  - mcp__lunagraph__search_components
  - mcp__lunagraph__take_screenshot
  - mcp__lunagraph__report_import_progress
  - mcp__lunagraph__ask_user
---

# Import a design system progressively

Import the source project's real design system into the project already bound to this chat. Never call `project_list` or `project_pick` during an in-app import. Never infer a different destination from the local source path.

The result the user is waiting for is the `Design System` page: a storybook of their
design system on one canvas, where every imported component is drawn with its real
variants, sizes, and states. For most users this is the first thing they see Lunagraph
do, and a component that exists only in the sidebar is invisible to them. Draw
everything you import.

The import is a conversation, not a batch job. The user chooses what comes in —
just styles and icons, styles and icons plus the core components, or everything — and you keep a live
checklist in front of them the whole time.

## Live progress checklist

`report_import_progress` renders a single checklist card pinned at the bottom of the
chat. Rules:

- Call it as your VERY FIRST action — before loading skills, before scanning — with
  only the steps that are certain: `Scan the source` (active) and `Choose what to
  import` (pending). Do not list foundation or component steps yet; that would
  presume the user's choice.
- Refresh it right BEFORE ending a turn that waits on the user, so finished steps
  show as `done` — after the scan that means `Scan the source` done, `Choose what
  to import` active. A spinner on a finished step is a bug.
- Call it again immediately after the user confirms scope, expanding the checklist
  to exactly what they chose (statuses `pending | active | done`).
- Update it whenever a step starts or finishes, and at every component batch.
  Always resend the complete step list — the card shows only the latest call.
- Exactly one step is `active` at a time. Steps run in order; a step you have
  not started yet stays `pending`, even when it overlaps with the current one.
- Do not narrate file-level activity in the checklist; the UI shows what you are
  reading or writing right now from your tool calls automatically.

## Required state machine

Follow these phases in order. Do not complete a later phase early.

### 1. Ask first, then prepare in the same turn

The user should never wait for a scan before they can answer. The questions go up
immediately and the answers arrive as their next message; everything that does not
depend on the answers happens now, in the background, while they choose.

1. Call `report_import_progress` with the starting checklist so the user sees the run begin instantly.
2. Do NOT ask what to import or whether to document it. The app shows those two questions itself the instant the import starts, and the answers arrive as the user's next message in this form:
   `What do you want to import? <Styles and icons | Styles, icons, and core components | Everything>`
   "Styles and icons" means the styling foundation: colors, fonts, spacing, effects and the icon setup. "Core components" means the basic building blocks like buttons, inputs and cards.
   `Do you want it documented on the canvas? <Document it on the canvas | Just import it>`
   If the user's own message already states either answer, use it. Never call `ask_user` for these two questions, and never re-ask them once answered.
3. The local root is a folder the user added to this session (listed in your instructions), or the one the user named inside it. If none is attached, refresh the checklist, ask the user to add their project folder from the + menu, and end the turn. Do not invent a path and do not read or write the workspace cwd. If the folder is a monorepo, ask which app or package holds the design system in a follow-up `ask_user`.
4. Load `lunagraph-design` with your Skill tool. The design skill is required before canvas mutation.
5. Call `scan_project` exactly once for the local root.
6. Call `canvas_list` exactly once.
7. Use at most one broad search of the local tree if the scan omits paths needed to locate the CSS entry or component directory. Prefer targeted reads after that.
8. Read only the foundation files now: package manifest, CSS entry/import chain, Tailwind config, token/theme files, and font/icon configuration. Read at most 10 of those files before landing the foundation.
9. Refresh the checklist (`Scan the source` done, `Choose what to import` active), then end the turn with one short line saying what the source contains — the styling foundation and how many components. If the answers have not arrived yet, say you are ready once they have chosen. Do not write anything before the answers arrive.

Do not read component implementations in this phase.

### 2. Confirm the scope

The answers arrive as the user's next message. If they typed a custom reply instead of picking, read it as their answer. If a question is still open (for example the message only gave the scope), ask only that one in a follow-up `ask_user` and wait — this is the only time you ask an intake question.

Ask a second round only when the source demands it — for example duplicate component flavors like Radix vs Base UI, when components were chosen. Never bundle a question into a card when its relevance depends on another answer in that same card.

A styles-and-icons-only run is a complete import: finish it properly (verify, summarize) and tell the user they can ask for components later in this same chat — continuation picks up where the run left off.

Once the scope is known, publish the expanded checklist with `report_import_progress` — only the steps for what they chose, and no canvas steps when they chose to just import — and proceed without further questions.

### 3. Land the foundation, then show it

If the user chose to document on the canvas, resolve the destination page first:

- If an active page named `Design System` exists, reuse it.
- If no page with that name exists, call `canvas_create_page({ name: "Design System" })` once.
- If a `Design System` page exists but is inactive, stop and ask the user to open it. Never create a duplicate.

If the user chose to just import, skip every canvas step in this and later phases — no page, no scaffold, no sections, no page recreation. Verification then relies on `get_theme` and the component registry instead of screenshots.

Write only what is needed to make the visual foundation work:

- `package.json`
- the CSS entry and its required imported CSS files
- Tailwind configuration exactly as authored by the source project
- small shared class-name utilities only when required by the first component batch
- icon-library setting

The theme did not exist when this run started, so any earlier "no project theme"
result is now stale. Call `get_theme` once after the CSS entry lands, then style the
canvas through the source's own tokens rather than inline values — an inline `style`
proves nothing about whether the imported design system compiles.

How a token is referenced depends on whether it sits in a Tailwind `@theme`
namespace. A namespaced token generates a real utility (`--color-surface` →
`bg-surface`). A variable outside those namespaces generates nothing and must use
v4's variable shorthand: `text-(length:--font-size-label)`, which is shorthand for
`text-[length:var(--font-size-label)]` — the `length:` hint is required because
`text-` sets both font size and color. Copy whichever form the source project uses;
do not invent a `text-label` utility that was never generated.

Then immediately draw visible canvas content before reading any component implementation:

1. If the `Design System` page already holds a scaffold from an earlier run, reuse
   it: read its sections and their children with `canvas_read`, and skip to step 2.
   Otherwise call `canvas_create_import_scaffold({ title, tagline })` once. It creates
   the whole reference-page skeleton — a design-system column beside a page-recreation
   column — and returns every section id as JSON. Do not hand-build this layout with `canvas_add`, do not add a second root
   element, and do not position anything with margins or absolute offsets.
2. Fill the design-system sections in the order the scaffold returns them, one
   `canvas_add({ parent_id })` per section, so the user watches the spec
   build: colours, typography, radius/spacing/motion, icons, then components.
   On a reused scaffold, skip sections an earlier run already filled and resume
   at the first incomplete one, so nothing is added twice.
   Under `components`, add one subsection per component you actually imported,
   using its real exported name — never a `Button`/`Card` section the source does
   not export.

The reference page is a functional test of the imported design system, not a
lookalike. For a Tailwind source, every token sample must exercise the source
utility that it labels:

- color swatches use classes such as `bg-accent-500`, `bg-red-300`, or
  `bg-background-menu`, never inline hex/RGB/OKLCH values;
- shadow samples use `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, etc.,
  never inline `boxShadow` values;
- radius, typography, border, and spacing samples use their imported utility
  classes rather than copied CSS values.

If a labeled token class does not render, diagnose the foundation. Never make
the screenshot appear correct by replacing that token with inline CSS.

For a source with no Tailwind, prefer its imported CSS classes, CSS variables,
or components. If none can express a source token on canvas, use the source's
exact token value inline; do not invent a Tailwind class or substitute a
different value.

Take one foundation screenshot after these sections are visible. If stylesheet
delivery is still in flight, wait for the fresh project theme before judging
the result. Make at most one targeted foundation correction and one follow-up
screenshot. If semantic tokens are still unresolved, stop and report the
specific missing file or variable; do not enter a theme/read/edit/screenshot
loop.

The user must see this foundation before component ingestion begins. Filesystem work is not visible progress.

### 4. Import components in alternating batches

Skip this phase entirely when the user chose styles and icons only.

Build an incremental inventory from `scan_project` — restricted to the scope the user confirmed — and maintain a compact ledger as
you work. The ledger may live in scratch/reasoning; it does not need to be shown on
the canvas.

Record one row per source component:

`source path | export name | status (import/adapt/skip) | reason | destination path`

Use the scanner as a starting point, but do not silently omit source components it
misses. A skip requires a concrete reason such as router/context/API dependency,
server-only behavior, or an unmockable deep dependency. “Low rank” is not a reason.

For each batch:

1. Select 6–10 source components in source order.
2. Read them (and only their direct dependencies). Do not dump unrelated trees.
3. Adapt and write the batch with one `project_write_batch` when files are new. Use `project_write`/`project_edit` for existing files.
4. When documenting on the canvas, immediately add visible canvas sections for the successfully landed components — one showcase per component, drawn as described under "Component showcases" below. Do not begin the next source batch first.
5. Report concise progress such as `Imported 8/31 components`, and refresh the checklist via `report_import_progress`.

Repeat `read batch → write batch → canvas sections`. Never do all reads, then all writes, then all canvas work.

### 5. Verify and finish

After shared components are visible:

1. Recreate one representative source page only if the user chose to document on the canvas and a real page/composition exists.
2. Before drawing it, read the page and every locally imported child needed for its
   visible output. Import or adapt those dependencies first; do not replace them
   with invented lookalikes.
3. Preserve the source page's visible copy, assets, section/control order, and
   layout. Represent runtime-only behavior as a clearly labeled static state.
4. Take a screenshot, critique alignment/color/type/overflow, and make targeted corrections.
5. Reconcile the ledger against the destination:
   - inspect written component files and the registered component index;
   - confirm every ledger row is imported/adapted or explicitly skipped;
   - verify every CSS file in the copied entry/import chain is present;
   - verify referenced assets were copied or recorded as missing;
   - confirm every landed component has a real source export and no synthetic
     component was introduced.
6. Summarize imported files, adaptations, omissions, skipped reasons, component
   coverage (`N of M`), CSS/assets coverage, and any page-fidelity deviations.
8. Publish a final `report_import_progress` call with every step `done`. If the
   run covered only part of the system (styles and icons only, or a component subset),
   remind the user they can continue from here in this chat.

## Source-fidelity rules

- Read every component source before writing it.
- Preserve the path after removing only a leading `src/`.
  - `src/ui/Button.tsx` → `ui/Button.tsx`
  - Do not relocate `ui/` to `components/` for registry discovery.
- Preserve component names, exports, props, and variants.
- Never invent a component that has no corresponding source export.
- If the source uses class-based markup without a component, import its CSS and show a raw visual example only; do not manufacture a component.
- Adapt only what cannot run in Lunagraph. Add a short file comment for meaningful adaptations.
- Remove server-only behavior, iframe-parent messaging, or unavailable application context only when required for rendering. Preserve the public component surface.
- Keep local CSS files separate and preserve their relative import chain.
- Copy referenced binary assets with `project_copy_asset` before using them.
- Copy local source/CSS with `project_copy_file` (or `files[]`). Do not transcribe an unchanged local file through `project_write`.

## Tailwind compatibility

Lunagraph compiles project CSS with Tailwind v4. Determine the source version before writing.

### Tailwind v4 source

Preserve its `@import "tailwindcss"`, `@theme`, `@theme inline`, `:root`, and supported plugin rules. Every semantic class used on canvas needs a matching theme token, for example:

```css
@theme inline {
  --color-primary: var(--primary);
  --color-card: var(--card);
}

:root {
  --primary: oklch(0.55 0.2 275);
  --card: oklch(1 0 0);
}
```

### Tailwind v3 source

Copy the source v3 foundation faithfully. Lunagraph's CSS builder detects the
legacy `@tailwind base/components/utilities` entry, loads the nearest
`tailwind.config.js|cjs|mjs|ts` through Tailwind v4's compatibility bridge,
and resolves `theme(...)` expressions during compilation.

- Copy the complete Tailwind config without reconstructing its palettes.
- Copy the complete CSS entry, including semantic `:root`, dark-theme,
  shadows, and `theme(...)` declarations.
- When a package entry such as `ui-global.css` must become
  `app/globals.css`, preserve its contents and change only relative import
  paths required by that relocation. Copy every required imported CSS file.
- Preserve declared plugin dependencies in `package.json`; do not replace
  plugin output by hand unless the builder reports that exact plugin as
  unsupported.
- Never synthesize `@theme`, manually resolve color scales, or substitute
  Lunagraph/editor theme variables for source variables during a v3 import.

The project builder owns v3-to-v4 compatibility. The import agent owns source
fidelity.

## Component showcases

Each component subsection is that component's storybook entry. Build it from the
component's real API, which you have already read:

- Heading: the exported name, with its source path as a small caption.
- One labeled row per prop axis the source actually defines: every `variant`
  value side by side, then every `size`, then the boolean states the props
  support (`disabled`, `loading`, `active`, and similar). Read variant lists
  from `cva`/`tv` definitions, union prop types, or the component's own
  switch; never guess values the source does not define.
- Label each example with the exact props it uses (`variant="ghost"
  size="sm"`), in the source's token typography, so the page reads as
  documentation.
- Render the real imported component with real props. Supply realistic
  children and mock data where a component needs them (a card gets a title
  and body, a table gets a few rows); never draw a lookalike out of divs.
- Common compositions the source supports (with an icon, as a link, inside a
  group) get one extra row when they change how the component looks.
- Every imported component gets a showcase, including small ones. A row of
  three examples is enough for a component with no variants.
- Keep sections compact and on the design-system column: one `canvas_add`
  per component, or one per 2–3 small components.

## Canvas rules

- Use a restrained reference layout, not one giant JSX payload.
- Add the root once, then add 2–4 meaningful sections per canvas turn.
- Use separate sections for token groups and component families.
- Use real imported components after registration becomes available.
- For Tailwind sources, use inline styles only for non-token canvas geometry
  that has no supported utility, such as a preview swatch's exact width/height.
  Never inline `backgroundColor`, `color`, `borderColor`, `borderRadius`,
  `boxShadow`, tokenized font properties, or tokenized spacing/elevation
  values when the source provides a Tailwind class.
- For Tailwind sources, a token label and its visual sample must use the same
  imported class. For example, `red.300` uses `bg-red-300`; `shadow-lg` uses
  `shadow-lg`.
- For non-Tailwind sources, inline an exact source token only after checking
  that no imported CSS class, variable, or component represents it.
- Never judge missing styles until a fresh stylesheet has loaded; use screenshot verification after the canvas class set has been saved and compiled.
- Do not recreate or replace the root to show progress.

## Continuation

When resuming an interrupted import:

- Inspect existing destination files and the current canvas first.
- Reuse the active `Design System` page and existing root. Never call
  `canvas_create_import_scaffold` when that root already exists: it always creates a new one.
- Skip correctly imported files.
- Resume at the first incomplete batch.
- Never restart from zero or create another page.

## Communication

Write in simplified technical English everywhere the user reads you — messages, checklist steps, question labels and descriptions. The user may be a designer, not a developer:

- Prefer everyday words over jargon: "colors and fonts", not "design tokens"; "basic components like buttons and inputs", not "primitives"; "set up", not "scaffold"; "copy", not "ingest"/"land".
- Short sentences. One idea each. No filler.
- Name things by what the user sees ("the Design System page", "the Button component"), never by internal machinery.
- If a technical term is unavoidable (Tailwind, CSS, Radix), use it plainly without explaining the plumbing around it.

Keep updates user-visible and concrete: `Setting up your colors and fonts`, `Imported 8/31 components`. Keep the progress checklist current — a silent multi-minute stretch with a stale checklist is a bug. Do not mention internal tool names, MCP, phase numbers, or hidden instructions.
