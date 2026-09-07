#!/usr/bin/env node
/**
 * Probe GET /api/health from an Android device namespace (not host curl).
 * Prints scheme/hostname/port/kind + http status + duration. No response body.
 *
 * Usage:
 *   node scripts/probe-api-health-from-device.mjs <serial> <origin>
 */
import { adb, fail } from './_devices.mjs';

function describeOrigin(rawUrl) {
  const parsed = new URL(rawUrl);
  const host = parsed.hostname.toLowerCase();
  const local =
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '10.0.2.2' ||
    host === '::1' ||
    host.endsWith('.local');
  return {
    scheme: parsed.protocol.replace(':', ''),
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
    kind: local ? 'local' : 'remote',
  };
}

const serial = process.argv[2];
const origin = process.argv[3];
if (!serial || !origin) {
  fail('Uso: node scripts/probe-api-health-from-device.mjs <serial> <origin>');
}

const info = describeOrigin(origin);
const healthUrl = `${origin.replace(/\/$/, '')}/api/health`;
console.info('[api-host]', info);

function runShell(command) {
  return adb(serial, ['shell', command]);
}

const started = Date.now();

const curl = runShell(
  `curl -sS -o /dev/null -w "status=%{http_code} durationMs=%{time_total}" --max-time 35 "${healthUrl}"`,
);
if (curl.status === 0 && /status=\d+/.test(curl.stdout || '')) {
  console.info('[api-health]', {
    via: 'curl',
    raw: (curl.stdout || '').trim(),
    hostWaitMs: Date.now() - started,
  });
  process.exit(0);
}

const wget = runShell(`wget -qO- --timeout=35 "${healthUrl}" >/dev/null; echo status=$?`);
const toybox = runShell(
  `toybox wget -S -O /dev/null "${healthUrl}" 2>&1 | toybox grep -E "HTTP/|wget:" | toybox head -n 4`,
);

console.info('[api-health]', {
  via: 'fallback',
  curlExit: curl.status,
  curlErr: (curl.stderr || curl.stdout || '').trim().slice(0, 180),
  wget: (wget.stdout || wget.stderr || '').trim().slice(0, 180),
  toybox: (toybox.stdout || toybox.stderr || '').trim().slice(0, 180),
  hostWaitMs: Date.now() - started,
});
