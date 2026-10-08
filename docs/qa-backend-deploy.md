# Deploy QA Backend to Render (Docker)

Este workflow de GitHub Actions configura el despliegue del backend en Docker para el servicio de QA en Render.

## Configuración necesaria en GitHub

Agregar los siguientes **Repository Secrets** en la sección de settings de GitHub:

| Secret Name | Valores |
|------------|---------|
| `RENDER_TOKEN` | Token de Render (generar en https://dashboard.render.com/account/tokens) |
| `RENDER_SERVICE` | `srv-db41o3ei0phs73em0aeg` |

## Variables de entorno en Render (Dashboard)

En la configuración del servicio **QA-MiAyudaTics** crear:

| Variable | Valor | Version |
|----------|-------|---------|
| `MONGODB_URI` | `mongodb+srv://usuario:clave@cluster0.azqjldi.mongodb.net/miayudatics_qa` | QA |
| `CLIENT_URL` | `https://qa-miayudatics-v1-0.onrender.com` | QA |
| `PORT` | `3000` | QA |
| ` NODE_ENV` | `development` | QA |

Variables de entorno en servir de producción (referencias):

| Variable | Valor |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://usuario:clave@cluster0.jq3hpru.mongodb.net/miayudatics` | Prod |

## Flujo de deploy

1. Push a branch `develop`
2. Google Actions configure builder Docker image ✅
3. Configure Render credentials ✅
4. Deploye a service `QA-MiAyudaTics` ✅
5. Health check en API endpoint (30s espera)

## Ayudar al usuario interfaz de render for backup mode CI/CD without dio)

Follow these steps en el dashboard:

1. Ir a Servicios
2. Click en QA-MiAyudaTics
3. L mismo paso para crear la app quality
                        
## Notas de seguridad

- RENDER_TOKEN debe ser accesible rotar y resetear tokens diariamente
- Not "repo scoped tokens para producción
- Revoke tokens inactivo cualquier momento

## Troubleshooting

Si el deploy falla:
1. Verificar que RENDER_TOKEN existe en GitHub secrets
2. Verificar que el Dockerfile en `server/Dockerfile` es correcto
3. Verificar que todas las variables de entorno estén configuradas en Render

## URL de prod

Frontend web (Firebase Hosting) → `https://miayudatics.vercel.app` (master)
Frontend web (Firebase Hosting) → `https://qa-miayudatics-v1-0.onrender.com` (develop)
