#!/usr/bin/env node
/**
 * USB adb reverse for a PHYSICAL phone only.
 * Not used by the emulator loop (AVD → 10.0.2.2:8081, no reverse).
 * API daily is Render HTTPS — do not reverse :18080.
 */
import { ANDROID_SERIAL } from './_paths.mjs';
import { adbReversePorts, fail, parseOnlineDevices } from './_devices.mjs';

const { online } = parseOnlineDevices();
const serial =
  ANDROID_SERIAL ||
  (online.length === 1 && !online[0].emulator ? online[0].serial : null);

if (!serial) {
  fail(
    'adb reverse es solo para un teléfono USB.\n' +
      '  Con varios devices: ANDROID_SERIAL=<serial-fisico> pnpm adb\n' +
      '  Emulador: no uses reverse. pnpm open:emulator (10.0.2.2).',
  );
}

if (serial.startsWith('emulator-')) {
  fail(
    `ANDROID_SERIAL=${serial} es un emulador. No se aplica adb reverse.\n` +
      '  Topología oficial del AVD: http://10.0.2.2:8081',
  );
}

const target = online.find((d) => d.serial === serial);
if (!target) {
  fail(`${serial} no está en estado "device".`);
}

adbReversePorts(serial);
console.log('\n✓ USB reverse listo (Metro 8081, inspector 8097) — solo físico. API = Render HTTPS.');
