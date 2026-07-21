# Operate-IQ — Cursor Handover

**Use this file to start new threads.** Paste or @-mention it so the agent picks up full project context without old chat history.

**Domain:** [operate-iq.com](https://operate-iq.com)  
**Brand:** Operate-IQ — AI-powered business optimization  
**Niche:** Boutique accountants & bookkeepers  
**Phase:** Content library only — no offers, pricing, or audit CTAs yet

---

## What this project is

A **library of playbooks and topic hubs** — not a blog dump. Visitors (and AI answer engines) browse by **pain** and by **software**, not by publish date.

| Layer | Location |
|-------|----------|
| Full content strategy | `CONTENT-MAP.md` |
| Topic hubs (pillars) | `src/content/topics/` |
| Short playbooks | `src/content/playbooks/` |
| Site routes | `/topics/`, `/playbooks/`, `/tools/`, `/about` |

---

## Build status (Jul 2026)

### Site code — DONE
- Astro scaffold with topics, playbooks, and tools index pages
- All 6 pillar topic pages written
- Playbook page template fields: symptom, audience, time leak, guardrail, before/after, steps, failure modes

### Content published

| ID | Playbook | Hub | Status |
|----|----------|-----|--------|
| P01 | Bank statements → QuickBooks | Receipt capture | **Done** |
| P02 | Gmail receipts → QuickBooks | Receipt capture | **Done** |
| P03 | Gmail receipts → Xero | Receipt capture | **Done** |
| P04–P24 | See `CONTENT-MAP.md` | Various | **Not started** |

**Receipt capture hub** (`src/content/topics/receipt-capture.md`) links P01–P03. Week 1 cluster is complete.

**Next task:** Start Week 2 onboarding cluster — P06, P07, P22, then publish/refine the Client onboarding hub.

---

## Publishing cadence (do not ignore)

Do **not** run 400-word posts daily forever.

| Format | Cadence | Length |
|--------|---------|--------|
| Short playbook | 3–4 / week | 400–700 words |
| Deep pillar / hub | 1 every 1–2 weeks | 1,200–2,000 words |
| Daily 400 sprint | Optional 2–3 week launch only | Then stop |

**Sustainable target:** ~20 pieces/month.

### Recommended weekly rhythm

| Day | Job |
|-----|-----|
| Mon | Playbook — exact tool-pair or symptom fix |
| Tue | Playbook — sibling connection (same pain, other stack) |
| Wed | Research / screenshots / diagram prep |
| Thu | Playbook — third angle or guardrail variant |
| Fri (alt weeks) | Pillar — cluster the week's playbooks |

---

## Playbook page template

Every playbook should include:

1. Symptom headline (search language)
2. Who this is for (firm type + stack)
3. What is leaking time / margin
4. Before → after workflow
5. Numbered implementation steps
6. Human-in-the-loop guardrail
7. Failure modes / when not to automate
8. Related playbooks + parent hub link

Frontmatter pattern (see existing playbooks):

```yaml
---
id: P06
title: Client onboarding checklist
description: One-line search-intent summary.
topic: client-onboarding
tools:
  - hubspot
symptom: "Quote the pain in the client's words."
audience: Firm type + stack.
timeLeak: "Hours lost per week/month."
guardrail: "What must stay human-approved."
draft: false
---
```

---

## Master prompt shell (playbooks)

Generate playbook **body copy outside Cursor** when possible (same workflow as Dean Cooks hubs). Only the ID, title, topic, and angle change.

```text
Act as a workflow consultant writing for boutique accounting and bookkeeping firms. Write in clear US English. No hype, no "delve," no generic AI filler. Short sentences. Practical steps a firm owner can implement this week.

Write a playbook titled: "[PLAYBOOK TITLE]."

Target query: "[EXACT SEARCH PHRASE]"
Audience: [FIRM TYPE + SOFTWARE STACK]
Parent hub: [HUB NAME]

Structure using these exact Markdown headers:

## Before → after
(2–3 sentences each — concrete, not abstract)

## Steps to implement
(Numbered list, 5–7 steps, copyable and specific)

## Failure modes
(Bullet list — when this breaks, when NOT to automate)

## Guardrail
(One paragraph — what must stay human-reviewed before anything sends or posts)

Return only the article body in Markdown. Do not include frontmatter.
```

Then in Cursor: *"Create playbook P06 using this body — match frontmatter pattern from P01."*

---

## Pillar hubs (6 topics)

| Hub slug | Search job |
|----------|------------|
| `receipt-capture` | Stop receipt chaos — bank feeds, inbox, OCR |
| `client-onboarding` | Kickoff checklists, intake, engagement letters |
| `billing-ap` | Invoice triage, AP, Stripe reconciliation |
| `payroll-data-entry` | Stop manual typing from docs into software |
| `client-communication` | Email follow-ups, status updates, safe AI drafts |
| `security-guardrails` | Credential handoff, human approval before AI send |

Full 24-playbook map with IDs and working titles: **`CONTENT-MAP.md`**

---

## First 14 days (from plan)

**Week 1 — receipts** ✅ Done (P01, P02, P03 + receipt hub)

**Week 2 — onboarding** ← **YOU ARE HERE**
- Mon: P06 — Client onboarding checklist
- Tue: P07 — Typeform → HubSpot tax intake
- Thu: P22 — New client folder pack
- Fri: Publish/refine Client onboarding hub

---

## Commands

```bash
npm install
npm run dev
npm run build
```

---

## Thread starter (copy-paste)

```text
@CURSOR-HANDOVER.md — Operate-IQ project.

Current priority: [e.g. write P06 playbook / polish receipt hub / add tools index entry].

Constraints: content library phase only — no pricing or service CTAs. Match existing playbook frontmatter and template.
```

---

## Not deciding yet

Video audits, lucky-draw funnel, paid PDF toolkit, affiliate inserts. Library URLs stay stable; layers can be added later.
