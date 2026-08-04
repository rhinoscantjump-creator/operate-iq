# Operate IQ — Cursor Handover

**Domain:** [operate-iq.com](https://operate-iq.com)
**Project folder:** `C:\Users\rhino giant\Desktop\Operate-IQ.com`
**Status:** Published **reference architecture**. Not a product on sale. Takes no enquiries.
**Built by:** Rhinos Can't Jump ([rhinoscantjump.com](https://rhinoscantjump.com)) — the active brand.

---

## What this project is now

A read-only design study: a thirteen-hub AI operating system mapped for local service businesses. Each hub names one revenue leak and documents steps, KPIs, integrations, and guardrails.

It serves as a **credibility artifact** for Rhinos Can't Jump — proof of systems thinking, linkable from LinkedIn. It is not a funnel.

**Deliberately absent:** no contact page, no email, no form, no sales CTA. If someone wants to talk, the footer and homepage point at rhinoscantjump.com. Do not reintroduce a contact surface here.

| Surface | Route | Notes |
|---------|-------|-------|
| Landing | `/` | Reference framing, documented vs never built, hub rollup, RCJ credit |
| Hub directory | `/hubs` | Canonical list of all 13 + companions |
| Hub detail | `/hubs/[slug]` | Documented hubs get the AEO playbook; outline hubs get a stub |
| Ad Multiplier | `/hubs/ad-multiplier` | Companion, not an Operator |
| Leak map | `/leak-map` | Hire paths, OS map, anti-patterns, sample score |
| Owner score | `/dashboard` | Design sketch, invented numbers, labelled as such |
| 404 | `/404` | Styled |

**Source of truth:** `src/data/hubs.ts` (hubs, `product`, `product.reference`, `product.author`)
**Companions:** `src/data/companions.ts`
**Types & funnel order:** `src/data/types.ts`
**Visual design:** `design-system/MASTER.md` (tokens, motion, CTA rules) + `design-system/CHANGELOG.md` (append every visual change). Page overrides in `design-system/pages/`. Motion: `public/scripts/motion.js` (CSS + IntersectionObserver; no WebGL).

---

## Hub map (13 total)

`HubStatus` describes **documentation depth, not availability** — nothing here is running software.

- `documented` → "Full playbook" — leak, steps, KPIs, failure modes, guardrails, `deepDive`
- `outline` → "Outline only" — just the `outlineLeak` statement

**Documented (01–07):** Database Reactivation · Reviews & Referrals · Website Lead Nurturing · Missed Call Text-Back · Sales Coaching · No-Show Recovery · Quote Follow-Up

**Outline only (08–13):** Social Inbox · Win-Back · Reputation Defense · Owner Daily Brief · Payment Collection · Staff Onboarding GPT

Exports are `documentedHubs` / `outlineHubs`; labels come from `hubStatusLabels` in `types.ts`. Do not reintroduce "live" or "coming soon" — both imply a product that does not exist.

---

## Stack & deploy

- Astro 5 static → `dist/`, Vercel via `vercel.json`
- `@astrojs/sitemap` → `/sitemap-index.xml`, referenced from `public/robots.txt`
- Vercel Web Analytics via `@vercel/analytics/astro` in `BaseLayout.astro` — **still needs enabling in the Vercel dashboard**
- SEO: canonical, Open Graph, Twitter tags, JSON-LD (WebSite + creator sitewide; BreadcrumbList + HowTo on hub pages)

```powershell
cd "C:\Users\rhino giant\Desktop\Operate-IQ.com"
npm run dev      # http://localhost:4321
npm run build
git push         # Vercel auto-deploys
```

---

## Known gaps (deliberate or deferred)

- No `og:image` — needs a 1200x630 PNG in `public/` plus a tag in `BaseLayout.astro`
- `[slug].astro` has seven separate `{isLive && ...}` blocks with drifted indentation
- Inline `style="..."` scattered through pages instead of CSS classes
- No formatter or linter config
- Leak-score quiz idea was never built (belongs to RCJ now, if anywhere)

---

## Thread starter

```text
@CURSOR-HANDOVER.md — Operate IQ is a read-only reference architecture, not a product.

Constraints: no contact form, no email, no sales CTA. Stat discipline in hubs.ts —
no invented hard percentages. Hub status is documentation depth (documented / outline),
never product availability — do not reintroduce "live" or "coming soon".

Current priority: [e.g. add og:image / tidy [slug].astro / write up Hub 08].
```
