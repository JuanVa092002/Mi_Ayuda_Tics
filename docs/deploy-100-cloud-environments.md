# Deployment Guide - Production & QA 100% Cloud

## Overview

Both Production and QA environments are **100% cloud-deployed**:
- ✅ Frontend: Firebase Hosting (HTTPS domains)
- ✅ Backend: Docker containers on Render
- ✅ CI/CD: GitHub Actions (automatic on push)

## Environment Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repo                             │
│              JuanVa092002/Mi_Ayuda_Tics                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┐     ┌───────────────────────┐ │
│  │   master Branch          │     │   develop Branch       │ │
│  └──────────────────────────┘     └───────────────────────┘ │
│            │                                 │               │
│            ↓                                 ↓               │
│  ┌───────────────────────┐         ┌─────────────────────┐ │
│  │ Production Backend    │         │ QA Backend          │ │
│  │ Render Docker Service │         │ Render Docker Service│ │
│  │ https://miayudatics... │         │ https://qa-miayudat.. │ │
│  └───────────────────────┘         └─────────────────────┘ │
│            │                                 │               │
│            ↓                                 ↓               │
│  ┌───────────────────────┐         ┌─────────────────────┐ │
│  │ Production Firebase   │         │ QA Firebase          │ │
│  │ miayudatics.web.app   │         │ qa.miayudatics.web..│ │
│  │                        │         │ qa-miayudatics.web..│ │
│  └───────────────────────┘         └─────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Production Environment

### Frontend
```
Domain: https://miayudatics.web.app
Framework: Vite + React + TypeScript
Hosting: Firebase Hosting
```

**Deploy Command:**
```bash
pnpm deploy:prod
```

**What happens:**
1. Builds client/app in `node_modules/.vite`
2. Outputs to `client/dist`
3. Uploads to Firebase Hosting (miayudatics-prod target)
4. Invalidates Cloud CDN (if configured)
5. Returns `https://miayudatics.web.app`

### Backend
```
Service: 🏠 srv-d8ma4qbs32s73de24tq (MiAyudaTics_v1-0)
Runtime: Node.js 22
Container: Docker
Build: Automatic via GitHub Actions
```

**Repository State:**
```
Branch: master
Github Action: .github/workflows/main-deploy.yml (automatic)
Render Service: Docker
API Endpoint: https://miayudatics-v1-0.onrender.com
```

**Environment Variables (Render):**
```
MONGODB_URI=mongodb+srv://usuario:clave@cluster0.jq3hpru.mongodb.net/miayudatics
CLIENT_URL=https://miayudatics.web.app
PORT=3000
NODE_ENV=production
```

---

## QA Environment

### Frontend
```
Domain: https://qa.miayudatics.web.app (o qa-miayudatics.web.app)
Framework: Vite + React + TypeScript
Hosting: Firebase Hosting
```

**Deploy Command:**
```bash
pnpm deploy:qa
```

**What happens:**
1. Builds client/app in `node_modules/.vite`
2. Outputs to `client/dist`
3. Uploads to Firebase Hosting (qa target)
4. Invalidates Cloud CDN (if configured)
5. Returns `https://qa.miayudatics.web.app`

### Backend
```
Service: 🧪 srv-db41o3ei0phs73em0aeg (QA-MiAyudaTics)
Runtime: Node.js 22
Container: Docker
Build: Automatic via GitHub Actions
```

**Repository State:**
```
Branch: develop
Github Action: .github/workflows/deploy-qa-render.yml (automatic)
Render Service: Docker
API Endpoint: https://qa-miayudatics-v1-0.onrender.com
```

**Environment Variables (Render):**
```
MONGODB_URI=mongodb+srv://usuario:clave@cluster0.azqjldi.mongodb.net/miayudatics_qa
CLIENT_URL=https://qa.miayudatics.web.app (o qa-miayudatics.web.app)
PORT=3000
NODE_ENV=development
```

---

## Quick Start Guide

### Phase 1: Backend Deployment (GitHub Actions)

**Environments already setup on Render:**

✅ **Production:**
- Service: srv-d8ma4qbs32s73de24tq
- Branch automagically deployed from `master`
- Backend URL: `https://miayudatics-v1-0.onrender.com`

✅ **QA:**
- Service: srv-db41o3ei0phs73em0aeg
- Branch automagically deployed from `develop`
- Backend URL: `https://qa-miayudatics-v1-0.onrender.com`

**What to verify:**
1. Go to Render Dashboard
2. Check service states (should be green)
3. Check latest deploys on GitHub

### Phase 2: Frontend Deployment (Firebase)

#### Step 1: Install Firebase CLI
```bash
pnpm add -D firebase
npm install -g firebase-tools
```

#### Step 2: Login to Firebase
```bash
firebase login
```

#### Step 3: Create Firebase Projects
```bash
# Production project
firebase use create miayudatics-prod

# QA project
firebase use create miayudatics-qa
```

#### Step 4: Deploy Production Frontend
```bash
# For full deployment:
pnpm firebase:prod

# Or specific targets:
pnpm deploy:prod
```

**What to check:**
```
✅ Domain: https://miayudatics.web.app
✅ Index.html loads
✅ API calls to https://miayudatics-v1-0.onrender.com
✅ Database connection to cluster0.jq3hpru...
```

#### Step 5: Deploy QA Frontend
```bash
# For full deployment:
pnpm firebase:qa

# Or specific targets:
pnpm deploy:qa
```

**What to check:**
```
✅ Domain: https://qa.miayudatics.web.app (o qa-miayudatics.web.app)
✅ Index.html loads
✅ API calls to https://qa-miayudatics-v1-0.onrender.com
✅ Database connection to cluster0.azqjldi...
```

---

## Configuration Files

### firebase.json (Root)
Manages both Production and QA hostings in `client/` project.

### client/.firebaserc
Maps Environment → Firebase Project → Hosting Target.

### client/vite.config.ts (Updated)
Auto-detects production vs QA backend URL based on environment.

---

## Troubleshooting

### Frontend not loading after deploy
### Backend not accessible
### Environment mismatch
### Firebase deploy fails

---

## Deployment Status Check

### Production Status (master)
```
✅ GitHub Repo: JuanVa092002/Mi_Ayuda_Tics
✅ Branch: master
✅ Backend: srv-d8ma4qbs32s73de24tq on Render
✅ API: https://miayudatics-v1-0.onrender.com
⏳ Frontend: Deploy con pnpm deploy:prod
```

### QA Status (develop)
```
✅ GitHub Repo: JuanVa092002/Mi_Ayuda_Tics
✅ Branch: develop
✅ Backend: srv-db41o3ei0phs73em0aeg on Render
✅ API: https://qa-miayudatics-v1-0.onrender.com
⏳ Frontend: Deploy con pnpm deploy:qa
```

---

## Command Summary

| Environment | Frontend Deploy | Backend |
|-------------|----------------|---------|
| **Production** | `pnpm deploy:prod` | `master` branch → Render Docker |
| **QA** | `pnpm deploy:qa` | `develop` branch → Render Docker |

---

## URLs Summary

| Component | URL |
|-----------|-----|
| **Frontend Production** | https://miayudatics.web.app |
| **Frontend QA** | https://qa.miayudatics.web.app |
| **Backend Production** | https://miayudatics-v1-0.onrender.com |
| **Backend QA** | https://qa-miayudatics-v1-0.onrender.com |
