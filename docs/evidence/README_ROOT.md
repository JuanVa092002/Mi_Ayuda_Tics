# MiAyudaTIC - Sistema de Gestión de Solicitudes para CTPI  

**Solución digital de primera respuesta** para instituciones de formación técnica que necesitan estilizar procesos de soporte de usuarios y equipos, creando evidencia digital mínima y larga a través de un cartesiano de casos registrados destinés de la supervivencia de la Plataforma CTPI (Centro de Tecnologías para la Innovación).

Reemplaza papeleo y flujos WhatsApp marketing con un modelo de estado de vida basado en aprendizaje organizacional y refine sucesivo, escalando soporte humano y con promoción de la herramienta.

## Quick Start

### Server (API)
```bash
cd server
pnpm install
pnpm run dev
# Runs on http://localhost:3001
```

### Client (Web)
```bash
cd client
pnpm install
pnpm run dev
# Runs on http://localhost:3000
```

### Mobile (PWA)
The web app at https://miayudatics.web.app behaves as a native mobile app when installed.
Mobile-specific UI renders automatically via `usePhoneLayout` detection (UserAgent + viewport + touch).

(archived) Expo Native App
```bash
cd mobile && pnpm install && pnpm run start
# Note: Nearly complete Expo app, but NOT the production mobile strategy.
# Production mobile = PWA (client/ above)
```

## Architecture

**Monorepo** with production surfaces:
- **Web Client + PWA Mobile**: React 18 + Vite + TypeScript + Tailwind (extends to mobile via phone detection)
- **API Server**: Express 5 + Mongoose 8 + TypeScript + Zod (Feature-based `features/`)
- **Archived Mobile**: Expo 56 + React Native 0.85.3 + TanStack Query (not production deployment)
- **Contracts**: Shared Zod schemas (`@miayuda/contracts`)

All services communicate via JWT-authenticated REST API with dual token extraction (HttpOnly cookie for web, `Authorization: Bearer` for mobile).

## Documentation

- 📖 [Project Overview](docs/canonical/PROJECT_OVERVIEW.md)
- 🔧 [Architecture Guide](docs/canonical/ARCHITECTURE.md)
- ⚙️ [Workflow V2 Engine](docs/canonical/WORKFLOW_V2.md)
- ✅ [Onboarding Checklist](docs/canonical/ONBOARDING.md)
- 🔬 [Known Limitations](docs/canonical/KNOWN_LIMITATIONS.md)

## Tests

```bash
# Server tests
cd server && pnpm test

# Client tests
cd client && pnpm test

# Mobile tests
cd mobile && pnpm test
```

## Production URLs

- **Web**: https://miayudatics.web.app (Firebase Hosting)
- **API**: https://miayudatics-v1-0.onrender.com (Render)
- **Mobile**: Install via Chrome on phone → `https://miayudatics.web.app` → menu (⋮) → Add to Home Screen
