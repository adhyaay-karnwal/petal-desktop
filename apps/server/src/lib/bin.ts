import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Locates a CLI the way a login shell would: an explicit override, then PATH,
 * then common install dirs (GUI-launched apps on macOS get a minimal PATH).
 */
export function findExecutable(name: string, override?: string): string | null {
  const home = os.homedir();
  const dirs = [
    ...(process.env.PATH ?? '').split(path.delimiter),
    path.join(home, '.local/bin'),
    path.join(home, '.claude/local'),
    '/opt/homebrew/bin',
    '/usr/local/bin',
    '/usr/bin',
    path.join(home, '.npm-global/bin'),
    path.join(home, '.bun/bin'),
    path.join(home, '.volta/bin'),
    ...(process.platform === 'win32'
      ? [path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'GitHub CLI'), path.join(process.env.ProgramFiles ?? 'C:\\Program Files', 'GitHub CLI')]
      : []),
  ].filter(Boolean);
  const file = process.platform === 'win32' ? `${name}.exe` : name;
  for (const candidate of [override, ...dirs.map((d) => path.join(d, file))]) {
    if (!candidate) continue;
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      /* not here */
    }
  }
  return null;
}

/** Runs a command without a shell; resolves with exit code and output. */
export function run(
  bin: string,
  args: string[],
  opts: { input?: string; timeoutMs?: number; env?: NodeJS.ProcessEnv; cwd?: string } = {},
): Promise<{ code: number | null; stdout: string; stderr: string; timedOut: boolean }> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: opts.cwd ?? os.tmpdir(), env: opts.env ?? process.env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, opts.timeoutMs ?? 30_000);
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(opts.input ?? '');
  });
}
