---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance (Vercel, Linear, Apple HIG standard). Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Audit and enforce world-class UI/UX, accessibility (a11y), responsive layouts, and performance standards based on Vercel's Web Interface Guidelines.

## Guidelines Reference

The project includes the full codified guidelines at:
`.agents/skills/web-design-guidelines/guidelines.md`

Always consult this file when reviewing or implementing UI components in `client/src`.

## Core Audit Dimensions

1. **Accessibility (CRITICAL)**:
   - Icon-only buttons must have `aria-label`.
   - Form controls need associated `<label>` (`htmlFor`) or `aria-label`.
   - `<button>` for actions, `<a>`/`<Link>` for navigation (never `<div onClick>`).
   - Interactive elements need visible `:focus-visible:ring-2` (never naked `outline-none`).
   - Decorative icons must have `aria-hidden="true"`.
   - Toast/Alert updates need `aria-live="polite"`.

2. **Forms & Interaction**:
   - Explicit `type` and `autocomplete` on inputs.
   - Do not block paste.
   - Submit buttons show loading state and disable double-submits.
   - Inline field-level validation errors.

3. **Motion & Transitions**:
   - Always respect `prefers-reduced-motion`.
   - Animate `transform` and `opacity` only (avoid animating `width`, `height`, `margin`, or `padding`).
   - Never use `transition-all` indiscriminately; specify transition properties explicitly (`transition-colors`, `transition-opacity`, `transition-transform`).

4. **Typography & Layout**:
   - Hierarchical heading structure (`h1` -> `h2` -> `h3`).
   - Touch targets must be at least 44x44px on mobile/tablet.
   - Avoid horizontal overflow on responsive screens.
