// Builds Petal: the three Electron targets from the reconstructed sources plus
// the API server (apps/server), into a self-contained app directory at
// .pack/app (out/ + production node_modules rebuilt for Electron). Both
// `npm start` and electron-builder run that directory, so dev matches release.
import { build } from 'vite';
import * as esbuild from 'esbuild';
import { builtinModules } from 'node:module';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverRoot = path.resolve(root, '../server');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const app = path.join(root, '.pack/app');
const out = path.join(app, 'out');
const electronVersion = pkg.devDependencies.electron;
// Target CPU for the packaged deps (PETAL_ARCH=x64 builds an Intel mac app on Apple Silicon).
const arch = process.env.PETAL_ARCH || process.arch;

// Runtime dependencies of main (left external by the vite build) and of the server.
const serverDeps = JSON.parse(fs.readFileSync(path.join(serverRoot, 'package.json'), 'utf8')).dependencies;
const runtimeDeps = { ...pkg.dependencies };
for (const name of Object.keys(serverDeps)) runtimeDeps[name] = installedVersion(name);

const nodeExternals = [
  'electron', 'electron-devtools-installer', ...Object.keys(pkg.dependencies),
  ...builtinModules, ...builtinModules.map((m) => `node:${m}`),
];
// Reconstructed code is already tree-shaken by the original bundler; keep every statement.
const common = { configFile: false, logLevel: 'warn', root };

function installedVersion(name) {
  for (const base of [path.join(serverRoot, 'node_modules'), path.resolve(root, '../../node_modules')]) {
    const file = path.join(base, name, 'package.json');
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')).version;
  }
  throw new Error(`server dependency ${name} is not installed; run npm install`);
}

async function buildNode(name, entry) {
  await build({
    ...common,
    build: {
      outDir: path.join(out, name), emptyOutDir: true, minify: false, target: 'node22',
      reportCompressedSize: false, copyPublicDir: false,
      lib: { entry: path.join(root, entry), formats: ['cjs'], fileName: () => 'index.js' },
      rollupOptions: { external: (id) => nodeExternals.includes(id) || /^\.\/(dist|sdk|token|fileFromPath|rolldown-runtime)-/.test(id), treeshake: false, output: { inlineDynamicImports: true } },
    },
  });
}

/** Installs production deps into .pack/app and rebuilds native ones for Electron, when they changed. */
function installRuntimeDeps() {
  const manifest = {
    name: 'petal', productName: pkg.productName, version: pkg.version, description: pkg.description,
    main: './out/main/index.js', private: true, dependencies: runtimeDeps,
  };
  fs.mkdirSync(app, { recursive: true });
  fs.writeFileSync(path.join(app, 'package.json'), JSON.stringify(manifest, null, 2) + '\n');
  const stamp = crypto.createHash('sha256').update(JSON.stringify([runtimeDeps, electronVersion, process.platform, arch])).digest('hex');
  const stampFile = path.join(app, 'node_modules/.petal-deps');
  if (fs.existsSync(stampFile) && fs.readFileSync(stampFile, 'utf8') === stamp) return;
  console.log('installing runtime dependencies into .pack/app …');
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  execFileSync(npm, ['install', '--omit=dev', '--no-audit', '--no-fund', '--workspaces=false', '--install-links', `--cpu=${arch}`], { cwd: app, stdio: 'inherit', shell: process.platform === 'win32' });
  // Only better-sqlite3 is ABI-specific (node-pty ships N-API prebuilds). Fetch its Electron
  // prebuild in place; electron-rebuild would also rebuild the workspace's copy that the
  // standalone Node server uses.
  console.log(`fetching better-sqlite3 for Electron ${electronVersion} …`);
  execFileSync(process.execPath, [path.join(app, 'node_modules/prebuild-install/bin.js'), '--runtime', 'electron', '--target', electronVersion, '--arch', arch], { cwd: path.join(app, 'node_modules/better-sqlite3'), stdio: 'inherit' });
  fs.writeFileSync(stampFile, stamp);
}

installRuntimeDeps();
fs.rmSync(out, { recursive: true, force: true });
await buildNode('main', 'src/main/index.entry.js');
for (const f of fs.readdirSync(path.join(root, 'prebuilt/main'))) fs.copyFileSync(path.join(root, 'prebuilt/main', f), path.join(out, 'main', f));
await buildNode('preload', 'src/preload/index.entry.js');
fs.copyFileSync(path.join(root, 'src/preload/webview.js'), path.join(out, 'preload/webview.js'));
await build({
  ...common,
  root: path.join(root, 'src/renderer'),
  base: './',
  build: {
    outDir: path.join(out, 'renderer'), emptyOutDir: true, minify: false, target: 'esnext',
    reportCompressedSize: false, chunkSizeWarningLimit: 100000, assetsInlineLimit: 0,
    rollupOptions: { treeshake: false },
  },
});
// The API server, run by main as a utility process (src/main/app/src/main/petalServer.js).
await esbuild.build({
  entryPoints: [path.join(serverRoot, 'src/index.ts')],
  outfile: path.join(out, 'server/index.mjs'),
  bundle: true, platform: 'node', format: 'esm', target: 'node22', packages: 'external', logLevel: 'warning',
});
// Save-to-code reuses the client's compiler modules (see apps/server/src/routes/content/saveToCode.ts,
// PETAL_DESKTOP_SRC); ship bundled copies under the same relative paths.
await esbuild.build({
  entryPoints: [
    'renderer/src/packages/compiler/src/store/ensureV2.js', 'renderer/src/packages/compiler/src/codegen/generateJSX.js',
    'renderer/src/packages/compiler/src/store/read.js', 'renderer/src/packages/compiler/src/codegen/extractDependencies.js',
    'renderer/src/packages/compiler/src/runtime/stampMapHosts.js', 'main/packages/compiler/src/codegen/generateImports.js',
  ].map((f) => path.join(root, 'src', f)),
  outbase: path.join(root, 'src'), outdir: path.join(out, 'server/compiler'),
  bundle: true, splitting: true, platform: 'node', format: 'esm', target: 'node22', logLevel: 'warning',
  external: ['electron', ...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
});
fs.cpSync(path.join(serverRoot, 'web'), path.join(out, 'server/web'), { recursive: true });
// Agent skills (read_skill / list_skills), vendored from the original app's extraResources by
// tools/patch_fixes.py; renamed to Petal like the rest of the client.
const rebrand = (t) => t.replaceAll('Lunagraph', 'Petal').replaceAll('lunagraph', 'petal');
function copyRebranded(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const to = path.join(dst, rebrand(e.name));
    if (e.isDirectory()) copyRebranded(path.join(src, e.name), to);
    else fs.writeFileSync(to, rebrand(fs.readFileSync(path.join(src, e.name), 'utf8')));
  }
}
fs.rmSync(path.join(app, 'resources'), { recursive: true, force: true });
copyRebranded(path.join(root, 'resources'), path.join(app, 'resources'));
fs.mkdirSync(path.join(app, 'build'), { recursive: true });
fs.copyFileSync(path.join(root, 'build/icon.png'), path.join(app, 'build/icon.png'));
console.log('built →', app);
