#!/usr/bin/env node
/**
 * Release APK with an embedded JS bundle — QA / production freeze.
 * NOT the daily loop. Daily JS comes from Metro (dev:emulator + open:*).
 *
 * Use for: stakeholder demo without a laptop, Play/internal testing,
 * cold start without Metro, release-only bugs, App Links with the release cert.
 */
import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import {
  ANDROID_HOME,
  ANDROID_SERIAL,
  JAVA_HOME,
  NATIVE_ROOT,
  PROJECT_ROOT,
} from './_paths.mjs';
import { assertAdbDevice, assertToolchain, fail } from './_preflight.mjs';

assertToolchain();

console.log(`
┌─────────────────────────────────────────────────────────────┐
│  native:build:release — CORTE de calidad, no es el IDE      │
│  Congela el JS de este instante. Sin Fast Refresh.          │
│  Diario: pnpm dev:emulator + open:emulator / open:physical  │
└─────────────────────────────────────────────────────────────┘
`);

function run(cmd, cwd, env = {}) {
  console.log(`\n$ ${cmd}\n`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'production', ...env },
  });
}

const syncResult = spawnSync('node', [path.join(PROJECT_ROOT, 'scripts', 'native-sync.mjs')], {
  stdio: 'inherit',
});
if (syncResult.status !== 0) process.exit(syncResult.status ?? 1);

run('npm install --include=dev', NATIVE_ROOT);

const androidDirEarly = path.join(NATIVE_ROOT, 'android');
const gradleEarly = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
if (fs.existsSync(path.join(androidDirEarly, gradleEarly))) {
  try {
    run(`${gradleEarly} --stop`, androidDirEarly);
  } catch {
    // Daemon may already be stopped; prebuild --clean still needs the file unlocked.
  }
}

run('npx expo prebuild --platform android --clean', NATIVE_ROOT);

const localProps = path.join(NATIVE_ROOT, 'android', 'local.properties');
fs.writeFileSync(localProps, `sdk.dir=${ANDROID_HOME.replace(/\\/g, '/')}\n`);

const androidDir = path.join(NATIVE_ROOT, 'android');
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');

run(
  `${gradle} app:assembleRelease -PreactNativeArchitectures=arm64-v8a`,
  androidDir,
  {
    ...(JAVA_HOME ? { JAVA_HOME } : {}),
    ...(ANDROID_SERIAL ? { ANDROID_SERIAL } : {}),
    ANDROID_HOME,
  },
);

if (!fs.existsSync(apk)) {
  fail(`APK no generada: ${apk}`);
}

assertAdbDevice();

const adbInstall = ANDROID_SERIAL
  ? `adb -s ${ANDROID_SERIAL} install -r "${apk}"`
  : `adb install -r "${apk}"`;

run(adbInstall, androidDir);

console.log(`\n✓ Release instalada: ${apk}`);
console.log('  Esta APK no usa Metro. No la compares con el emulador en Fast Refresh.');
