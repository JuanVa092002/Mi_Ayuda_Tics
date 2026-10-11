# MiAyudaTIC — Documentation Index
> Last updated: 2026-10-10 | HEAD: 29c39075ed1b7b85353f8c78ca938dbc37cd1b34

## How to use this index

This index organizes documentation by **reader task** rather than by filename or directory structure. Use it to quickly find the right document for your current goal.

## 🧭 Understand the project
- What is MiAyudaTIC? → docs/product.md
- System context and users → docs/system-overview/01-PROJECT-CONTEXT.md
- Current state overview → docs/system-overview/02-CURRENT-STATE.md
- Feature map → docs/system-overview/03-FEATURE-MAP.md

## 🏗️ Understand the architecture
- System topology and components → docs/ARCHITECTURE.md
- Detailed architecture → docs/system-overview/05-ARCHITECTURE.md
- Domain model and entities → docs/system-overview/04-DOMAIN-MODEL.md
- Database architecture → docs/system-overview/06-DATA-ARCHITECTURE.md
- Backend API map → docs/system-overview/07-BACKEND-MAP.md
- Frontend structure → docs/system-overview/08-FRONTEND-MAP.md
- Role UX flows → docs/system-overview/09-ROLES-UX.md

## ⚙️ Understand business logic
- Contracts, RBAC, invariants → docs/contracts.md
- Workflow and state machines → docs/workflow-v2.md
- Critical invariants → docs/system-overview/16-CRITICAL-INVARIANTS.md
- Blast radius / change risk → docs/system-overview/17-BLAST-RADIUS.md

## 🛠️ Develop
- Onboarding (human) → docs/system-overview/18-HUMAN-ONBOARDING.md
- Onboarding (agent) → docs/system-overview/19-AGENT-ONBOARDING.md
- Quality bar → docs/quality-bar.md
- Design system → docs/design-system.md
- Architectural decisions → docs/system-overview/15-ARCHITECTURAL-DECISIONS.md

## 🧪 Test and quality
- Testing strategy → docs/system-overview/11-TESTING-QUALITY.md
- Technical debt → docs/system-overview/12-TECHNICAL-DEBT.md
- Known limitations → docs/canonical/KNOWN_LIMITATIONS.md
- Known unknowns → docs/system-overview/20-KNOWN-UNKNOWNS.md

## 🚀 Deploy and operate
- Deploy (web/Firebase) → docs/deploy-firebase-hosting.md ⚠️
- Deploy (100% cloud) → docs/deploy-100-cloud-environments.md ⚠️
- Deploy (mobile) → docs/mobile-deployment.md
- Deploy (QA backend) → docs/qa-backend-deploy.md
- Rollback → docs/rollback-procedure.md
- Runbooks → docs/runbooks/

## 🔐 Security
- Security model → docs/system-overview/10-SECURITY-MODEL.md
- Security docs → docs/security/
- Dependency triage → docs/security/dependency-triage.md

## 📜 Decisions and history
- Architectural decisions → docs/system-overview/15-ARCHITECTURAL-DECISIONS.md
- Engineering history → docs/canonical/ENGINEERING_HISTORY.md
- Production incidents → docs/history/incidents/
- Past specs → docs/history/openspec/

## 👤 Agents and AI context
- Gentle AI contract → docs/agent-os/gentle-ai-ide-agnostic-architecture.md
- Agent onboarding → docs/system-overview/19-AGENT-ONBOARDING.md
- Agent context (compact) → docs/canonical/AGENT_CONTEXT.md
- Surface profiles → docs/current/ (web, backend, mobile, video)

## 📁 Evidence and portfolio
- Engineering forensics → docs/canonical/
- Claims and evidence → docs/canonical/CLAIMS_AND_EVIDENCE.md
- Contributions map → docs/canonical/CONTRIBUTIONS_AND_EVIDENCE.md
- Workflow V2 deep dive → docs/canonical/WORKFLOW_V2.md

## 📦 Archive (historical reference)
- Agent OS evaluation → docs/history/archive/agent-os-evaluation/
- UX reconstruction sessions → docs/history/archive/ux-web-reconstruction/
- Mission session records → docs/history/archive/missions/
- Historical audits → docs/history/audits/
- Product briefs → docs/history/briefs/
- Case study → docs/history/case-study/
- Incidents → docs/history/incidents/

---

**Production URLs:** Web → `https://miayudatics.web.app` (Firebase Hosting) · API → `https://miayudatics-v1-0.onrender.com` (Render)