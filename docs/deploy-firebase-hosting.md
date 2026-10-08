# Despliegue Completo a Firebase Hosting

## Estructura

El proyecto se despliega en **Firebase Hosting** con dos instancias:
- **Production**: `miayudatics.web.app`
- **QA**: `qa.miayudatics.web.app` (según disponibilidad)

## Configuración de Firebase

### 1. Instalar Firebase CLI

```bash
pnpm add -D firebase
```

### 2. Login a Firebase

```bash
firebase login
```

### 3. Crear Proyectos de Firebase

```bash
# Crear proyecto production
firebase use create miayudatics-prod

# Crear proyecto qa
firebase use create miayudatics-qa
```

### 4. Configurar Proyectos Production

```bash
firebase use miayudatics-prod

# Configurar hostings:
firebase hosting:init

# Configurar dominio miayudatics.web.app

# Deployar:
pnpm deploy:prod
```

### 5. Configurar Proyectos QA

```bash
firebase use miayudatics-qa

# Configurar hosting:
firebase hosting:init

# Configurar dominio qa.miayudatics.web.app (o qa-miayudatics.web.app)

# Deployar:
pnpm deploy:qa
```

## Dominios Disponibles

| Entorno | Dominio |
|---------|---------|
| Production | `miayudatics.web.app` |
| QA | `qa.miayudatics.web.app` or `qa-miayudatics.web.app` |

---

## Backend Despliegue (Render Docker)

### Producción (Master Branch)

- Rama: `master`
- Servicio: `srv-d8ma4qbs32s73de24tq` (MiAyudaTics_v1-0)
- Rama deploy: `master`
- Build: Docker image
- API: HTTPS: `https://miayudatics-v1-0.onrender.com`
- Frontend: `https://miayudatics.web.app`

### QA (Develop Branch)

- Rama: `develop`
- Servicio: `srv-db41o3ei0phs73em0aeg` (QA-MiAyudaTics)
- Rama deploy: `develop`
- Build: Docker image
- API: HTTPS: `https://qa-miayudatics-v1-0.onrender.com`
- Frontend: `https://qa.miayudatics.web.app` (o `qa-miayudatics.web.app`)

## Variables de Entorno

### Render Service Variables

| Variable | Valor Production | Valor QA |
|----------|------------------|----------|
| MONGODB_URI | `mongodb+srv://usuario:clave@cluster0.jq3hpru.mongodb.net/miayudatics` | `mongodb+srv://usuario:clave@cluster0.azqjldi.mongodb.net/miayudatics_qa` |
| CLIENT_URL | `https://miayudatics.web.app` | `https://qa.miayudatics.web.app` (o `qa-miayudatics.web.app`) |
| PORT | `3000` | `3000` |
| NODE_ENV | `production` | `development` |

## GitHub Actions

### Workflow QA Backend

El workflow `.github/workflows/deploy-qa-render.yml`:

```yaml
name: Deploy QA to Render

on:
  push:
    branches:
      - develop

env:
  NODE_VERSION: '20'
  PORT: '3000'
  RENDER_SERVICE: srv-db41o3ei0phs73em0aeg

steps:
  - Checkout code
  - Setup Node.js
  - Install dependencies
  - Build Docker image
  - Configure Render credentials
  - Verificar deploy
```

**Secrets de el repositorio**:

| Secret Name | Valor |
|------------|-------|
| RENDER_TOKEN | Token de Render |

## Impacto

- ✅ Frontend: **0% queda en Vercel**, todo en Firebase Hosting
- ✅ Backend Pro y QA: serde en Docker en Render con ramas separadas
- ✅ Dominios HTTPS: miayudatics.web.app (prod) y qa.miayudatics.web.app (qa)
- ✅ QA Backend: Se despliega en Djangoen cuando se haga push a Develop
- ✅ Production Backend: Se mantiene con el servicio prod y master branch

## Workflow de Producción

```bash
# Para desplegar cambios
git checkout master
git pull origin master

# Build y deploy frontend (Firebase)
pnpm -C client firebase deploy

# Deploy backend (Render - automatic via GitHub Actions)
# No action required, GitHub Actions esta se activa con cada push

# Veterados al integr tournament:
git push origin master
```

## Workflow de QA

```bash
# Para desplegar cambios de QA
git checkout develop
git pull origin develop

# Build y deploy frontend (Firebase)
pnpm -C client firebase deploy

# Deploy backend (Render - Docker)
# se activa automaticamente con GitHub Actions en develop
pnpm firebase:qa
```

## Dominio QA Alternativo

Si `qa.miayudatics.web.app` no está disponible, se puede usar:
- `qa-miayudatics.web.app`

Para cambiar esto, editar `client/.env.que.example` y `client/.env`:
```
VITE_QA_MODE=true
VITE_FIREBASE_PROJECT=miayudatics-qa
```

## Comandos Útiles

```bash
# Ver listas proyectos de Firebase
firebase list

# Cambiar entre proyectos
firebase use miayudatics-prod
firebase use miayudatics-qa

# Deploy solo frontend
pnpm deploy:prod
pnpm deploy:qa

# Deploy completo (backend + frontend)
# GitHub Actions se encarga del deploy del backend en Render
# Manually deploy frontend:
pnpm firebase:prod
pnpm firebase:qa
```

## Troubleshooting

### Firebase deploy falla
1. Verificar que firebase.use está correctamente configurado
2. Ejecute `firebase login` si es necesario
3. Ejecute `firebase deploy:prod` con logs detallados

### Backend en Render no levanta
1. Verificar que `RENDER_TOKEN` está en GitHub secrets
2. Verificar que las variables de entorno están configuradas en Render
3. Verificar que el Dockerfile en `server/Dockerfile` es correcto

### Frontend no conecta con backend de QA
1. Verificar que la URL de backend en `.env` corresponde correcta
2. Asegurar que QA modo está activado: `VITE_QA_MODE=true`
3. Ejecute un clean build: `rm -rf client/node_modules client/dist`
4. Vuelve a build: `pnpm -C client install && pnpm -C client build`
