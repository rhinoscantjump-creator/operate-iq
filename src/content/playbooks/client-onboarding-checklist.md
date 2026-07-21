---
id: P06
title: Client onboarding checklist
description: Automate the client onboarding checklist for accounting firms so kickoff tasks stop living in email threads.
topic: client-onboarding
tools:
  - hubspot
  - typeform
symptom: "Every new client means rebuilding the same kickoff list from memory and chasing missing answers in email."
audience: Boutique accounting and bookkeeping firms onboarding 2–10 new clients per month.
timeLeak: "2–4 hours per new client on checklist creation, status chasing, and re-asking for the same documents."
guardrail: "Automation creates tasks and reminders — a human marks engagement ready before books or CRM status goes live."
draft: false
---

## Before → after

**Before:** Someone copies last month’s checklist into a doc or email. Tasks live in inboxes. Nobody knows which client is blocked on tax IDs, bank access, or signed engagement letters.

**After:** Signed proposal (or intake form) creates a standard checklist in your CRM or project tool. Owners see open items by client. Reminders fire on overdue steps — without rewriting the list each time.

## Steps to implement

1. **Write the master checklist once** — Fixed stages: engagement letter, intake form, ID / EIN, bank feeds, prior accountant contact, software access, first-month kickoff call.
2. **Trigger from one event** — “Proposal signed” in HubSpot (or paid invoice / Typeform submit) creates the checklist instance for that client.
3. **Assign owners by role** — Partner owns engagement; ops owns folder + access; bookkeeper owns bank feed setup.
4. **Auto-chase missing PBC items** — Reminder emails after 3 / 7 days on open checklist rows (draft only if tax advice is involved).
5. **Gate “active client” status** — CRM stage does not move to Active until a human checks the readiness box.

## Failure modes

- **One-size checklist for every service** — Tax-only vs monthly books need different packs; use templates by service line.
- **Checklist without owners** — Unassigned tasks pile up; require role on every row.
- **Premature Active status** — Staff start work before engagement is signed; keep the human gate.

## When not to automate

Complex multi-entity groups, first engagement with unusual compliance, or clients who need a custom scoping call before any template runs — start the checklist manually after the kickoff call.
