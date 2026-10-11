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

### Mobile (Expo)
```bash
cd mobile
pnpm install
pnpm run start
# Scan QR code with Expo Go
```

## Architecture

**Monorepo** with three independent surfaces:
- **Web Client**: React 18 + Vite + TypeScript + Tailwind (Feature-Sliced Design)
- **API Server**: Express 5 + Mongoose 8 + TypeScript + Zod (Feature-based `features/`)
- **Mobile**: Expo 56 + React Native 0.85.3 + TanStack Query
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

- **Web**: https://miayudatics.vercel.app
- **API**: https://miayudatics-v1-0.onrender.com
- **Mobile**: (via EAS build distribution)
