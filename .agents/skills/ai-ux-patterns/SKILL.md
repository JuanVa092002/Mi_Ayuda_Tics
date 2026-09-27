---
name: ai-ux-patterns
description: Human-Centered AI interface patterns synthesized from Google PAIR Guidebook, Shape of AI, and AI UX Design Guide. Use when designing or building AI-driven, automated, recommendation, or intelligent features to ensure trust, transparency, user agency, and seamless interaction.
metadata:
  author: google-pair-shape-of-ai
  version: "1.0.0"
---

# Human-Centered AI UX Patterns (Google PAIR & Shape of AI Standard)

Comprehensive patterns for intelligent workflows, predictive support, automated categorization, and AI-assisted interfaces.

## 1. Explainability & Mental Models (Google PAIR)

- **Calibrated Trust**:
  - Never present automated predictions or ticket suggestions as absolute facts.
  - Pair predictions with visible confidence tiers (*Alta confianza*, *Sugerencia contextual*).
- **Explain the "Why"**:
  - Whenever an automated recommendation appears (e.g., ticket categorization, suggested technician assignment, SLA priority level), show a concise rationale tooltip or chip:
    * Example: *"Prioridad Alta sugerida debido a afectación de red en Sede Central"*.
- **Set Upfront Expectations**:
  - Clarify system capabilities and response times before the user submits a request.

## 2. User Agency & Human-in-the-Loop (HITL)

- **Control & Overrides**:
  - Every automated action (auto-classification, auto-routing, batch status resolution) must allow instantaneous manual override with zero friction.
- **Grace Period & Reversibility (Undo)**:
  - Destructive or high-impact actions (closing a ticket, reassigning cases) must provide a 5-second graceful undo toast before final commit.
- **Progressive Disclosure**:
  - Start with concise, actionable summaries for the user (e.g. *Funcionario*).
  - Reveal diagnostic logs, technical parameters, and routing history on demand via expandable sections or detail panels.

## 3. Co-Creation & Conversational Assistance (Shape of AI)

- **Assisted Input (No Blank Canvas Syndrome)**:
  - Provide smart chips, suggested prompts, and common issue categories when filing tickets.
- **Dynamic Context Retention**:
  - Keep active conversation or ticket history in view during troubleshooting steps so the user never has to re-explain their situation.
- **Feedback Loops**:
  - Provide simple 1-click feedback mechanisms (*"¿Fue útil esta solución?"* 👍 / 👎) to refine support suggestions over time.
