# @operate-iq/platform

Cross-hub operator runtime for Operate IQ. Hub 01 (Database Reactivation / Outreach Operator) is the first implementation.

## Setup

```bash
cd platform
npm install
npm run typecheck
npm test
npm run demo:hub01
npm run eval:hub01
```

## Supabase

Apply `supabase/migrations/001_platform_foundation.sql` to your project.
Set on Vercel (for waitlist + future auth):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (and/or `SUPABASE_SERVICE_ROLE_KEY` for server writes)

Local demos use `MemoryStore` and do not require Supabase.

## Operator contract

```ts
interface HubOperator {
  id: HubId;
  plan(input): Promise<OperatingPlan>;
  run(runId): Promise<void>;
  evaluate(datasetId): Promise<EvalReport>;
}
```

Register new hubs in `src/hubs/registry.ts`.
