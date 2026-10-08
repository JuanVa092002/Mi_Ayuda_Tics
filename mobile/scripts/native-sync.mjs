#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { EXCLUDES, NATIVE_ROOT, PROJECT_ROOT } from './_paths.mjs';

const excludeFlags = EXCLUDES.map((e) => `--exclude=${e}`).join(' ');

console.log(`Sync: ${PROJECT_ROOT}`);
console.log(`  →  ${NATIVE_ROOT}\n`);

import { fail } from './_preflight.mjs';

try {
  fs.mkdirSync(NATIVE_ROOT, { recursive: true });
  execSync(
    `tar ${excludeFlags} -cf - . | tar -xf - -C "${NATIVE_ROOT}"`,
    { cwd: PROJECT_ROOT, stdio: 'inherit', shell: true },
  );
} catch {
  fail('native:sync falló. Requiere tar (Git Bash en Windows).');
}

console.log('\n✓ Código sincronizado a NATIVE_ROOT (sin node_modules ni android/)');
