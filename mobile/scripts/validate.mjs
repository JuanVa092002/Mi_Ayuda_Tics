#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

console.log('✓ package.json válido');

if (pkg.scripts['dev:go']) {
  console.error('✗ Script dev:go no debe existir (footgun Expo Go)');
  process.exit(1);
}

const requiredFiles = [
  'scripts/_paths.mjs',
  'scripts/_preflight.mjs',
  'scripts/adb-reverse.mjs',
  'scripts/native-sync.mjs',
  'scripts/native-build-dev.mjs',
  'scripts/native-build-release.mjs',
  'scripts/deeplink-test.mjs',
  'scripts/android-fingerprint.mjs',
  'scripts/sync-assetlinks.mjs',
  'src/shared/linking/parse-reset-link.ts',
  'app/+native-intent.tsx',
  'MOBILE_DEV.md',
  'app.json',
  'eas.json',
];

for (const rel of requiredFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error(`✗ Falta: ${rel}`);
    process.exit(1);
  }
}
console.log('✓ archivos de tooling, linking y config presentes');

const intentFilters = appJson?.expo?.android?.intentFilters ?? [];
const hasAppLinks = intentFilters.some(
  (filter) =>
    filter.autoVerify === true &&
    filter.data?.some(
      (entry) =>
        entry.scheme === 'https' &&
        entry.host === 'miayudatics.vercel.app' &&
        entry.pathPrefix === '/restablecerPassword',
    ),
);
if (!hasAppLinks) {
  console.error('✗ app.json: falta intentFilter HTTPS con autoVerify para /restablecerPassword');
  process.exit(1);
}
console.log('✓ Android App Links intentFilter en app.json');

const manifestPath = path.resolve(
  root,
  '../../client/public/.well-known/android-fingerprints.manifest.json',
);
const assetlinksPath = path.resolve(root, '../../client/public/.well-known/assetlinks.json');
if (!fs.existsSync(manifestPath)) {
  console.error('✗ Falta android-fingerprints.manifest.json');
  process.exit(1);
}
execSync('node scripts/sync-assetlinks.mjs', { cwd: root, stdio: 'inherit' });
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const assetlinks = JSON.parse(fs.readFileSync(assetlinksPath, 'utf8'));
const packageName = manifest.package_name;
if (!packageName) {
  console.error('✗ manifest: falta package_name');
  process.exit(1);
}
const expected = [
  ...new Set(
    (manifest.fingerprints ?? [])
      .filter((e) => e.sha256)
      .map((e) => e.sha256.trim().toUpperCase()),
  ),
].sort();
const actual = [...(assetlinks?.[0]?.target?.sha256_cert_fingerprints ?? [])].sort();
if (JSON.stringify(expected) !== JSON.stringify(actual)) {
  console.error('✗ assetlinks.json desincronizado con manifest — pnpm sync:assetlinks');
  process.exit(1);
}
if (assetlinks?.[0]?.target?.package_name !== packageName) {
  console.error('✗ assetlinks.json package_name no coincide con el manifest');
  process.exit(1);
}
const sha256Re = /^[0-9A-F]{2}(:[0-9A-F]{2}){31}$/;
for (const fp of expected) {
  if (!sha256Re.test(fp)) {
    console.error(`✗ huella SHA-256 inválida o placeholder: ${fp}`);
    process.exit(1);
  }
}
console.log('✓ assetlinks.json sincronizado con manifest de huellas');
const pendingRelease = (manifest.fingerprints ?? []).filter(
  (entry) =>
    ['release_local', 'eas_production', 'play_app_signing'].includes(entry.id) &&
    (!entry.sha256 || entry.status === 'pending'),
);
if (pendingRelease.length > 0) {
  console.log('⚠ debug fingerprint verified; Play/EAS release fingerprint pending');
  console.log('⚠ production app-link verification pending (no Vercel deploy in this phase)');
}

const documentedScripts = new Set([
  'dev',
  'dev:emulator',
  'open:emulator',
  'open:physical',
  'dev:usb',
  'dev:lan',
  'adb',
  'native:sync',
  'native:build:dev',
  'native:build:dev:clean',
  'native:build:release',
  'deeplink:test',
  'deeplink:test:https',
  'fingerprint:android',
  'sync:assetlinks',
  'validate',
  'typecheck',
  'test',
  'start',
  'web',
]);

for (const name of Object.keys(pkg.scripts)) {
  if (!documentedScripts.has(name)) {
    console.error(`✗ Script "${name}" no documentado en MOBILE_DEV.md`);
    process.exit(1);
  }
}
console.log('✓ scripts alineados con MOBILE_DEV.md');

if (!pkg.scripts.start || !/\bdev\b/.test(pkg.scripts.start)) {
  console.error('✗ start debe apuntar al flujo diario (pnpm dev / dev:emulator)');
  process.exit(1);
}
for (const name of ['dev:usb', 'dev:lan']) {
  if (!pkg.scripts[name]?.includes('--dev-client')) {
    console.error(`✗ ${name} debe usar --dev-client`);
    process.exit(1);
  }
}
const emulatorLauncher = fs.readFileSync(path.join(root, 'scripts/dev-emulator.mjs'), 'utf8');
if (!emulatorLauncher.includes('--dev-client')) {
  console.error('✗ scripts/dev-emulator.mjs debe usar --dev-client');
  process.exit(1);
}
console.log('✓ flujo dev-client en scripts de Metro');

execSync('pnpm typecheck', { cwd: root, stdio: 'inherit' });
execSync('pnpm test', { cwd: root, stdio: 'inherit' });
console.log('\n✓ validate OK');
