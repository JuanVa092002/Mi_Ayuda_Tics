#!/usr/bin/env node
/**
 * Opens the development client on a USB phone against the SAME Metro as the emulator.
 *
 * Metro origin (bundle): after `adb reverse tcp:8081 tcp:8081`, the phone
 * fetches http://127.0.0.1:8081 (IPv4 loopback). That is NOT the app URI.
 * App URI: GET /_expo/open?platform=android&runtime=custom, then `url` is set
 * to that Metro origin. Scheme comes from Expo (`exp+<slug>`), not invented here.
 *
 * Does not rebuild. Requires expo-dev-launcher + DEBUGGABLE + live Metro.
 */
import {
  adbReversePorts,
  assertDevClient,
  assertMetro,
  openDevelopmentClient,
  PHYSICAL_METRO_ORIGIN,
  resolvePhysicalSerial,
} from './_devices.mjs';

await assertMetro();
const serial = resolvePhysicalSerial();
assertDevClient(serial, 'físico');

adbReversePorts(serial);

console.log(`\n→ Abriendo development build en ${serial}`);
await openDevelopmentClient(serial, PHYSICAL_METRO_ORIGIN);
console.log('\n✓ Físico en el mismo Metro que el emulador (USB reverse). No se tocó la APK.');
