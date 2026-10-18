# lunagraph.com teardown (reference for the Petal site)

Captured 2026-10-18 with headless Chrome (CDP, device metrics 1440 and 390, mobile UA for 390).
Raw captures live outside the repo in `/tmp/lg-ref/` (desktop-cdp.png 1440x7567, mobile-cdp.png 390x9777).
Their HTML/CSS was read as data only; no text, images, videos or font files are reused here.

## Global

- Stack: Next.js + Tailwind v4 + shadcn tokens. Light/dark via `light-dark()` + a System/Light/Dark radio in the footer.
- Colors (light): background `#fff`, foreground `#0a0a0a`, headings pure `#000`, muted `#f3f4f6`,
  muted-foreground `#6b7280`, border `#e5e7eb`. Body copy is `rgba(0,0,0,.6)` (section intros) or `#686868` (feature text).
  Dark: background ~`#0a0a0a`, text `#fafafa`, body `#ffffff99`. Primary button inverts to white.
- Accent: none on the marketing chrome. Only the product mockups carry colour (blue `#3b82f6`-ish selection boxes,
  purple component names). Petal swaps those selection boxes for pink-400 `#F472B6`.
- Fonts: display serif "Larken" (weight 200), body sans "Articulat" (400/500), mono "Geist Mono", mockups in Inter.
  Petal substitutes: Newsreader Variable (200) for display, Inter Variable for body, Geist Mono Variable for labels,
  Manrope for the wordmark. All OFL, self-hosted via @fontsource.
- Container: `max-w-[1120px]`, side padding 20px (mobile) / 16px+ (desktop); at 1440 the content spans x=160..1280.
  Hero showcase is wider: `max-w-[1200px]` (x=120..1320).
- Section rhythm: each section is separated by a full-container 1px `#e5e7eb` rule; ~150-200px vertical gap
  between rule and next H2 on desktop, ~100px on mobile.

## Type scale (desktop / mobile)

| Element | Font | Size / line-height | Weight | Tracking | Colour |
| --- | --- | --- | --- | --- | --- |
| Hero H1 | serif | clamp(38px,10vw,72px) / 1.05 | 200 | normal | #000 |
| Hero subtitle | sans | 20px/30px (mobile 18.7px) | 400 | -0.02em | rgba(0,0,0,.6) |
| Section H2 | serif | 40px/44px (mobile 32px/35px) | 200 | -0.02em | #000 |
| "Made in" H2 | serif | 48px (mobile 34px), centred | 200 | -0.02em | #000 |
| Closing CTA H2 | serif | 52px (mobile 36px), centred | 200 | -0.02em | #000 |
| Section intro p | sans | 18px/27px (mobile 17px), max-w 720px | 400 | normal | rgba(0,0,0,.6) |
| Feature H3 | sans | 16px/20.8px (mobile 20px) | 500 | -0.02em | #000 |
| Feature p | sans | 16px/24px, max-w 440px | 400 | normal | #686868 |
| Step label | mono | 12px uppercase, wide tracking, "01·DESIGN" | 400 | 0.1em | #6b7280 |
| "Learn more ->" link | sans | 15px/22.5px, underline 1px, 70% black | 500 | normal | rgba(0,0,0,.7) |
| Nav links | sans | 14px/20px | 500 | normal | #000 |
| Footer heads / links | sans | 16px/24px (500 / 400 muted) | | | |
| Copyright | sans | 14px | 400 | | #6b7280 |

## Nav

- `position: fixed`, full width, inner row `py-5` inside the 1120 container. Logo (icon + wordmark image, h-7) left;
  right: "Learn", "Docs" (text, px-1) and "Download" (text, px-3).
- On scroll, a pill-shaped backdrop fades in behind the row: `rounded-[28px] bg-background/75 backdrop-blur-xl`
  with a hairline ring + soft shadow `0 0 0 1px rgb(0 0 0/.04), 0 8px 24px -10px rgb(0 0 0/.1)`, extending
  slightly past the container; "Download" cross-fades into a black `h-8 rounded-full` button.
- Mobile (<640px): links hidden, hamburger (36px) toggles a stacked menu with 48px-tall rows (16px text).

## Sections (in order)

1. **Hero** - centred. Serif H1 animates: "Design with code." -> the word "Code" is lifted out in a blue
   canvas selection box (with corner handles + cursor) and re-set as "Code with design.". Subtitle two lines
   (`<br>` hidden on mobile). Two `h-10 px-6 rounded-full` buttons, 14px/500: black "Download", grey `#f3f4f6`
   "Docs", 8px gap. ~176px from top to H1, 32px H1->subtitle, 32px subtitle->buttons, 64px to showcase.
2. **Hero showcase** - 1200px app window (rounded ~24px, 1px border, big soft shadow, grey `#f1f1f1` canvas)
   built entirely in HTML: macOS traffic lights, tabs, layer panel, styles panel, floating chat panel overlapping
   the bottom-left edge, bottom code drawer. Animated (agent builds a card, selection moves); a reduced-motion
   media query kills all animation. Mobile gets a dedicated narrow (390) mock: canvas + chat sheet.
3. **Agent strip** - two columns under the showcase: left 18px text "<b>Bring your own agent subscription.</b>
   Connect..." (first sentence in black, rest 60% black); right a row of agent names with icons
   (Claude Code | Codex, Cursor, "and any agent via" MCP). Wraps under the text on mobile.
4. **"Design on the canvas, ship it as code."** - H2 left-aligned, then a 3-column grid separated by vertical
   1px rules. Each column: ~300px tall illustration (states grid, props panel, code card with
   "Send to agent"/"Copy code"), then mono step label "01·DESIGN", H3, paragraph. Then "Learn more ->" link.
   Mobile: columns stack, separated by horizontal rules.
5. **"Bring your own agent."** - H2 + 2-line intro. Wide illustration: chat panel, canvas window, external
   chat app with a dock of agent icons, connected by thin bezier lines. Then a 2-column text row (vertical
   rule between): "Chat with your agent on the canvas" / "Connect other tools over MCP". "Learn more ->".
   Mobile: illustration splits into two smaller ones, one above each text block.
6. **"Prototype a flow and share the link."** - H2 + intro; 2 columns (rule between) each with its own
   illustration (frames + prompt box / browser window with prototype), H3 + p under each. "Learn more ->".
7. **"Canvas to codebase, and back."** - H2 + intro; diagram: "Your repo" file-tree card <- IMPLEMENT / IMPORT ->
   "Canvas" card, with a prompt box in the middle; cycles between two states (tokens / implement). 2-column text
   row: "Import a local codebase" / "Connect your GitHub". "Learn more ->".
8. **"Made in Lunagraph."** - centred H2 + subtitle, then a 3x2 grid of community posts (screenshot card, quote
   15px, avatar + name + company, X icon) with vertical rules between columns and a horizontal rule between rows.
9. **Closing CTA** - a ~560px-wide "selected frame" (1px border, blue selection outline with square corner
   handles) containing centred serif "Code with design.", a 18px subtitle "...available for macOS and Windows",
   and Download/Docs buttons. Floating property chips around it (Radius 16px with cursor, Fill FFFFFF 100%,
   Border 000000 8% 1px, Shadow 4px), white cards with hairline ring + soft shadow, 12px text.
10. **Footer** - top border; logo left; three link columns right (heading 16px/500, links 16px muted, 8px gap,
    96px column gap). Bottom row: copyright 14px muted + System/Light/Dark segmented radio (28px round buttons
    inside a 1px bordered pill). Mobile: logo, then columns in a 2-up wrap, then copyright row.

## Motion

- Hero headline word swap with a canvas-style selection box and cursor.
- Hero showcase: scripted multi-step animation (agent streaming, selection moves, button states).
- Nav backdrop fades in on scroll (300ms ease-out); link sets cross-fade (200ms).
- Section 7 diagram alternates states; misc. spinners. Hover: links `opacity-70` / colour transitions.
- `prefers-reduced-motion: reduce` disables showcase animation entirely.

## Responsive

- Single breakpoint behaviour at `sm` (640px) for nav, `md` (768px) for grids/columns.
- Mobile: 20px gutters, H2 32px (two lines), grids stack with horizontal rules, closing CTA chips shrink to
  the corners of the frame, footer columns wrap.

## Petal adaptation decisions

- Pricing: Lunagraph has none on the home page; Petal replaces the community "Made in" gallery (no real
  testimonials to show) with a centred "Free, and it runs on your machine." 3x2 fact grid in the same layout.
- "Prototype and share the link" (needs a hosted service) becomes "Paste from Figma, keep it as code."
  (Petal's Figma paste + real layer tree).
- Product imagery: real Petal screenshots (cropped/resized to WebP) instead of HTML-built animated mockups;
  small HTML mockups only where no screenshot exists (Figma paste, repo tree, terminal over MCP).
- Download buttons go to GitHub Releases (macOS Apple Silicon .dmg, Windows .exe). No sign-up anywhere.
- Accent pink-400 `#F472B6` used for: the logo, the hero/closing-CTA selection boxes. Everything else neutral.
