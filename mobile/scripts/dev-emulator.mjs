#!/usr/bin/env node
/**
 * Daily Metro for the Android emulator (primary loop).
 *
 * Topology: Expo `--host localhost` + Node IPv4-first + Metro bind 127.0.0.1.
 * The emulator reaches that bind via 10.0.2.2 (see open-emulator-app.mjs).
 * Physical phones do NOT use this path — they use USB `adb reverse` in open:physical.
 *
 * Does not install APKs. One Metro on :8081.
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { listOnlineEmulators, metroHealthy, METRO_STATUS_URL } from './_devices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const env = {
  ...process.env,
  // Windows Node prefers IPv6 (::1) for `localhost`. The emulator alias 10.0.2.2
  // maps only to IPv4 127.0.0.1, so IPv6 Metro is unreachable from the AVD.
  NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --dns-result-order=ipv4first`.trim(),
};

const emulators = listOnlineEmulators();
if (emulators.length === 0) {
  console.error('✗ Ningún emulador Android en estado "device".');
  console.error('  Arranca el AVD primero, por ejemplo:');
  console.error('  emulator -avd Samsung_26_Ultra -no-snapshot-load -skin 1344x2992');
  console.error('  Luego: adb devices  (debe aparecer emulator-XXXX device)');
  process.exit(1);
}

console.log(`✓ Emulador: ${emulators.map((d) => d.serial).join(', ')}`);

if (await metroHealthy()) {
  console.log(`✓ Metro ya está en ${METRO_STATUS_URL} — no se inicia un segundo servidor.`);
  console.log('  Abre la app: pnpm open:emulator');
  console.log('  Físico (mismo bundle): pnpm open:physical');
  process.exit(0);
}

console.log('→ Iniciando Metro (--dev-client --host localhost, IPv4-first)…');

const expo = spawn('npx', ['expo', 'start', '--dev-client', '--host', 'localhost'], {
  cwd: PROJECT_ROOT,
  stdio: 'inherit',
  env,
  shell: true,
});

expo.on('exit', (code) => process.exit(code ?? 0));

const deadline = Date.now() + 60_000;
while (Date.now() < deadline) {
  if (await metroHealthy()) {
    console.log(`✓ Metro IPv4 listo: ${METRO_STATUS_URL} (un solo proceso; el AVD usa 10.0.2.2)`);
    break;
  }
  await new Promise((r) => setTimeout(r, 400));
}
if (!(await metroHealthy())) {
  console.error(`✗ Metro no respondió en IPv4 ${METRO_STATUS_URL} en 60s.`);
}
