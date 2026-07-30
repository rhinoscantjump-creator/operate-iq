# Operate IQ — Cursor Handover

**Domain:** [operate-iq.com](https://operate-iq.com)  
**Project folder:** `C:\Users\rhino giant\Desktop\Operate-IQ.com`  
**Product:** Multi-hub AI operating system for local service businesses (gyms, clinics, home services, salons, SMB)

**Naming (locked for now):** Hub · Operator · Operate IQ  
**Rebrand under consideration:** Move site to `rhinoscantjump.com` on Vercel and retire Operate IQ branding — **not decided**.

**Last session:** Jul 29, 2026 — structure, readability, AEO playbooks, analytics, `/hubs` index, leak-map split. All changes committed and pushed.

---

## What this project is

A **product marketing / hub OS site** — not accounting playbooks. Each hub is an AI operator that plugs one revenue leak.

| Surface | Route | Notes |
|---------|-------|-------|
| Home (hub browse) | `/` | Funnel order: **Reactivate → Reputation → Capture → Convert → Insight** |
| Leak map (full OS map) | `/leak-map` | Hire paths, funnel map, add-ons, anti-patterns, mini leak score |
| All 13 hubs index | `/hubs` | Numbered list with blurbs; links to each hub page |
| Hub detail (all 13) | `/hubs/[slug]` | Live hubs: AEO playbook deep-dive; coming-soon: preview |
| Owner leak-score dashboard | `/dashboard` | Sample scores today; live telemetry later |

**Source of truth for hub content:** `src/data/hubs.ts`  
**Types & funnel order:** `src/data/types.ts`  
**Reference implementation:** `C:\Users\rhino giant\Desktop\Operate-IQ 2.0\web` (accounting playbook / AEO format)

---

## Hub map (13 total)

**Live (01–05):** Database Reactivation · Reviews & Referrals · Website Lead Nurturing · Missed Call Text-Back · Sales Coaching

**Coming soon (06–13):** No-Show Recovery · Quote Follow-Up · Social Inbox · Win-Back · Reputation Defense · Owner Daily Brief · Payment Collection · Staff Onboarding GPT

Recommended next to flesh: **06, 07, 11**

---

## Stack & deploy

- Astro 5 static site → `dist/`
- Vercel: `vercel.json` (unchanged)
- Vercel Web Analytics: `@vercel/analytics/astro` in `BaseLayout.astro` — **enable in Vercel dashboard** (no CLI toggle)
- `astro.config.mjs` → `site: https://operate-iq.com`

**Local + cloud:** Same repo. Develop locally; push to Git → Vercel auto-deploys. Not two separate projects.

```powershell
cd "C:\Users\rhino giant\Desktop\Operate-IQ.com"
npm run dev      # http://localhost:4321
npm run build
git push         # Vercel auto-deploys
```

---

## Session summary (Jul 29, 2026)

### 1. Goals achieved

- **Vercel Analytics wired** — `@vercel/analytics` installed; `<Analytics />` in `src/layouts/BaseLayout.astro`.
- **Readability pass** — Looser spacing, larger type/line-height, less `text-transform: uppercase` in `src/styles/global.css`.
- **AEO playbook deep-dives** — `HubDeepDive` type + `deepDive` content for live hubs 01–05 in `hubs.ts`; rendered on `/hubs/[slug]` (symptom, audience, before/after, steps, failure modes, guardrails).
- **Homepage restructure** — `/` is hub browse only; order Reactivate → Reputation → Capture (Hub 01 above 02 above 03).
- **Dedicated leak map** — Full funnel/OS content moved to `/leak-map`.
- **Hubs index** — `/hubs` lists all 13 hubs with blurbs and click-through to `/hubs/[slug]`.
- **Mini leak score relocated** — “One score. Every leak ranked.” section moved from home to `/leak-map`.
- **Coming-soon hub pages** — All 13 slugs generate; non-live hubs show preview, not redirect.
- **Commits pushed** — Latest: `a02b628` (hubs index + leak score move), `80d9563` (home/leak-map split), `02e0a8a` (readability + AEO), `6933382` (analytics).

### 2. Decisions & architecture

| Decision | Why |
|----------|-----|
| **`homeFunnelOrder` separate from `funnelOrder`** | Homepage sells cash/reputation first; leak map keeps logical OS flow (Capture first). |
| **Leak map at `/leak-map`, not `/`** | Home = quick hub browse; leak map = deep OS narrative + hire paths + mini score. |
| **`/hubs` index + `/hubs/[slug]` for all 13** | Single discoverable directory; coming-soon hubs previewable without 404. |
| **AEO `deepDive` on live hubs only** | Reuses accounting-site playbook shape for answer-engine citations; avoids thin content on stubs. |
| **Sentence-case `diagramLabel`, sorted `hubsByFunnel`** | Readability; consistent Hub 01/02/03 order within each funnel block. |
| **No hero subline under H1** | User declined: *“Human in the loop. AI on the leaks you already paid for.”* |
| **Operate IQ name kept for now** | User weighing `rhinoscantjump.com` vs similar naming with old `rhino-site` — deferred. |
| **Stat discipline unchanged** | No invented hard percentages in `hubs.ts`. |

### 3. Open tasks / next steps

- [ ] **Enable Web Analytics** in Vercel project settings (code is ready).
- [ ] **Rebrand decision** — Operate IQ vs `rhinoscantjump.com`; if switching: domain, `astro.config.mjs` `site`, nav copy, Netlify → Vercel migration for that domain.
- [ ] **Flesh coming-soon hubs** — Priority: **06, 07, 11** (add `deepDive`, flip `status` to `live` when ready).
- [ ] **Hub 11 telemetry** — Wire live leak scores on `/dashboard` when backend exists (copy already references “morning brief when Hub 11 is live”).
- [ ] **Optional copy** — Hero audience line or vertical chips tweaks if rebrand lands.

### 4. Key code / structure

**Funnel orders** (`src/data/types.ts`):

```typescript
export const funnelOrder: FunnelStage[] = [
  "capture", "reactivate", "reputation", "convert", "insight",
];

export const homeFunnelOrder: FunnelStage[] = [
  "reactivate", "reputation", "capture", "convert", "insight",
];
```

**AEO deep-dive shape** (`src/data/types.ts`):

```typescript
export interface HubDeepDive {
  symptom: string;
  audience: string;
  timeLeak: string;
  guardrail: string;
  before: string;
  after: string;
  steps: string[];
  failureModes: { title: string; detail: string }[];
  whenNotToAutomate: string;
}
```

**Page map:**

```
src/pages/
  index.astro          → /           (hero + hubs by homeFunnelOrder)
  leak-map.astro       → /leak-map   (full OS map + mini leak score)
  dashboard.astro      → /dashboard
  hubs/
    index.astro        → /hubs       (all 13, numbered list)
    [slug].astro       → /hubs/:slug (live = playbook; soon = preview)
```

**Nav** (`src/layouts/BaseLayout.astro`): Home · Leak map · Owner score · Hubs · Leak score CTA

**Hub sorting** (`src/data/hubs.ts`):

```typescript
export function hubsByFunnel(stage: FunnelStage) {
  return hubs
    .filter((h) => h.funnelStage === stage)
    .sort((a, b) => a.number.localeCompare(b.number));
}
```

---

## Thread starter

```text
@CURSOR-HANDOVER.md — Operate IQ hub OS.

Current priority: [e.g. flesh Hub 06 / enable Vercel Analytics / rebrand to rhinoscantjump].

Constraints: stat discipline in hubs.ts — no invented hard percentages.
Live site: / = hub browse, /leak-map = OS map, /hubs = all 13 index.
```
