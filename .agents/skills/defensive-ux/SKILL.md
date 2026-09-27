---
name: defensive-ux
description: Defensive UI/UX and resilient client-side state patterns synthesized from Web.dev and Modern Web Guidance. Use when handling network latency, offline modes, optimistic updates, loading states, error boundaries, and edge cases.
metadata:
  author: web-dev-modern-guidance
  version: "1.0.0"
---

# Defensive UI/UX & Resilient State Patterns (Web.dev Standard)

Ensures that the interface remains rock-solid, responsive, and trustworthy even during slow networks, intermittent connectivity, or backend failures.

## 1. Zero-Flicker State Progression

- **Skeleton Screens vs Spinners**:
  - Never show a full-page centered spinner when data is loading.
  - Render skeleton placeholders mirroring the exact dimensions of final content with a gentle shimmer animation (`animate-pulse`).
- **Cumulative Layout Shift (CLS < 0.1)**:
  - Reserve fixed height/aspect ratios for avatars, badges, charts, and media to prevent layout jumping when data arrives.

## 2. Optimistic UI Updates & Recovery

- **Immediate Visual Gratification**:
  - When the user changes a status (e.g. *En Proceso* -> *Resuelto*), update the UI state instantly before the network response completes.
- **Graceful Rollback with Contextual Toast**:
  - If the mutation fails on the server:
    1. Revert UI state smoothly to the previous snapshot.
    2. Display a high-visibility toast alert explaining the issue with a single-click `"Reintentar"` action.

## 3. Contextual Empty & Error States

- **No Dead Ends**:
  - An empty state must never be a blank page with "Sin datos".
  - Must include:
    * Relevant SVG icon.
    * Human-friendly explanation.
    * Clear primary action button (e.g., *"Crear nueva solicitud"*, *"Limpiar filtros"*).
- **Error Boundaries**:
  - Isolate runtime errors to the specific card or widget without crashing the whole AppShell. Provide a local refresh trigger.
