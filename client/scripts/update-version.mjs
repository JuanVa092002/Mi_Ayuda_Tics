// Script para actualizar version.json antes de build
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionFile = path.join(__dirname, '../public/version.json');
const timestamp = Date.now();

let gitHash = 'unknown';
try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // ignore
}

const version = {
  timestamp,
  buildId: `${timestamp}-${gitHash}`,
  version: '1.0.0',
};

fs.writeFileSync(versionFile, JSON.stringify(version, null, 2) + '\n');
console.log(`[build] Updated version.json: ${JSON.stringify(version)}`);
