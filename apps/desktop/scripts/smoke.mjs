// Smoke test for a built app (.pack/app): starts Petal hidden with a throwaway profile,
// then checks the built-in server, local sign-in, MCP, and that the builder compiles the
// starter components (esbuild + Tailwind native binaries). Used by CI on macOS and Windows.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const electron = createRequire(path.join(root, 'package.json'))('electron');
const API = 'http://127.0.0.1:4299';
const MCP = 'http://127.0.0.1:21299/mcp';
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'petal-smoke-'));
const env = { ...process.env, PETAL_BACKGROUND: '1', PETAL_USER_DATA: profile, PETAL_API_PORT: '4299', PETAL_MCP_PORT: '21299', PETAL_GITHUB_OAUTH_PORT: '23599' };
delete env.ELECTRON_RUN_AS_NODE;
const app = spawn(electron, [path.join(root, '.pack/app')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
app.stdout.on('data', (d) => (log += d));
app.stderr.on('data', (d) => (log += d));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(what, fn, ms = 60_000) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(500)) {
    try {
      const v = await fn();
      if (v) return v;
    } catch {}
  }
  throw new Error(`timed out waiting for ${what}`);
}
const json = async (url, init) => (await fetch(url, init)).json();

try {
  await until('built-in server', async () => (await fetch(`${API}/health`)).ok);
  const session = await json(`${API}/api/auth/get-session`);
  if (!session?.user) throw new Error('local sign-in failed');
  console.log('✓ server + local user:', session.user.name);

  const initialize = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'smoke', version: '1' } } });
  const reply = await until('MCP server', async () => (await fetch(MCP, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: initialize })).text());
  if (!reply.includes('"name":"petal"')) throw new Error('MCP server did not identify as petal');
  console.log('✓ MCP server');

  const orgs = await json(`${API}/api/auth/organization/list`);
  const project = await json(`${API}/projects`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ organizationId: orgs[0].id, name: 'Smoke test' }) });
  const seeded = await json(`${API}/projects/${project.id}/seed-template`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  if (!seeded.copied) throw new Error('template seed failed');
  const ctrl = new AbortController();
  const res = await fetch(`${API}/projects/${project.id}/events`, { signal: ctrl.signal });
  const reader = res.body.getReader();
  let text = '';
  await until('builder modules + css', async () => {
    const { value, done } = await reader.read();
    if (done) throw new Error('event stream closed');
    text += new TextDecoder().decode(value);
    return text.includes('css:ready');
  });
  ctrl.abort();
  if (text.includes('"error"')) throw new Error('builder reported an error');
  console.log('✓ builder compiled the starter components');
  console.log('smoke test passed');
} catch (err) {
  console.error('smoke test FAILED:', err.message);
  console.error(log.split('\n').slice(-40).join('\n'));
  process.exitCode = 1;
} finally {
  app.kill();
  await sleep(1500);
  fs.rmSync(profile, { recursive: true, force: true });
}
