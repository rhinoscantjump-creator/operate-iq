# Operate IQ — Cursor Handover

**Domain:** [operate-iq.com](https://operate-iq.com)  
**Product:** Multi-hub AI operating system for local service businesses (gyms, clinics, home services, salons, SMB)

**Naming (locked):** Hub · Operator · Operate IQ

---

## What this project is

A **product marketing / hub OS site** plus a **cross-hub platform runtime**. Each hub is an AI operator that plugs one revenue leak.

| Surface | Route / path |
|---------|--------------|
| Leak map (13 hubs, funnel-grouped) | `/` |
| Owner leak-score dashboard | `/dashboard` |
| Live hub product pages (01–05) | `/hubs/[slug]` |
| Hub 01 waitlist | `/#interest` → `POST /api/waitlist` |
| Platform runtime | `platform/` |
| FDE roadmap (SME) | `docs/FDE-HUB-01.md` |

**Source of truth for hub content:** `src/data/hubs.ts`

---

## Hub map (13 total)

**Live (01–05):** Database Reactivation · Reviews & Referrals · Website Lead Nurturing · Missed Call Text-Back · Sales Coaching

**Coming soon (06–13):** No-Show Recovery · Quote Follow-Up · Social Inbox · Win-Back · Reputation Defense · Owner Daily Brief · Payment Collection · Staff Onboarding GPT

**Runtime:** Hub 01 Outreach Operator implemented under `platform/src/hubs/hub-01/`. Hubs 02–13 are registry stubs.

---

## Stack & deploy

- Astro 5 static marketing site → `dist/`
- Platform package `@operate-iq/platform` (TypeScript, MemoryStore + Supabase migration)
- Vercel: static site + `api/waitlist.js` serverless function
- `astro.config.mjs` → `site: https://operate-iq.com`

```bash
npm install
npm run dev
npm run build
npm run platform:test
npm run platform:demo
npm run platform:eval
```

Env template: `.env.example` (`SUPABASE_*` for waitlist persistence / future auth).

---

## Thread starter

```text
@CURSOR-HANDOVER.md — Operate IQ hub OS + platform.

Current priority: [e.g. Hub 02 operator / wire Supabase / Stripe entitlements].

Constraints: stat discipline in hubs.ts — no invented hard percentages.
See docs/FDE-HUB-01.md for SME FDE checkpoints.
```
