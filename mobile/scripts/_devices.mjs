/**
 * ADB + Metro helpers for the daily dual-device workflow.
 *
 * Metro origin (how the JS client fetches the bundle) is NOT the app URI:
 *   emulator → http://10.0.2.2:8081  (no adb reverse)
 *   physical → adb reverse, then http://127.0.0.1:8081 on the phone
 *
 * App URI comes from GET /_expo/open (custom runtime); we then set the
 * `url` query to the Metro origin for that device.
 */
import http from 'http';
import { spawnSync } from 'child_process';
import { ANDROID_SERIAL } from './_paths.mjs';

export const PACKAGE_ID = 'com.miayudatics.mobile';
export const METRO_PORT = 8081;
export const INSPECTOR_PORT = 8097;
export const EMULATOR_METRO_ORIGIN = `http://10.0.2.2:${METRO_PORT}`;
export const PHYSICAL_METRO_ORIGIN = `http://127.0.0.1:${METRO_PORT}`;
export const METRO_STATUS_URL = `http://127.0.0.1:${METRO_PORT}/status`;

export function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

export function adb(serial, args, options = {}) {
  const serialArgs = serial ? ['-s', serial] : [];
  return spawnSync('adb', [...serialArgs, ...args], {
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
    ...options,
  });
}

export function parseOnlineDevices() {
  const result = spawnSync('adb', ['devices'], { encoding: 'utf8' });
  if (result.status !== 0) {
    fail('adb no disponible. Instala Android platform-tools y agrégalo al PATH.');
  }

  const lines = result.stdout
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean);

  const online = [];
  const blocked = [];

  for (const line of lines) {
    const [serial, state] = line.split(/\s+/);
    if (!serial || !state) continue;
    const entry = { serial, state, emulator: serial.startsWith('emulator-') };
    if (state === 'device') online.push(entry);
    else blocked.push(entry);
  }

  return { online, blocked, raw: result.stdout.trim() };
}

export function listOnlineEmulators() {
  return parseOnlineDevices().online.filter((d) => d.emulator);
}

export function listOnlinePhysical() {
  return parseOnlineDevices().online.filter((d) => !d.emulator);
}

/** Unique emulator, or ANDROID_SERIAL if it names an online emulator. */
export function resolveEmulatorSerial() {
  const emulators = listOnlineEmulators();
  if (ANDROID_SERIAL) {
    const match = emulators.find((d) => d.serial === ANDROID_SERIAL);
    if (!match) {
      fail(
        `ANDROID_SERIAL=${ANDROID_SERIAL} no es un emulador en estado "device".\n` +
          `  Arranca el AVD y espera a que ` +
          `adb devices muestre emulator-XXXX device.`,
      );
    }
    return match.serial;
  }
  if (emulators.length === 0) {
    fail(
      'Ningún emulador Android en estado "device".\n' +
        '  Arranca Samsung_26_Ultra, por ejemplo:\n' +
        '  emulator -avd Samsung_26_Ultra -no-snapshot-load -skin 1344x2992',
    );
  }
  if (emulators.length > 1) {
    fail(
      `Hay ${emulators.length} emuladores. Elige uno:\n` +
        emulators.map((d) => `  ANDROID_SERIAL=${d.serial} pnpm open:emulator`).join('\n'),
    );
  }
  return emulators[0].serial;
}

/** Unique physical device, or ANDROID_SERIAL if it names an online phone. */
export function resolvePhysicalSerial() {
  const phones = listOnlinePhysical();
  if (ANDROID_SERIAL) {
    if (ANDROID_SERIAL.startsWith('emulator-')) {
      fail(
        `ANDROID_SERIAL=${ANDROID_SERIAL} es un emulador. pnpm open:physical solo abre un teléfono USB.`,
      );
    }
    const match = phones.find((d) => d.serial === ANDROID_SERIAL);
    if (!match) {
      fail(
        `ANDROID_SERIAL=${ANDROID_SERIAL} no es un teléfono en estado "device".\n` +
          '  USB + depuración; acepta el diálogo RSA si aparece unauthorized.',
      );
    }
    return match.serial;
  }
  if (phones.length === 0) {
    fail(
      'Ningún teléfono físico en estado "device".\n' +
        '  Conecta USB con depuración. Si hay emulador, no cuenta como físico.',
    );
  }
  if (phones.length > 1) {
    fail(
      `Hay ${phones.length} teléfonos USB. Elige uno:\n` +
        phones.map((d) => `  ANDROID_SERIAL=${d.serial} pnpm open:physical`).join('\n'),
    );
  }
  return phones[0].serial;
}

export function metroHealthy() {
  return new Promise((resolve) => {
    const req = http.get(METRO_STATUS_URL, { timeout: 2000 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

export async function assertMetro() {
  if (await metroHealthy()) return;
  fail(
    `Metro no responde en ${METRO_STATUS_URL}.\n` +
      '  En otra terminal, desde mobile/MiAyudaTIC-Mobile:\n' +
      '  pnpm dev:emulator',
  );
}

export function isPackageInstalled(serial) {
  const result = adb(serial, ['shell', 'pm', 'path', PACKAGE_ID]);
  return result.status === 0 && Boolean(result.stdout?.includes('package:'));
}

export function isDebuggable(serial) {
  const result = adb(serial, ['shell', 'dumpsys', 'package', PACKAGE_ID]);
  return Boolean(result.stdout?.includes('DEBUGGABLE'));
}

/** expo-dev-client ships AuthActivity / devlauncher package; DEBUGGABLE alone is not enough. */
export function hasExpoDevLauncher(serial) {
  const result = adb(serial, ['shell', 'dumpsys', 'package', PACKAGE_ID]);
  return Boolean(result.stdout?.includes('expo.modules.devlauncher'));
}

export function assertDevClient(serial, kind) {
  if (!isPackageInstalled(serial)) {
    fail(
      `${PACKAGE_ID} no está instalada en ${serial} (${kind}).\n` +
        `  Instala development build:\n` +
        `  ANDROID_SERIAL=${serial} pnpm native:build:dev`,
    );
  }
  const debuggable = isDebuggable(serial);
  const launcher = hasExpoDevLauncher(serial);
  if (!debuggable || !launcher) {
    fail(
      `${PACKAGE_ID} en ${serial} no es una development build de expo-dev-client.\n` +
        `  DEBUGGABLE: ${debuggable ? 'sí' : 'no'} | expo-dev-launcher: ${launcher ? 'sí' : 'no'}\n` +
        '  Hace falta cascarón nativo con Metro (no basta “debuggable” ni una APK standalone).\n' +
        `  ANDROID_SERIAL=${serial} pnpm native:build:dev\n` +
        '  native:build:release es solo QA, no el loop diario.',
    );
  }
}

const EXPO_OPEN_URL = `http://127.0.0.1:${METRO_PORT}/_expo/open?platform=android&runtime=custom`;

/**
 * App URI from Expo (`exp+<slug>://expo-development-client/?url=…`).
 * `metroOrigin` is only the `url` query (Metro/manifest), not the deep link itself.
 */
export async function resolveDevelopmentClientUri(metroOrigin) {
  let payload;
  try {
    const res = await fetch(EXPO_OPEN_URL);
    if (!res.ok) {
      fail(`GET ${EXPO_OPEN_URL} → HTTP ${res.status}`);
    }
    payload = await res.json();
  } catch (error) {
    fail(`No se pudo leer ${EXPO_OPEN_URL}: ${error.message}`);
  }

  if (payload.runtime !== 'custom' || typeof payload.url !== 'string') {
    fail(`/_expo/open no devolvió runtime custom. Respuesta: ${JSON.stringify(payload)}`);
  }
  if (payload.appId && payload.appId !== PACKAGE_ID) {
    fail(`/_expo/open appId=${payload.appId} ≠ ${PACKAGE_ID}`);
  }

  let uri;
  try {
    uri = new URL(payload.url);
  } catch {
    fail(`/_expo/open devolvió un URI inválido: ${payload.url}`);
  }
  if (uri.host !== 'expo-development-client') {
    fail(`URI de Expo inesperado (host ${uri.host}). Se esperaba expo-development-client.`);
  }

  uri.searchParams.set('url', metroOrigin);
  return uri.toString();
}

export async function openDevelopmentClient(serial, metroOrigin) {
  const appUri = await resolveDevelopmentClientUri(metroOrigin);
  console.log(`  Metro origin: ${metroOrigin}`);
  console.log(`  App URI:      ${appUri}`);
  const result = adb(
    serial,
    ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', appUri],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    fail(`No se pudo abrir la development build en ${serial}.`);
  }
}

export function adbReversePorts(serial, ports = [METRO_PORT, INSPECTOR_PORT]) {
  for (const port of ports) {
    console.log(`→ adb -s ${serial} reverse tcp:${port} tcp:${port}`);
    const result = adb(serial, ['reverse', `tcp:${port}`, `tcp:${port}`], { stdio: 'inherit' });
    if (result.status !== 0) {
      fail(`adb reverse tcp:${port} falló en ${serial}.`);
    }
  }
}
