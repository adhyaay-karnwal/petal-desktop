# Petal

A visual React component editor with Claude Code / Cursor agents on the canvas.
It is a single desktop app with no account and no hosted backend: its API server
runs inside the app on 127.0.0.1.

- `apps/desktop`: the Electron app. `src/` is generated from the original
  Lunagraph v0.0.192 bundles by `../tools` (see "How the client is built"), so
  don't edit it by hand.
- `apps/server`: the API (projects, files, pages, versions, chats, comments,
  assets, GitHub/Figma, and the builder that compiles components for the canvas).
  The desktop app bundles it and runs it as a utility process with
  `PETAL_LOCAL_MODE=1`.

## Build and install

```sh
npm install
npm run build      # → apps/desktop/.pack/app (app + server + native deps for Electron)
npm start          # run it
npm run package    # → apps/desktop/dist/Petal-<version>-arm64.dmg (+ .zip)
```

## Releases and updates

Push a version tag and GitHub Actions builds, smoke-tests and publishes macOS (Apple
Silicon) and Windows builds to a GitHub Release:

```sh
git tag v0.1.2 && git push origin v0.1.2
```

Installed apps check the release feed 10 s after launch, then every 30 min, and on
**Check for Updates…** in the menu. The update downloads in the background, and
"Restart" installs it (it also installs when you quit). The repo is private, so
Petal reads releases with your GitHub connection. On a new computer, use
**Connect GitHub…** in the menu and paste a token that can read this repo; a
fine-grained token with Contents: read is enough.

On Windows, run `Petal-Setup-<version>.exe`. It installs for your user
(`%LOCALAPPDATA%\Programs\Petal`) without admin rights. It isn't code-signed, so
SmartScreen asks once: **More info → Run anyway**.

On another Mac, open the DMG and drag Petal to Applications. The app is ad-hoc
signed (there is no Apple Developer ID), so the first launch is blocked: open
**System Settings → Privacy & Security → Open Anyway**. Alternatively, run
`xattr -dr com.apple.quarantine /Applications/Petal.app`.

Data lives in `~/Library/Application Support/com.petal.desktop`, and logs in
`~/Library/Logs/Petal`.

## Connect your agents (MCP)

Petal's MCP server is at `http://127.0.0.1:21229/mcp` while the app is open.

- Claude Code: `claude mcp add --scope user --transport http petal http://127.0.0.1:21229/mcp`
- Cursor: add `"petal": { "url": "http://127.0.0.1:21229/mcp" }` to
  `~/.cursor/mcp.json` under `mcpServers`.
- Codex: `codex mcp add petal --url http://127.0.0.1:21229/mcp`

The in-app chat uses your installed `claude` CLI and your own subscription.

## Integrations

- **GitHub**: works automatically with your `gh` login. Otherwise paste a token
  on the connect page. GitHub Enterprise: set `GITHUB_API_URL`.
- **Figma**: paste a personal access token (scope `file_content:read`) when Petal
  asks. Then copy frames in Figma and paste them onto the canvas; images are saved
  into the project.
- **Save to code**: merges through `claude -p` using your subscription. With
  `ANTHROPIC_API_KEY` set it uses the API instead, and it falls back to a
  deterministic merge.

## Environment

| Variable | Default | |
|---|---|---|
| `PETAL_API_URL` | built-in server | Use a hosted server instead (turns login back on) |
| `PETAL_API_PORT` / `PETAL_MCP_PORT` / `PETAL_GITHUB_OAUTH_PORT` | 4280 / 21229 / 23584 | |
| `PETAL_BACKGROUND=1` | off | Testing: never take focus or show in the Dock |
| `GITHUB_TOKEN`, `GITHUB_API_URL`, `FIGMA_TOKEN`, `ANTHROPIC_API_KEY` | | Read by the built-in server |

## Website

`apps/web` is the marketing site (Vite + React + Tailwind, static):
`npm run build -w @petal/web` → `apps/web/dist`.

## Brand

The logo lives in `../tools/brand/v2` (static, animated and loader SVGs, plus icons).
It recreates @Metagravity0's animated mark; ask them for permission before any
public use.

## How the client is built

The original app ships unminified bundles with `//#region <path>` markers.
The pipeline lives in `../tools`:

1. `rea extract-artifact` unpacks `app.asar` (REA, https://rea.tools).
2. `reconstruct.mjs` splits each bundle back into one ES module per source file.
3. `patch_clone.py` applies Petal's changes:
   - the name, logo and icons, from `tools/brand`
   - the built-in server and no login
   - offline feature flags
   - background mode
4. `patch_fixes.py` applies bug fixes found in QA. These cover the system skills,
   the leftover draw-preview ghost, local glob/grep, and background mode.
5. `regen.sh [apps/desktop]` runs steps 2–4.

The standalone server still runs for development with `npm run server`
(port 4100, with login).
