#!/usr/bin/env node
/**
 * scripts/context/surface.mjs
 * Devuelve rutas canónicas de contexto para agentes según la superficie elegida.
 * No instala paquetes, no modifica archivos, termina en milisegundos.
 */

const surface = process.argv[2];

const surfaces = {
  web: {
    name: 'Web (Frontend)',
    profile: 'docs/current/web.md',
    readPaths: [
      'client/src/',
      'packages/contracts/src/',
      'docs/product.md',
      'docs/design-system.md',
      '.cursor/rules/60-web-scope.mdc',
      '.cursor/agents/product-engineer-web.md'
    ],
    excludePaths: [
      'server/',
      'mobile/',
      'marketing/',
      'docs/history/'
    ],
    verify: 'pnpm -C client run typecheck && pnpm -C client run test && pnpm -C client run build'
  },
  backend: {
    name: 'Backend (API / Platform)',
    profile: 'docs/current/backend.md',
    readPaths: [
      'server/src/',
      'packages/contracts/src/',
      'docs/current/current-web-backend-behavior-v2.md',
      'docs/contracts.md',
      '.cursor/rules/70-platform-scope.mdc',
      '.cursor/agents/product-engineer-platform.md'
    ],
    excludePaths: [
      'client/',
      'mobile/',
      'marketing/',
      'docs/history/'
    ],
    verify: 'pnpm -C server run typecheck && pnpm -C server run test && pnpm -C server run build'
  },
  mobile: {
    name: 'Mobile (Expo / React Native)',
    profile: 'docs/current/mobile.md',
    readPaths: [
      'mobile/MiAyudaTIC-Mobile/src/',
      'packages/contracts/src/',
      'docs/current/current-mobile-agent-context.md',
      'docs/design-system.md',
      '.cursor/rules/50-mobile-scope.mdc',
      '.cursor/agents/mobile-engineer.md'
    ],
    excludePaths: [
      'client/',
      'server/',
      'marketing/',
      'docs/history/',
      'mobile_flutter/'
    ],
    verify: 'pnpm -C mobile/MiAyudaTIC-Mobile run typecheck && pnpm -C mobile/MiAyudaTIC-Mobile run test'
  },
  video: {
    name: 'Marketing & Video (Remotion / Hyperframes)',
    profile: 'docs/current/video.md',
    readPaths: [
      'marketing/product-film/src/',
      'marketing/remotion-miayudatics-launch/',
      'marketing/hyperframes-miayudatics-launch/',
      '.agents/skills/remotion/'
    ],
    excludePaths: [
      'client/',
      'server/',
      'mobile/',
      'marketing/**/out/',
      'marketing/**/renders/'
    ],
    verify: 'pnpm -C marketing/product-film run build --help'
  }
};

if (!surface || !surfaces[surface]) {
  console.log('Uso: node scripts/context/surface.mjs <web|backend|mobile|video>');
  process.exit(1);
}

const data = surfaces[surface];
console.log(`=== Context Profile: ${data.name} ===`);
console.log(`Perfil: ${data.profile}`);
console.log('\nRutas que el agente DEBE leer:');
data.readPaths.forEach((p) => console.log(`  - ${p}`));
console.log('\nRutas que el agente DEBE excluir:');
data.excludePaths.forEach((p) => console.log(`  - ${p}`));
console.log(`\nComando de verificación:\n  ${data.verify}\n`);
