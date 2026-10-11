# CI/CD — MiAyudaTIC

> Build, test, and deploy pipelines for web, backend, and mobile surfaces.

---

## CI pipelines

### Server (backend)

```bash
# Build
pnpm -C server run build

# Typecheck
pnpm -C server run typecheck

# Test
pnpm -C server run test
```

**Build script:** `server/scripts/build.mjs`

### Client (web)

```bash
# Build
pnpm -C client run build

# Typecheck  
pnpm -C client run typecheck
```

**Build output:** `client/dist/` for Vercel deployment

### Mobile (Expo)

```bash
# Typecheck
cd mobile/MiAyudaTIC-Mobile && pnpm typecheck
```

**Build:** EAS build via Expo

---

## CD pipelines

### Web (Vercel)

- **Source:** `client/` directory
- **Framework:** Vite
- **Root Directory:** `client`
- **Build Command:** `pnpm run build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Environment:** `VITE_BACKEND_URL` (or `VITE_API_URL` with `/api` suffix)

### Backend (Render)

- **Environment:** Node
- **Root Directory:** *(empty — monorepo root)*
- **Build Command:** `pnpm install --frozen-lockfile --filter nodeproyectosena... && pnpm -C server run build`
- **Start Command:** `pnpm -C server run start`
- **Health Check Path:** `/api/health`

**Key env vars:** `NODE_ENV`, `PORT`, `DB_URI`, `PUBLIC_URL`, `RENDER_URL`, `CLIENT_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `BREVO_API_KEY`, `CLOUDINARY_*`, `MEDIA_MAX_BYTES`, `REDIS_URL` (optional), `REQUIRE_SOLICITUD_FOTO`, `STORAGE_PATH`

### Mobile (EAS)

- **Platform:** Expo 56
- **App:** `mobile/MiAyudaTIC-Mobile/`
- ** distribution:** Internal testing via EAS

---

## Smoke testing

Verify deployments with:

```bash
# Production smoke
pnpm run smoke:prod

# Or manually
./scripts/smoke-prod.sh
```

**Checks:** Health endpoint, auth routes, critical flows

---

## References

- Architecture: `architecture/ARCHITECTURE.md`
- Deployment procedures: `operations/DEPLOYMENT.md`, `operations/DEPLOYMENT-MOBILE.md`
- Quality bar: `engineering/QUALITY_AND_TESTING.md`
