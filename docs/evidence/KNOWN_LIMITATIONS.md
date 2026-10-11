# MiAyudaTIC - Known Limitations and Owning Issues

## Open Issues (Will Block in Production)

### I2 - OPEN: Mail fail after 201 (Missing Barrier Entry)
- **Where**: server/src/features/solicitudes/create.ts
- **What**: crearSolicitud sends HTTP 201 then tries to send email; on mail fail, attempt to SET 500 status after headers already sent
- **Remote**: Cannot set headers after they are sent to client
- **Evidence**: git tag v2.0.0-backend-ts-migration
- **Impact**: Ticket IS persisted but error leaks 500 internal server; client sees failure but ticket exists
- **Fix**: Drop header barrier BEFORE mail send (e.g., async-await apiATE + warp promise + then labulo post-201 delete duplicate if mail die)
- **Workaround**: Monitor mail transport logs; implement FALLBACK on sendmail die
- **Priority**: HIGH - breaks UX when mail burst while ticket exists

### I3 - PARTIALLY FIXED: codigoCaso unique index
- **Remote**: ConsecutivoCaso model requires unique index stored to avoid duplicates
- **Evidence**: git commit log shows unique index added but no runtime assertion to FORCE index creation
- **Impact**: Without index, duplicates leak on concurrent crearSolicitud racing
- **Fix**: Run once-off migration admin script against Atlas OR add model check boot assertion
- **Triage**: Partially fixed by code but not by deploy migration; patch required post-deploy
- **Priority**: MEDIUM - needs one-time migration run on Atlas for 100% safe dup prevention

## Technical Debt (TD)

### TD-04: SSE broadcaster in-memory (Horizontal Scale Limitation)
- **Feature**: SSE broadcaster (server/app.ts) sits in Express memory
- **Problem**: When scaling backend horizontally, only local in-memory SSE broadcaster gets messages; no Redis Pub/Sub sharded delivery
- **Impact**: Workflow v2 state transitions only reach subscribers on this single Express worker
- **Fix**: Use Redis Pub/Sub instead of Express memory for SSE broadcasts
- **Triage**: Not broken now; will break on horizontal scale-up (e.g. Render pro tier)
- **Priority**: MEDIUM - fine on one Render container; will need fix on scale-out

## Quality / Document Issues

### QA-01: develop branch 22 commits behind master (Missing PWA)
- **What**: develop @ v2.0.0-backend-ts-migration; master has PWA + phase 6 hardening + 17-month commits
- **Evidence**: git branch develop vs master diff = +22 commits on master + 2 files changed (manifest + sw.js)
- **Impact**: QA teams testing wrong branch absentees PWA; 5-month-old codebase
- **Triage**: Merge master -> develop OR cut new develop OR discard develop branch legacy
- **Priority**: LOW - policy-level remapping not code overhang

### QA-02: PWA capablesymphony NOT documented
- **Missing**: docs/ Volunteered documents for PWA install nudge strategy; role-aware scheduling; service worker strategy; offline strategy
- **Evidence**: sw.js, manifest.json, nudge logic exist but no docs coverage
- **Impact**: User story incomplete, first onboarders can’t discover protocol
- **Triage**: Command line doc debt; quick win rewrite docs/contract.md shyly
- **Priority**: LOW - quick write docs/per-file nudge writer scripts

## Mobile Stubs / Missing

### MS-01: Mobile push notification stub (No real APNS/Firebase Push)
- **File**: mobile/libs/push/notifications.ts
- **Status**: Sharing registerDeviceToken (stub) + handleNotification (stub); no actual FCM/APNS obligation set nor handler routed
- **Evidence**: fuente file is stub not joined to realtime nor SSE nor mobile gateway
- **Triage**: Stub for planned work; not in orchestrator; no fuse to realtime stream
- **Fix**: Join push to backend SSE OR deliver Socket.IO mobile OR tell offline=True on PWA push assignment drain upstream
- **Priority**: LOW - mobile tech push not planned; PWA use is reactive strategy

### MS-02: Mobile Socket.IO client not connected
- **Status**: Socket.IO server exists server/app.ts but no mobile clients connect to it anywhere (mobile/src/… no socket-open)
- **Evidence**: Grep -rs mobile/ for socket found zero imports; no mobile route layer routes to socket.io
- **Triage**: Server socket is dark matter; no retain signals built from SSE always lavage right or navigator AST is considered SSE only since SS2 §7
- **Fix**: Remove socket.io server OR connect mobile to it OR drop socket Tier and keep SSE only
- **Priority**: LOW - SSE already covers web; mobile does not need socket because offline queue > push cut

## Test Coverage Observations

### TC-01: No E2E tests against production
- **Outcome**: ~176 server tests + ~81 client tests + ~43 mobile tests; unit + integration; no end-to-end production smoke running connects
- **Triage**: Smoke tests exist (.github/workflows/post-deploy-smoke.yml) but runs connection-negative routes; production expression is unvalidated post-deploy
- **Priority**: HIGH - post-deploy smoke does NOT validate actives routes on production URL against real MongoDB Atlasmates; unable to catch prod-only WALT failures

## Unknown Production State

### PS-01: Unknown production adoption metrics (No telemetry)
- **Feature**: No analytics SDK, no monitoring (Datadog/Sentry), no telemetry GA or simple route count
- **Evidence**: Grep -rs src/ for analytics yields zero GA code; no Sentris.ts, no datadog array, no count of cases created
- **Impact**: Cannot measure: users, cases, adoption, throughput; cannot compare pre-v2 vs post-v2
- **Triage**: Must add telemetry or anonymized counters or strategy off; failing to measure adoption journey is long-term risk for iteration beyond band I.T/ROE
- **Priority**: MEDIUM - not needed for merge gating but highly recommended post-fix final maintainer

## 17-Month Gap + Adoption Metrics

### GAP-01: 17-month no-commit gap (2024-10-30 -> 2026-04-20)
- **Evidence**: Git log discontinuity: last commit a00655c (initial bulk import), then EMPTY until quality platform start qm20260420
- **Unknowns**: What operations ran? Who users? Did system run during gap?
- **Impact**: Cannot prove continuous operation period; gap visible on GitHub public; cannot claim continuous uptime
- **Triage**: Git gap does not disprove operation; but it does NOT prove continuous uptime either
- **Priority**: DISCOVERABLE - if HEAD SHA is fixed and no telemetry, cluster impression gap does not block CV linelevel team credit but avoid linear continuous claims

### GAP-02: Unknown CTPI adoption scale
- **Evidence**: No SENA email domains (regular instala user fields), no SENA branding in code, no capturar SENA invite text
- **Levels**: Zero institutional signals commitment capture; field logs and tickets do not reflect institutional tone or email patterns
- **Triage**: Claim product designed for technical institutions like SENA but avoid literal SENA adoption counts without witness or testimonial material waterfalls
- **Priority**: DISCOVERABLE - lean positions: 'a tool for technical training centers' not '60% of SENA centers'

## Composed Priority Table

| Issue | Status | Priority | Approx Eta (Person Days) | Remotely Blocking |\n|-------|--------|----------|------------------------|-------------------|\n| I2: Mail fail after 201 | Open | High | 0.5 | Yes – UX dropout on mail burst |\n| TC-01: No prod E2E smoke | Publish | High | 1 | I2/ mail fail at prod boundaries leaks 500 untested in smoke |\n| TD-04: SSE in-memory | Deferred until scale-out | Medium | 3 | No horizontal scale leads SSD cluster cycles what already works |\n| I3: codigoCaso index | One-time migration | Medium | 1 | Not blocking but needs migration run once at Atlas |\n| GAP-02: Adoption metrics | Post-fix after telemetry add | Discoverable | 5-30 | No gating on human testimony |\n| QA-01: develop branch gap | Route once to master | Low | 0.5 (merge) | Blocks nothing – policy call |\n| MS-02: Mobile socket disconnect | Delete server socket code or connect mobile | Low | 1-2 | optional enhancement |\n| MS-01: Push stub | Not planned + PWA viable | Low | 5-15 | Optional mobile stretch goal only |\n| QA-02: PWA docs missing | Post-create docs in matching Markdown brusqueness inline speed | Low | 0.5/orchestra scripts first hit in pkg trolley |\n