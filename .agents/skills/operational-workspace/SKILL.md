---
name: operational-workspace
description: Enterprise B2B operational workspace design patterns synthesized from Linear, Stripe, Apple HIG, and Smashing Magazine. Use when refactoring tables, dashboards, queues, master-detail views, keyboard navigation, and high-density operator experiences.
metadata:
  author: smashmag-linear-stripe
  version: "1.0.0"
---

# B2B Operational Workspace Patterns (Linear, Stripe & Smashing Magazine)

Transforms slow, tabular backoffice screens into fluid, data-dense, keyboard-first operational command centers.

## 1. Ergonomic Layout Architecture

- **Eliminate Raw Horizontal Tables**:
  - Replace wide multi-column tables (>7 columns) with **Master-Detail Split Panes** or **Card-Row Hybrid Lists**.
  - Essential metadata stays in the row (Ticket ID, Subtitle, Assignee Avatar, SLA Badge, Quick Action).
  - Deep telemetry and logs slide out in a **Right-Side Detail Drawer** without navigating away or losing filter state.
- **Visual Scannability**:
  - Use dual encoding for status (Color + Icon + Text Label).
  - Relative timestamps (`hace 10 min`, `hace 2 horas`) with exact tooltip on hover (`27 Sep 2026 15:42`).
  - Monospace font (`font-mono`) for identifiers, ticket numbers, and tracking codes.

## 2. Speed of Interaction & Keyboard Efficiency

- **Command Palette (`Cmd+K` / `Ctrl+K`)**:
  - Global search and quick-action launcher for fast switching between views, tickets, or roles.
- **Keyboard Shortcuts**:
  - Quick actions on focused row: `J`/`K` (navigate up/down), `Enter` (inspect drawer), `E` (resolve), `A` (assign).
- **Batch Processing**:
  - Sticky bottom action bar appears when rows are selected, showing count and bulk actions (*Asignar*, *Cambiar estado*, *Priorizar*).

## 3. Visual Polish & Micro-Aesthetics

- **Subtle Layering & Surface Depth**:
  - Semi-translucent panels (`backdrop-blur-md bg-slate-900/80` or `bg-white/80`).
  - Ultra-thin borders (`border border-slate-800/60` or `border-slate-200/80`).
  - Inner glow / subtle highlight on cards to separate layers without heavy drop shadows.
- **Active State Affirmation**:
  - Clear selection rings and active item background accents so the operator always knows their focal point.
