# MiAyudaTIC — Documentation Index
> Last updated: 2026-10-11 | Reorganized to 9-domain architecture

## How to use this index

This index organizes documentation by **reader task** rather than by filename or directory structure. Use it to quickly find the right document for your current goal.

## 🧭 Understand the project
- **Product vision and ICP** → product/PRODUCT_OVERVIEW.md
- **System context and users** → history/01-PROJECT-CONTEXT.md
- **Current state overview** → history/02-CURRENT-STATE.md
- **Feature map** → history/03-FEATURE-MAP.md

## 🏗️ Understand the architecture
- **System topology and components** → architecture/ARCHITECTURE.md
- **Detailed architecture** → history/05-ARCHITECTURE.md
- **Domain model and entities** → history/04-DOMAIN-MODEL.md
- **Database architecture** → history/06-DATA-ARCHITECTURE.md
- **Backend API map** → history/07-BACKEND-MAP.md
- **Frontend structure** → history/08-FRONTEND-MAP.md
- **Role UX flows** → history/09-ROLES-UX.md
- **Architectural decisions (ADRs)** → architecture/DECISIONS.md
- **Workflows and state machines** → architecture/WORKFLOWS.md
- **Business invariants and contracts** → architecture/DATA_MODEL.md
- **Operating model** → architecture/operating-model.md

## ⚙️ Understand business logic
- **Contract invariants and RBAC** → architecture/DATA_MODEL.md
- **Workflow and state machines** → architecture/WORKFLOWS.md
- **Critical invariants** → history/16-CRITICAL-INVARIANTS.md
- **Blast radius / change risk** → history/17-BLAST-RADIUS.md

## 🛠️ Develop
- **Onboarding (human)** → history/18-HUMAN-ONBOARDING.md
- **Onboarding (agent)** → history/19-AGENT-ONBOARDING.md
- **Quality bar** → engineering/QUALITY_AND_TESTING.md
- **Design system** → engineering/DESIGN_SYSTEM.md
- **Architectural decisions** → architecture/DECISIONS.md
- **Development process** → engineering/DEVELOPMENT_PROCESS.md
- **CI/CD pipelines** → engineering/CI_CD.md

## 🧪 Test and quality
- **Testing strategy** → history/11-TESTING-QUALITY.md
- **Technical debt** → history/12-TECHNICAL-DEBT.md
- **Known limitations** → evidence/KNOWN_LIMITATIONS.md
- **Known unknowns** → history/20-KNOWN-UNKNOWNS.md

## 🚀 Deploy and operate
- **Web deployment** → operations/DEPLOYMENT.md
- **100% cloud environments** → operations/ENVIRONMENTS.md
- **Mobile deployment** → operations/DEPLOYMENT-MOBILE.md
- **QA backend deployment** → operations/DEPLOYMENT-QA.md
- **Rollback procedures** → operations/ROLLBACK.md
- **Runbooks** → runbooks/

## 🔐 Security
- **Security model** → history/10-SECURITY-MODEL.md
- **Security posture and compliance** → security/SECURITY_POSTURE.md
- **Security docs** → security/
- **Dependency triage** → security/SUPPLY_CHAIN.md

## 📜 Decisions and history
- **Architectural decisions (ADRs)** → architecture/DECISIONS.md
- **Engineering history** → evidence/ENGINEERING_HISTORY.md
- **Production incidents** → history/incidents/
- **Past specs** → history/openspec/
- **All historical context** → history/

## 👤 Agents and AI context
- **Gentle AI contract** → agent-os/gentle-ai-ide-agnostic-architecture.md
- **Agent roles and context** → agents/AGENT_ROLES.md
- **Agent onboarding** → history/19-AGENT-ONBOARDING.md
- **Agent context (compact)** → evidence/AGENT_CONTEXT.md
- **Handoff template** → agents/HANDOFF_TEMPLATE.md
- **Surface profiles** → current/ (web, backend, mobile, video)

## 📁 Evidence and portfolio
- **Canonical truth and forensics** → evidence/
- **Claims and evidence** → evidence/CLAIMS_AND_EVIDENCE.md
- **Contributions map** → evidence/CONTRIBUTIONS_AND_EVIDENCE.md
- **Workflow V2 deep dive** → evidence/WORKFLOW_V2.md
- **All canonical documents** → evidence/

## 📦 Archive (historical reference)
- **Agent OS evaluation** → history/archive/agent-os-evaluation/
- **UX reconstruction sessions** → history/archive/ux-web-reconstruction/
- **Mission session records** → history/archive/missions/
- **Historical audits** → history/audits/
- **Product briefs** → history/briefs/
- **Case study** → history/case-study/
- **Incidents** → history/incidents/

## 📁 Directory Structure

```
docs/
├── product/              # Business vision, ICP, roadmap
├── architecture/         # System design, workflows, decisions
├── engineering/          # Implementation standards, design, quality
├── operations/           # Deployment, environments, rollback
├── agents/               # AI agent roles and context
├── security/             # Security controls and compliance
├── history/              # Historical context, past decisions
│   └── archive/          # Session logs and working records
├── evidence/             # Canonical truth and forensic evidence
├── current/              # Auto-generated surface profiles
└── README.md             # This navigation index
```

---

**Production URLs:** Web → `https://miayudatics.web.app` (Firebase Hosting) · API → `https://miayudatics-v1-0.onrender.com` (Render)

**Active contradictions requiring resolution:**
- Green color split: `#2f9600` vs `#39a900` (needs design resolution)
- Mobile strategy: Expo vs Flutter legacy vs PWA (needs pathway clarification)
- Environment routing: Branch→target mapping (needs verification)
- Production URL: `miayudatics.vercel.app` vs `miayudatics.web.app` (needs consolidation)