# quality-bar.md — MiAyudaTIC

> The bar is not "works on my machine." The bar is **founder-signable**.

---

## Shipping quality

A change ships when **all** apply:

| Gate | Command / check |
|------|-----------------|
| Types clean | `pnpm -C server run typecheck` / `pnpm -C client run typecheck` |
| Tests pass | `pnpm -C server run test` (+ client if touched) |
| Build zero errors | `pnpm -C server run build` / `pnpm -C client run build` |
| Mobile typecheck | `cd mobile/MiAyudaTIC-Mobile && pnpm typecheck` (if mobile touched) |
| Scope boundary | Only declared files; handoff filled |
| Human review | Founder-CTO or delegated owner sign-off |

**Prod release additionally:** `pnpm run smoke:prod` → 12/12; mobile API smoke if auth/socket/media changed.

---

## Premium UX

| Rule | Web | Mobile |
|------|-----|--------|
| Loading states | Every async action | Every async + skeleton lists |
| Empty states | Actionable copy, not blank | Same |
| Errors | Inline field errors; toast only global network | Alert + retry |
| Hierarchy | One primary CTA per screen | One primary green CTA |
| Brand | `#04324d` / `#39a900` tokens only | Same RGB tokens |
| Motion | Subtle; no gimmick | Native feel; 60fps scroll |

**Reject:** placeholder screens in prod without roadmap date; broken images; mixed ES/EN.

---

## Mobile is first-class

Mobile is first-class when:

1. **Not a WebView wrapper** of the SPA.
2. **Native auth** — SecureStore + Bearer (implemented).
3. **Camera/evidence** — expo-image-picker for solicitud/solución (v2 required).
4. **Offline** — queue solicitud draft when no network (v3 target); never silent data loss.
5. **Push** — assignment and closure notifications (v3 target).
6. **Performance** — list virtualization for técnico casos; no N+1 API on scroll.

**Current gap (honest):** mobile funcionario/técnico ticket flows exist in code; they are not “auth only.” Remaining gaps are socket/push, full native release fingerprints, and a measured cross-client E2E. Quality bar for new mobile work is production hardening of those shipped flows, not a greenfield Stage 1 rewrite.

---

## Performance expectations

| Surface | Target |
|---------|--------|
| Web LCP | < 2.5s on 4G (Vercel CDN) |
| API p95 | < 500ms excluding cold start |
| Render cold start | Document in UX; retry with backoff on mobile |
| Mobile TTI | < 2s on mid-range Android after bundle load |
| Socket reconnect | Exponential backoff; user sees "reconectando" |

---

## Accessibility

| Requirement | Bar |
|-------------|-----|
| Contrast | WCAG AA on primary text |
| Touch targets | ≥ 44px mobile |
| Forms | Labels + error association |
| Keyboard | Web forms fully keyboard-navigable |

No formal WCAG audit yet — **new screens must not regress**.

---

## Observability

| Layer | Required |
|-------|----------|
| Health | `/api/health` always 200; degraded in body if DB down |
| Logs | Morgan HTTP; no PII in logs |
| Errors | Sentry (target Stage 2) — until then, manual log review post-release |
| Product metrics | Leader charts + north-star manual tracking pilot |

---

## Security

| Rule | Enforcement |
|------|-------------|
| RBAC every protected route | `authMiddleware` + `checkRol` |
| No secrets in repo | `.env` gitignored |
| Password reset | No email enumeration leak |
| JWT | 2h TTL; httpOnly cookie web; Bearer mobile |
| Uploads | Magic-byte validation; size cap `MEDIA_MAX_BYTES` |
| CORS prod | Explicit whitelist — never `*` + credentials |

**HITL required:** any auth, RBAC, or schema change.

---

## Documentation

| When | What |
|------|------|
| Architecture change | Update `docs/architecture.md` + decision in handoff |
| Contract change | Update `packages/contracts` + `docs/contracts.md` |
| New role behavior | Update `docs/contracts.md` permissions matrix |
| Shipped feature | Handoff with acceptance criteria met |

Decorative docs forbidden. Every doc changes how we operate.

---

## Test expectations

| Area | Minimum |
|------|---------|
| Server auth/RBAC | Vitest + supertest (existing) |
| New API endpoint | Happy path + 401 + 403 tests |
| Client critical guards | RequireRole, roleHome (extend as needed) |
| Mobile v2+ | Auth integration test; solicitud create mock |
| E2E | Playwright for prod smoke paths (credentials in CI secrets target) |

**No merge** of auth/RBAC changes without tests.

---

## Anti-patterns (instant reject)

1. `any` in TypeScript
2. Cross-import between `client/src/features/*`
3. Hardcoded API URL in mobile (use `EXPO_PUBLIC_API_URL`)
4. Using Flutter legacy app against prod API
5. Líder flows on mobile without Founder-CTO approval
6. Duplicating contract types instead of extending `@miayuda/contracts`
7. 500+ line PRs without split plan
8. "Fix later" on security or RBAC
9. Polling forever without socket plan for notifications
10. Shipping with known broken assets

---

## Definition of world-class (MiAyudaTIC)

> A funcionario in an ambiente can report a problem with photo in under 60 seconds on a $200 Android, see a case code, and trust it will be assigned — while the líder sees the same case in a premium dashboard with zero data drift.

If we cannot demo that end-to-end, we are not world-class yet. **We are honest about the gap and ruthless about closing it.**

---

## References

- DoD template: `docs/handoff-template.md`
- Engineering rules: `.cursor/rules/20-engineering-standards.mdc`
- Risk register: `archive/audits/2026-06-13-code-audit/docs-vs-code.md`, `archive/audits/context-legacy/delivery/risk-register.md`
