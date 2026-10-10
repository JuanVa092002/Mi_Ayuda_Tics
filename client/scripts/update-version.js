// Script para actualizar version.json antes de build
const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../public/version.json');
const timestamp = Date.now();
const gitHash = require('child_process')
  .execSync('git rev-parse --short HEAD 2>/dev/null || echo "unknown"')
  .toString()
  .trim();

const version = {
  timestamp,
  buildId: `${timestamp}-${gitHash}`,
  version: '1.0.0',
};

fs.writeFileSync(versionFile, JSON.stringify(version, null, 2) + '\n');
console.log(`[build] Updated version.json: ${JSON.stringify(version)}`);
