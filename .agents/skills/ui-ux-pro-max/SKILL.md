---
name: ui-ux-pro-max
description: UI/UX design intelligence for web, mobile, and desktop. Use when designing, building, reviewing, or fixing interfaces, dashboards, tables, design systems, accessibility, touch interaction, responsive layout, typography, colors, animations, and premium SaaS UI implementation.
metadata:
  author: NextLevelBuilder
  version: "2.13.0"
---

# UI/UX Pro Max Design Intelligence

Design intelligence system with rules, palettes, typography pairings, and layout structures for building enterprise-grade, world-class B2B web applications.

## Reference Material

The complete reference rules and audit checklists are stored at:
`.agents/skills/ui-ux-pro-max/quick-reference.md`

## 10 Core Architectural Pillars

1. **Accessibility (WCAG 2.1 AA/AAA)**:
   - 4.5:1 minimum contrast ratio for text.
   - Distinct interactive elements (no guessing clickable areas).
   - High contrast focus indicators (`focus-visible:ring-2 focus-visible:ring-offset-2`).

2. **Touch & Interaction Ergonomics**:
   - Minimum 44×44px interactive touch targets for buttons/icons.
   - Minimum 8px spacing between adjacent touch targets.
   - Instant visual feedback on click/press with smooth 150-200ms transitions.

3. **Data-Dense & Workspace Layouts (B2B SaaS)**:
   - Modern workspaces replace raw horizontal table overflow.
   - Priority columns with fixed metadata cards, detail drawers, and side sheet inspection.
   - Scannable status pills/badges with dual encoding (icon + color + label).

4. **Typography Hierarchy**:
   - Clean sans-serif hierarchy (Inter / Plus Jakarta Sans / Roboto).
   - Base text 14-16px with line-height 1.5.
   - Secondary text muted with sufficient contrast (`text-slate-500` or `text-neutral-400`).
   - Monospace font for IDs, hashes, timestamps, and ticket codes (`font-mono`).

5. **Visual Depth & Elevation**:
   - Layered surfaces using subtle borders (`border-slate-800/60` or `border-slate-200/80`).
   - Multitiered soft shadows (ambient shadow + directional key light).
   - Subtle background gradients and blur overlays (`backdrop-blur-md`).

6. **State Completeness**:
   - Every view must have designed:
     * Loading state (Skeletons with pulse animation, no blank screen).
     * Empty state (Illustrative icon, clear explanation, call to action).
     * Error state (Clear message, error code, retry action button).
     * Partial / offline state.

7. **Motion & Spatial Continuity**:
   - Micro-animations for feedback (button scale, hover glow, drawer slide-in).
   - Standard easing curves (`ease-out` for entering elements, `ease-in` for exiting).
   - Always honor `prefers-reduced-motion`.
