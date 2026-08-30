#!/usr/bin/env node
/**
 * Opens the development client on the Android emulator against the current Metro.
 *
 * Metro origin (bundle): http://10.0.2.2:8081 — AVD IPv4 alias of host 127.0.0.1.
 * That is NOT the app URI and does not use adb reverse.
 * App URI: GET /_expo/open?platform=android&runtime=custom, then `url` is set
 * to 10.0.2.2 (Expo's default open URL uses 127.0.0.1, which the AVD cannot hit).
 */
import {
  assertDevClient,
  assertMetro,
  EMULATOR_METRO_ORIGIN,
  openDevelopmentClient,
  resolveEmulatorSerial,
} from './_devices.mjs';

await assertMetro();
const serial = resolveEmulatorSerial();
assertDevClient(serial, 'emulador');

console.log(`→ Abriendo development build en ${serial}`);
await openDevelopmentClient(serial, EMULATOR_METRO_ORIGIN);
console.log('✓ Emulador conectado al Metro actual (10.0.2.2).');
