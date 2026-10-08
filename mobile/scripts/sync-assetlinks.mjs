#!/usr/bin/env node
/**
 * Genera client/public/.well-known/assetlinks.json desde el manifest de huellas.
 * Fuente de verdad: android-fingerprints.manifest.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(
  scriptDir,
  '../../../client/public/.well-known/android-fingerprints.manifest.json',
);
const assetlinksPath = path.resolve(
  scriptDir,
  '../../../client/public/.well-known/assetlinks.json',
);

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  fail(`Manifest no encontrado: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const packageName = manifest.package_name;
if (!packageName) {
  fail('manifest: falta package_name');
}

const fingerprints = (manifest.fingerprints ?? [])
  .filter((entry) => typeof entry.sha256 === 'string' && entry.sha256.trim().length > 0)
  .map((entry) => entry.sha256.trim().toUpperCase());

const unique = [...new Set(fingerprints)];
if (unique.length === 0) {
  fail('manifest: ninguna huella sha256 activa — añade al menos debug');
}

const assetlinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: unique,
    },
  },
];

fs.mkdirSync(path.dirname(assetlinksPath), { recursive: true });
fs.writeFileSync(assetlinksPath, `${JSON.stringify(assetlinks, null, 2)}\n`);

console.log(`✓ assetlinks.json generado (${unique.length} huella(s))`);
for (const fp of unique) {
  console.log(`  · ${fp}`);
}

const pending = (manifest.fingerprints ?? []).filter(
  (entry) => !entry.sha256 && entry.status === 'pending',
);
if (pending.length > 0) {
  console.log('\nPendientes (Play Store / release):');
  for (const entry of pending) {
    console.log(`  · ${entry.id}: ${entry.label}`);
    if (entry.how_to_obtain) {
      console.log(`    → ${entry.how_to_obtain}`);
    }
  }
}
