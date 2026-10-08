import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JDK17_WIN = 'C:\\Program Files\\Microsoft\\jdk-17.0.19.10-hotspot';

/** Repo root (donde editas JS/TS con pnpm). */
export const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Path corto para Gradle en Windows (evita límite ~260 chars de CMake).
 * Override: MIAYUDA_NATIVE_ROOT=C:\otro\path
 */
export const NATIVE_ROOT =
  process.env.MIAYUDA_NATIVE_ROOT ||
  (process.platform === 'win32' ? 'C:\\miayuda' : '/tmp/miayuda-native');

/** Prefer Microsoft JDK 17 on Windows — Gradle 9 + RN require it; JDK 21 breaks foojay toolchains. */
export const JAVA_HOME =
  process.platform === 'win32' && fs.existsSync(JDK17_WIN)
    ? JDK17_WIN
    : process.env.JAVA_HOME || '';

export const ANDROID_HOME =
  process.env.ANDROID_HOME ||
  (process.platform === 'win32'
    ? path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk')
    : path.join(process.env.HOME || '', 'Android', 'Sdk'));

export const ANDROID_SERIAL = process.env.ANDROID_SERIAL || '';

export const EXCLUDES = [
  'node_modules',
  'android',
  'ios',
  '.expo',
  'android/.gradle',
  'android/app/build',
  'android/build',
];
