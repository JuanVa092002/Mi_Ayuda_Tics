# 18 — Guía de Onboarding para Desarrolladores Humanos (Human Onboarding)

> **Bienvenido a MiAyudaTics.** Esta guía paso a paso te llevará desde la clonación del repositorio hasta la ejecución local y la primera contribución segura.

---

## 1. Requisitos Previos del Sistema

- **Node.js:** Versión `>= 20.0.0` instalada.
- **pnpm:** Versión `>= 10.0.0` (gestor de paquetes monorepo obligatorio).
- **MongoDB:** Base de datos MongoDB local (versión 6+) o clúster en la nube en MongoDB Atlas (con soporte de réplicas para transacciones de Workflow v2).

---

## 2. Puesta en Marcha Local (Paso a Paso)

### Paso 1: Instalación de Dependencias
Ejecuta desde la raíz del monorepo (`MiAyudaTics_v1.0/`):
```bash
pnpm install
```

### Paso 2: Configuración de Variables de Entorno

#### Backend (`server/.env`):
Copia o verifica los valores en `server/.env`:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/miayudatics
JWT_SECRET=tu_secreto_jwt_local
FRONTEND_URL=http://localhost:5173
BREVO_API_KEY=tu_api_key_brevo
BREVO_SENDER_EMAIL=soporte@sena.edu.co
BREVO_SENDER_NAME="MiAyudaTIC Soporte"
```

#### Frontend (`client/.env`):
```env
VITE_BACKEND_URL=http://localhost:8000/api
```

### Paso 3: Compilar Contratos Compartidos
Antes de iniciar los servidores, compila `@miayuda/contracts`:
```bash
pnpm -C packages/contracts run build
```

### Paso 4: Iniciar Servidores de Desarrollo
Abre dos terminales:
```bash
# Terminal 1: Backend API (Puerto 8000)
pnpm -C server run dev

# Terminal 2: Frontend Vite (Puerto 5173)
pnpm -C client run dev
```

Visita `http://localhost:5173` en tu navegador.

---

## 3. Comprobación y Ejecución de Pruebas

Para verificar que tu entorno está íntegro y nada se ha roto:
```bash
# 1. Pruebas unitarias y de integración del backend
pnpm -C server test

# 2. Pruebas de componentes y flujos del frontend
pnpm -C client test

# 3. Verificación de tipos TypeScript en ambos
pnpm -C server run typecheck
pnpm -C client run typecheck
```

---

## 4. Flujo Recomendado para Resolver un Bug o Feature

1. **Lee primero el modelo de dominio:** [`04-DOMAIN-MODEL.md`](./04-DOMAIN-MODEL.md) para no introducir estados ilegales.
2. **Revisa los invariantes:** [`16-CRITICAL-INVARIANTS.md`](./16-CRITICAL-INVARIANTS.md).
3. **Consulta el Blast Radius:** [`17-BLAST-RADIUS.md`](./17-BLAST-RADIUS.md).
4. **Desarrolla con TDD o verificación continua:** Asegúrate de que las 56 suites de prueba de Vitest sigan pasando en verde antes de solicitar revisión.
