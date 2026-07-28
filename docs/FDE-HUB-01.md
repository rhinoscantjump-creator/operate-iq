# FDE → Hub 01 (SME) Roadmap

Adapts *FDE in 30 Days* for Operate IQ mom-and-pop / local service businesses.
Enterprise procurement theater is dropped; Audit → Evals → Deploy stays.

## Mapping

| FDE phase | SME Hub 01 version |
|-----------|--------------------|
| **Audit** | Owner uploads CRM/CSV. Map segments: never-booked, no-show, cancelled, lapsed. Capture consent + quiet hours. |
| **Evals** | Golden set of 20 dormant-lead cases (`hub-01-golden-v1`). Track pass rate before live send. |
| **Deploy** | 5–10% pilot SMS with vertical offer + booking link. Human handoff. Ramp only after KPIs hold. |

Cross-hub platform (tenants, contacts, consent, entitlements, jobs, audit) is shared. Each hub is a `HubOperator` plug-in. Hub 01 proves the pattern.

## Week checkpoints

### Week 1 — Working agent
- [x] CSV import adapter
- [x] Segment + vertical offer templates
- [x] Agent loop with tools + full audit trail
- [x] Guardrails: consent, quiet hours, escalate on STOP/anger/legal edge cases
- [x] Dry-run pilot batch

**CLI:** `npm run demo:hub01 -w @operate-iq/platform`

### Week 2 — Production-ready
- [x] Structured JSON decisions (Zod schemas)
- [x] Explicit failure codes (missing consent, bad phone, SMS timeout, partial completion…)
- [x] Checkpoint / resume on `agent_runs.checkpoint`
- [x] Idempotent send keys `runId:contactId:channel`

### Week 3 — Measure and optimize
- [x] 20-case golden dataset
- [x] Eval runner (correctness / action / escalation)
- [x] Cost routing: cheap tier for classify, primary for outreach copy/decision
- [x] KPI fields on run metrics (reactivation rate, list coverage; bookings/revenue when calendar webhooks exist)

**CLI:** `npm run eval:hub01 -w @operate-iq/platform`

### Week 4 — Communicate and defend
- [x] Owner evidence summary (problem / outcome / evidence / risk)
- [x] Engineer narrative (architecture / decisions / tradeoffs)
- [x] Marketing waitlist form → `/api/waitlist` (Supabase when configured)

## Repo layout

```
platform/
  supabase/migrations/001_platform_foundation.sql
  src/
    db/memory-store.ts          # local/dev store (Supabase-compatible shape)
    hubs/registry.ts            # HubOperator registry (01 live, 02–13 stubs)
    hubs/hub-01/                # Outreach Operator
    adapters/                   # crm-csv, sms stub/Twilio hook, calendar link
    evals/                      # golden set + runner
    jobs/                       # enqueue/resume helpers
api/waitlist.js                 # Vercel serverless interest capture
docs/FDE-HUB-01.md              # this file
```

## Monetization hooks (not billed yet)

- `hub_entitlements` with `source = pilot | manual | stripe`
- `businesses.stripe_customer_id`
- `hub_entitlements.stripe_subscription_item_id`
- Waitlist leads for demand signal before Stripe Checkout

## Next hubs

Implement `HubOperator` for Hub 02+ against the same contract. Do not invent a new backend per hub.
