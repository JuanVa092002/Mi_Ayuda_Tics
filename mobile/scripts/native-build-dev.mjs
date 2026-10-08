#!/usr/bin/env node
/**
 * Installs an Android development build (expo-dev-client, DEBUGGABLE) on one USB target.
 *
 * Use ONLY when native inputs change:
 *   app.json / plugins / permissions / scheme / App Links / Expo or RN upgrade /
 *   new native module (e.g. expo-notifications).
 *
 * Do NOT run for .tsx, styles, hooks, Expo Router JS routes, copy, Zod, or business logic.
 * Those load from Metro via `pnpm open:emulator` / `pnpm open:physical`.
 *
 * Requires: JDK 17, Android SDK, adb device authorized.
 * When emulator + phone are both connected, set ANDROID_SERIAL to the install target.
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
import { assertAdbDevice, assertToolchain, resolveReactNativeArchitectures } from './_preflight.mjs';
import { PACKAGE_ID } from './_devices.mjs';

const clean = process.argv.includes('--clean');

assertToolchain();

console.log(`
┌─────────────────────────────────────────────────────────────┐
│  native:build:dev — rebuild NATIVO (no es Fast Refresh)     │
│  No lo uses por cambios de TSX, estilos o lógica JS.        │
│  Diario: pnpm dev:emulator + open:emulator / open:physical  │
└─────────────────────────────────────────────────────────────┘
`);

function run(cmd, cwd, env = {}) {
  console.log(`\n$ ${cmd}\n`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  });
}

const syncResult = spawnSync('node', [path.join(PROJECT_ROOT, 'scripts', 'native-sync.mjs')], {
  stdio: 'inherit',
});
if (syncResult.status !== 0) process.exit(syncResult.status ?? 1);

run('npm install --include=dev', NATIVE_ROOT);

const prebuildFlags = clean ? '--platform android --clean' : '--platform android';
run(`npx expo prebuild ${prebuildFlags}`, NATIVE_ROOT);

const localProps = path.join(NATIVE_ROOT, 'android', 'local.properties');
fs.writeFileSync(localProps, `sdk.dir=${ANDROID_HOME.replace(/\\/g, '/')}\n`);

assertAdbDevice();

const androidDir = path.join(NATIVE_ROOT, 'android');
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const serialEnv = ANDROID_SERIAL ? { ANDROID_SERIAL } : {};
const javaEnv = JAVA_HOME ? { JAVA_HOME } : {};
const architectures = resolveReactNativeArchitectures(ANDROID_SERIAL);
const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

console.log(`\n→ Arquitectura nativa: ${architectures} (target: ${ANDROID_SERIAL || 'default'})`);

run(
  `${gradle} app:assembleDebug -PreactNativeArchitectures=${architectures}`,
  androidDir,
  { ...javaEnv, ...serialEnv, ANDROID_HOME },
);

function installDebug() {
  if (ANDROID_SERIAL) {
    run(`adb -s ${ANDROID_SERIAL} install -r "${apkPath}"`, androidDir, {
      ...javaEnv,
      ...serialEnv,
      ANDROID_HOME,
    });
    return;
  }
  run(`${gradle} app:installDebug -PreactNativeArchitectures=${architectures}`, androidDir, {
    ...javaEnv,
    ANDROID_HOME,
  });
}

try {
  installDebug();
} catch {
  if (!ANDROID_SERIAL) throw new Error('installDebug failed');
  console.warn(
    `\n⚠ install -r falló (suele ser firma debug vs release en ${PACKAGE_ID}).\n` +
      `  Desinstalando la APK anterior en ${ANDROID_SERIAL} y reinstalando development build…\n`,
  );
  spawnSync('adb', ['-s', ANDROID_SERIAL, 'uninstall', PACKAGE_ID], { stdio: 'inherit' });
  run(`adb -s ${ANDROID_SERIAL} install "${apkPath}"`, androidDir, {
    ...javaEnv,
    ...serialEnv,
    ANDROID_HOME,
  });
}

console.log(
  `\n✓ Development build instalada (${architectures}).\n` +
    `  No abras el ícono a secas: conéctala a Metro.\n` +
    `  Emulador: pnpm open:emulator\n` +
    `  Físico:   ANDROID_SERIAL=${ANDROID_SERIAL || '<serial>'} pnpm open:physical`,
);
