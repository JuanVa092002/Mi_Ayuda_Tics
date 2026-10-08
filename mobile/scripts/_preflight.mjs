import fs from 'fs';
import { spawnSync } from 'child_process';
import { ANDROID_HOME, ANDROID_SERIAL, JAVA_HOME } from './_paths.mjs';

export function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

/** JDK + Android SDK paths (native builds). */
export function assertToolchain() {
  if (process.platform === 'win32' && JAVA_HOME && !fs.existsSync(JAVA_HOME)) {
    fail(`JAVA_HOME no existe: ${JAVA_HOME}`);
  }
  if (!ANDROID_HOME || !fs.existsSync(ANDROID_HOME)) {
    fail(`ANDROID_HOME no existe: ${ANDROID_HOME}`);
  }
}

function listAdbDevices() {
  const devices = spawnSync('adb', ['devices'], { encoding: 'utf8' });
  if (devices.status !== 0) {
    fail('adb no disponible. Instala Android platform-tools y agrégalo al PATH.');
  }

  const lines = devices.stdout
    .trim()
    .split('\n')
    .slice(1)
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    online: lines.filter((l) => l.endsWith('\tdevice')),
    blocked: lines.filter((l) => /offline|unauthorized/.test(l)),
    raw: devices.stdout.trim(),
  };
}

/** At least one adb device in state "device". Enforces ANDROID_SERIAL when multiple targets. */
export function assertAdbDevice() {
  const { online, blocked, raw } = listAdbDevices();

  if (online.length > 1 && !ANDROID_SERIAL) {
    fail(
      'Múltiples devices conectados. Usa ANDROID_SERIAL=emulator-5554 (emulador) o el serial del físico.',
    );
  }

  if (ANDROID_SERIAL) {
    const target = online.find((line) => line.startsWith(`${ANDROID_SERIAL}\t`));
    if (!target) {
      fail(`ANDROID_SERIAL=${ANDROID_SERIAL} no está en estado "device".`);
    }
  }

  if (online.length === 0) {
    console.error('✗ Ningún dispositivo Android en estado "device".');
    if (blocked.length > 0) {
      for (const line of blocked) console.error(`  · ${line}`);
      console.error('\n  unauthorized → acepta el diálogo RSA en el teléfono.');
      console.error('  offline → reconecta USB; luego adb kill-server && adb start-server');
    } else {
      console.error('  Conecta el celular por USB con depuración activa.');
    }
    process.exit(1);
  }

  return raw;
}

/** Map device ABI → Gradle reactNativeArchitectures flag. */
export function resolveReactNativeArchitectures(serial = ANDROID_SERIAL) {
  if (process.env.REACT_NATIVE_ARCHITECTURES) {
    return process.env.REACT_NATIVE_ARCHITECTURES;
  }

  const serialArgs = serial ? ['-s', serial] : [];
  const abiResult = spawnSync('adb', [...serialArgs, 'shell', 'getprop', 'ro.product.cpu.abi'], {
    encoding: 'utf8',
  });
  const abi = abiResult.stdout?.trim();

  switch (abi) {
    case 'x86_64':
      return 'x86_64';
    case 'x86':
      return 'x86';
    case 'arm64-v8a':
      return 'arm64-v8a';
    case 'armeabi-v7a':
      return 'armeabi-v7a';
    default:
      return serial?.startsWith('emulator-') ? 'x86_64' : 'arm64-v8a';
  }
}
