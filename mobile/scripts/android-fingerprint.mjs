#!/usr/bin/env node
/**
 * Huellas SHA-256 para App Links — APK hoy, Play Store después.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { JAVA_HOME } from './_paths.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(
  scriptDir,
  '../../../client/public/.well-known/android-fingerprints.manifest.json',
);
const assetlinksPath = path.resolve(
  scriptDir,
  '../../../client/public/.well-known/assetlinks.json',
);

function keytoolPath() {
  if (process.platform === 'win32' && JAVA_HOME) {
    const candidate = path.join(JAVA_HOME, 'bin', 'keytool.exe');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return 'keytool';
}

function fingerprintFromKeystore(keystorePath, alias, storepass) {
  if (!fs.existsSync(keystorePath)) {
    return null;
  }

  const result = spawnSync(
    keytoolPath(),
    [
      '-list',
      '-v',
      '-keystore',
      keystorePath,
      '-alias',
      alias,
      '-storepass',
      storepass,
      '-keypass',
      storepass,
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    return null;
  }

  const match = result.stdout.match(/SHA256:\s*([0-9A-F:]+)/i);
  return match?.[1]?.toUpperCase() ?? null;
}

console.log('Android App Links — fingerprints\n');

const debugKeystore = path.join(os.homedir(), '.android', 'debug.keystore');
const debugFp = fingerprintFromKeystore(debugKeystore, 'androiddebugkey', 'android');
if (debugFp) {
  console.log(`Local debug keystore:\n  ${debugFp}\n`);
} else {
  console.log('Local debug keystore: no encontrado (~/.android/debug.keystore)\n');
}

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`Manifest (${manifest.package_name} → ${manifest.domain}):\n`);
  for (const entry of manifest.fingerprints ?? []) {
    const status = entry.sha256 ? 'active' : entry.status ?? 'pending';
    console.log(`  [${status}] ${entry.id}`);
    console.log(`    ${entry.label}`);
    if (entry.sha256) {
      console.log(`    ${entry.sha256}`);
    } else if (entry.how_to_obtain) {
      console.log(`    → ${entry.how_to_obtain}`);
    }
    console.log('');
  }
} else {
  console.log(`Manifest no encontrado: ${manifestPath}\n`);
}

if (fs.existsSync(assetlinksPath)) {
  const assetlinks = JSON.parse(fs.readFileSync(assetlinksPath, 'utf8'));
  const published = assetlinks?.[0]?.target?.sha256_cert_fingerprints ?? [];
  console.log(`assetlinks.json (${published.length} huella(s) publicadas):`);
  for (const fp of published) {
    console.log(`  · ${fp}`);
  }
}

console.log('\nActualizar manifest → regenerar assetlinks:');
console.log('  1. Edita client/public/.well-known/android-fingerprints.manifest.json');
console.log('  2. pnpm sync:assetlinks');
console.log('  3. Deploy Vercel del client/');
