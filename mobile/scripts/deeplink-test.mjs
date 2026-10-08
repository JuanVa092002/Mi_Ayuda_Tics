#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { ANDROID_SERIAL } from './_paths.mjs';
import { assertAdbDevice } from './_preflight.mjs';

const SMOKE_TOKEN = 'a'.repeat(64);

const useHttps = process.argv.includes('--https');
const token =
  process.argv
    .slice(2)
    .find((arg) => arg !== '--' && arg !== '--https') || SMOKE_TOKEN;

const url = useHttps
  ? `https://miayudatics.vercel.app/restablecerPassword/${token}`
  : `miayudatics://restablecerPassword/${token}`;

assertAdbDevice();

const serialArgs = ANDROID_SERIAL ? ['-s', ANDROID_SERIAL] : [];

console.log(`→ ${url}\n`);

const result = spawnSync(
  'adb',
  [
    ...serialArgs,
    'shell',
    'am',
    'start',
    '-a',
    'android.intent.action.VIEW',
    '-d',
    url,
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
