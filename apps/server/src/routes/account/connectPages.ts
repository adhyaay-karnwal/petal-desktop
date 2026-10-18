/**
 * Browser pages for /github/connect and /figma/connect (opened by the desktop
 * in the system browser with `?source=electron`). Inline HTML so the bundled
 * server needs no web/ files. Styled like web/login.html.
 */
import { DESKTOP_SCHEME } from '../../env.ts';

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

const STYLE = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #2a2a2a; color: #ededed; font: 14px/1.5 Inter, system-ui, -apple-system, sans-serif; }
  .card { width: 420px; padding: 32px; border-radius: 16px; background: #222; border: 1px solid #333; }
  h1 { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
  p.sub { margin: 0 0 22px; color: #9a9a9a; }
  label { display: block; margin: 0 0 6px; color: #bdbdbd; font-size: 12px; font-weight: 500; }
  input { width: 100%; height: 36px; margin: 0 0 10px; padding: 0 10px; border-radius: 8px; border: 1px solid #3a3a3a; background: #1a1a1a; color: inherit; font: 13px ui-monospace, Menlo, monospace; }
  input:focus { outline: none; border-color: #4c8dff; }
  button, a.button { display: flex; align-items: center; justify-content: center; width: 100%; height: 36px; border: 0; border-radius: 8px; background: #ededed; color: #111; font: inherit; font-weight: 500; cursor: pointer; text-decoration: none; }
  button.secondary, a.secondary { background: #333; color: #ededed; }
  button:disabled { opacity: .6; cursor: default; }
  .hint { margin: 0 0 14px; color: #8a8a8a; font-size: 12px; }
  .hint a, .links a { color: #cfcfcf; }
  .or { display: flex; align-items: center; gap: 10px; margin: 18px 0; color: #6f6f6f; font-size: 12px; }
  .or::before, .or::after { content: ""; flex: 1; height: 1px; background: #333; }
  .error { margin: 0 0 14px; padding: 8px 10px; border-radius: 8px; background: #3a1f1f; color: #ff8a8a; }
  .ok { margin: 0 0 14px; color: #8fd18f; }
  .links { margin-top: 16px; text-align: center; color: #8a8a8a; font-size: 12px; }
  code { font: 12px ui-monospace, Menlo, monospace; color: #cfcfcf; }
`;

function shell(title: string, body: string, script = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title><style>${STYLE}</style></head><body><main class="card">${body}</main>${script ? `<script>${script}</script>` : ''}</body></html>`;
}

const disableOnSubmit = `document.querySelectorAll('form').forEach(f => f.addEventListener('submit', () => f.querySelectorAll('button').forEach(b => b.disabled = true)));`;

export function signedOutPage(service: string) {
  return shell(`Connect ${service}`, `<h1>Connect ${esc(service)}</h1><p class="sub">You're not signed in to Petal in this browser.</p>
<a class="button" href="/login">Sign in</a>`);
}

// ------------------------------------------------------------ GitHub

export function githubConnectPage(opts: {
  source: string;
  error?: string | null;
  current?: { login: string; source: string } | null;
  ghLogin?: string | null;
  webUrl: string;
}) {
  const src = esc(opts.source);
  const tokenUrl = `${opts.webUrl}/settings/personal-access-tokens/new`;
  const classicUrl = `${opts.webUrl}/settings/tokens/new?scopes=repo,read:org&description=Petal`;
  const body = `
<h1>Connect GitHub</h1>
<p class="sub">Petal uses your GitHub access to list repos, import code and push commits.</p>
${opts.error ? `<p class="error">${esc(opts.error)}</p>` : ''}
${opts.current ? `<p class="ok">Currently connected as <b>${esc(opts.current.login)}</b> (${esc(opts.current.source === 'gh' ? 'GitHub CLI' : opts.current.source === 'env' ? 'GITHUB_TOKEN' : 'saved token')}).</p>` : ''}
${
  opts.ghLogin
    ? `<form method="post" action="/github/connect"><input type="hidden" name="source" value="${src}" /><input type="hidden" name="method" value="gh" />
<button type="submit">Use GitHub CLI login (${esc(opts.ghLogin)})</button></form><div class="or">or paste a token</div>`
    : `<p class="hint">Tip: if you use the GitHub CLI, run <code>gh auth login</code> and reload this page to connect without a token.</p>`
}
<form method="post" action="/github/connect">
  <input type="hidden" name="source" value="${src}" /><input type="hidden" name="method" value="token" />
  <label for="token">Personal access token</label>
  <input id="token" name="token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_… or ghp_…" required />
  <p class="hint">Create a <a href="${esc(tokenUrl)}" target="_blank" rel="noreferrer">fine-grained token</a> with access to your repos
  (Repository permissions: <b>Contents: Read and write</b>, Metadata: Read; Administration: Read and write to create repos),
  or a <a href="${esc(classicUrl)}" target="_blank" rel="noreferrer">classic token</a> with <code>repo</code> and <code>read:org</code>.
  For organization repos, the org may need to approve the token.</p>
  <button type="submit" class="${opts.ghLogin ? 'secondary' : ''}">Connect with token</button>
</form>`;
  return shell('Connect GitHub', body, disableOnSubmit);
}

/** Hands control back to the desktop: loopback receiver + deep link; popup flow for web. */
export function githubDonePage(opts: { login: string; source: string; loopbackPort: number }) {
  const deepLink = `${DESKTOP_SCHEME}://github-connected?code=local`;
  const loopback = `http://127.0.0.1:${opts.loopbackPort}/github-connected?code=local`;
  const electron = opts.source === 'electron';
  const body = `<h1>GitHub connected</h1><p class="sub">Signed in as <b>${esc(opts.login)}</b>. ${electron ? 'Return to Petal to pick a repository.' : 'You can close this window.'}</p>
${electron ? `<a class="button" href="${esc(deepLink)}">Open Petal</a>` : ''}`;
  const script = electron
    ? `fetch(${JSON.stringify(loopback)}, { mode: 'no-cors' }).catch(() => {}).finally(() => { location.href = ${JSON.stringify(deepLink)}; });`
    : `try { window.opener && window.opener.postMessage({ type: 'github-app-connected' }, '*'); } catch (e) {} setTimeout(() => window.close(), 300);`;
  return shell('GitHub connected', body, script);
}

// ------------------------------------------------------------ Figma

export function figmaConnectPage(opts: { source: string; error?: string | null; current?: { handle: string | null; email: string | null } | null }) {
  const src = esc(opts.source);
  const failLink = `${DESKTOP_SCHEME}://figma-connect-failed`;
  const body = `
<h1>Connect Figma</h1>
<p class="sub">Petal uses Figma only to download the images in designs you paste from Figma.</p>
${opts.error ? `<p class="error">${esc(opts.error)}</p>` : ''}
${opts.current ? `<p class="ok">Currently connected as <b>${esc(opts.current.handle ?? opts.current.email ?? 'Figma user')}</b>.</p>` : ''}
<form method="post" action="/figma/connect">
  <input type="hidden" name="source" value="${src}" />
  <label for="token">Figma personal access token</label>
  <input id="token" name="token" type="password" autocomplete="off" spellcheck="false" placeholder="figd_…" required />
  <p class="hint">In Figma: avatar menu → <b>Settings</b> → <b>Security</b> → <b>Personal access tokens</b> → Generate new token, with scope
  <code>file_content:read</code> (read-only). <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noreferrer">How to create one</a>.</p>
  <button type="submit">${opts.current ? 'Replace token' : 'Connect Figma'}</button>
</form>
${opts.current ? `<form method="post" action="/figma/connect/remove" class="links"><input type="hidden" name="source" value="${src}" /><button type="submit" class="secondary">Disconnect Figma</button></form>` : ''}
${opts.source === 'electron' ? `<div class="links"><a href="${esc(failLink)}">Cancel and return to Petal</a></div>` : ''}`;
  return shell('Connect Figma', body, disableOnSubmit);
}

export function figmaDonePage(opts: { handle: string; source: string }) {
  const deepLink = `${DESKTOP_SCHEME}://figma-connected`;
  const electron = opts.source === 'electron';
  const body = `<h1>Figma connected</h1><p class="sub">Connected as <b>${esc(opts.handle)}</b>. ${electron ? 'Return to Petal and paste again if images were skipped.' : 'You can close this window.'}</p>
${electron ? `<a class="button" href="${esc(deepLink)}">Open Petal</a>` : ''}`;
  const script = electron
    ? `location.href = ${JSON.stringify(deepLink)};`
    : `try { window.opener && window.opener.postMessage({ type: 'figma-connected' }, location.origin); } catch (e) {} setTimeout(() => window.close(), 300);`;
  return shell('Figma connected', body, script);
}
