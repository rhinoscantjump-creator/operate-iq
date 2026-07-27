# Operate IQ — Cursor Handover

**Domain:** [operate-iq.com](https://operate-iq.com)  
**Project folder:** `C:\Users\rhino giant\Desktop\Operate-IQ.com`  
**Product:** Multi-hub AI operating system for local service businesses (gyms, clinics, home services, salons, SMB)

**Naming (locked):** Hub · Operator · Operate IQ

---

## What this project is

A **product marketing / hub OS site** — not accounting playbooks. Each hub is an AI operator that plugs one revenue leak.

| Surface | Route |
|---------|-------|
| Leak map (13 hubs, funnel-grouped) | `/` |
| Owner leak-score dashboard | `/dashboard` |
| Live hub product pages (01–05) | `/hubs/[slug]` |

**Source of truth for hub content:** `src/data/hubs.ts`  
**Reference implementation:** `C:\Users\rhino giant\Desktop\Operate-IQ 2.0\web`

---

## Hub map (13 total)

**Live (01–05):** Database Reactivation · Reviews & Referrals · Website Lead Nurturing · Missed Call Text-Back · Sales Coaching

**Coming soon (06–13):** No-Show Recovery · Quote Follow-Up · Social Inbox · Win-Back · Reputation Defense · Owner Daily Brief · Payment Collection · Staff Onboarding GPT

Recommended next to flesh: **06, 07, 11**

---

## Stack & deploy

- Astro 5 static site → `dist/`
- Vercel: `vercel.json` (unchanged)
- `astro.config.mjs` → `site: https://operate-iq.com`

```powershell
cd "C:\Users\rhino giant\Desktop\Operate-IQ.com"
npm run dev      # http://localhost:4321
npm run build
git push         # Vercel auto-deploys
```

---

## Thread starter

```text
@CURSOR-HANDOVER.md — Operate IQ hub OS.

Current priority: [e.g. flesh Hub 06 page / wire live telemetry on dashboard].

Constraints: stat discipline in hubs.ts — no invented hard percentages.
```
