-- Operate IQ platform foundation
-- Multi-tenant schema for cross-hub operators (Hub 01+)
-- Stripe hooks present; billing not wired yet.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type vertical_pack as enum (
  'gym',
  'clinic',
  'home-services',
  'salon',
  'general'
);

create type agent_run_status as enum (
  'pending',
  'planning',
  'running',
  'paused',
  'completed',
  'failed',
  'cancelled'
);

create type audit_event_kind as enum (
  'prompt',
  'response',
  'tool_call',
  'tool_result',
  'send',
  'skip',
  'escalate',
  'error',
  'checkpoint',
  'metric'
);

create type dormancy_segment as enum (
  'never-booked',
  'no-show',
  'cancelled',
  'lapsed',
  'unknown'
);

create type eval_ideal_action as enum (
  'message',
  'skip',
  'escalate'
);

-- ---------------------------------------------------------------------------
-- Core tenants
-- ---------------------------------------------------------------------------

create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vertical vertical_pack not null default 'general',
  timezone text not null default 'America/New_York',
  quiet_hours_start smallint not null default 21, -- 0-23 local hour
  quiet_hours_end smallint not null default 8,
  booking_link text,
  stripe_customer_id text, -- Stripe-ready; unused until monetization
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create index profiles_business_id_idx on profiles (business_id);

-- ---------------------------------------------------------------------------
-- Contacts + consent
-- ---------------------------------------------------------------------------

create table contacts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  external_id text,
  full_name text,
  phone text,
  email text,
  last_activity_at timestamptz,
  segment dormancy_segment not null default 'unknown',
  sms_consent boolean not null default false,
  email_consent boolean not null default false,
  do_not_contact boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, external_id)
);

create index contacts_business_id_idx on contacts (business_id);
create index contacts_segment_idx on contacts (business_id, segment);

-- ---------------------------------------------------------------------------
-- Integrations (credentials encrypted at app layer before write)
-- ---------------------------------------------------------------------------

create table integrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  provider text not null, -- crm | sms | calendar | ...
  status text not null default 'disconnected',
  credentials_encrypted text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, provider)
);

-- ---------------------------------------------------------------------------
-- Hub entitlements (manual/pilot now; Stripe later)
-- ---------------------------------------------------------------------------

create table hub_entitlements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  hub_id text not null, -- e.g. hub-01
  enabled boolean not null default true,
  source text not null default 'pilot', -- pilot | manual | stripe
  stripe_subscription_item_id text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, hub_id)
);

-- ---------------------------------------------------------------------------
-- Agent runs + audit
-- ---------------------------------------------------------------------------

create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  hub_id text not null,
  status agent_run_status not null default 'pending',
  mode text not null default 'dry-run', -- dry-run | live
  pilot_percent numeric(5, 2) not null default 10,
  checkpoint jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  cost_tokens_in integer not null default 0,
  cost_tokens_out integer not null default 0,
  cost_usd numeric(12, 6) not null default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agent_runs_business_hub_idx on agent_runs (business_id, hub_id);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  agent_run_id uuid references agent_runs (id) on delete cascade,
  hub_id text not null,
  kind audit_event_kind not null,
  tool_name text,
  contact_id uuid references contacts (id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_run_idx on audit_events (agent_run_id, created_at);

-- Idempotent send keys: contact × campaign (run)
create table outbound_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  agent_run_id uuid not null references agent_runs (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  channel text not null default 'sms',
  idempotency_key text not null,
  body text not null,
  status text not null default 'queued', -- queued | sent | failed | skipped
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  unique (idempotency_key)
);

create unique index outbound_messages_run_contact_idx
  on outbound_messages (agent_run_id, contact_id, channel);

-- ---------------------------------------------------------------------------
-- Evals
-- ---------------------------------------------------------------------------

create table eval_cases (
  id uuid primary key default gen_random_uuid(),
  hub_id text not null,
  dataset_id text not null default 'hub-01-golden-v1',
  name text not null,
  input jsonb not null,
  ideal_action eval_ideal_action not null,
  ideal_tone text,
  ideal_notes text,
  created_at timestamptz not null default now()
);

create index eval_cases_dataset_idx on eval_cases (hub_id, dataset_id);

create table eval_runs (
  id uuid primary key default gen_random_uuid(),
  hub_id text not null,
  dataset_id text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  summary jsonb not null default '{}'::jsonb
);

create table eval_results (
  id uuid primary key default gen_random_uuid(),
  eval_run_id uuid not null references eval_runs (id) on delete cascade,
  eval_case_id uuid not null references eval_cases (id) on delete cascade,
  passed boolean not null,
  predicted_action eval_ideal_action,
  failure_category text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Waitlist (marketing interest capture)
-- ---------------------------------------------------------------------------

create table waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  business_name text,
  vertical vertical_pack,
  hub_interest text default 'hub-01',
  notes text,
  source text not null default 'marketing-site',
  created_at timestamptz not null default now(),
  unique (email, hub_interest)
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table businesses enable row level security;
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table integrations enable row level security;
alter table hub_entitlements enable row level security;
alter table agent_runs enable row level security;
alter table audit_events enable row level security;
alter table outbound_messages enable row level security;
alter table eval_cases enable row level security;
alter table eval_runs enable row level security;
alter table eval_results enable row level security;
alter table waitlist_leads enable row level security;

create or replace function public.current_business_id()
returns uuid
language sql
stable
as $$
  select business_id from profiles where id = auth.uid()
$$;

create policy businesses_select_own on businesses
  for select using (id = public.current_business_id());

create policy businesses_update_own on businesses
  for update using (id = public.current_business_id());

create policy profiles_select_own on profiles
  for select using (business_id = public.current_business_id());

create policy contacts_all_own on contacts
  for all using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy integrations_all_own on integrations
  for all using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy entitlements_select_own on hub_entitlements
  for select using (business_id = public.current_business_id());

create policy agent_runs_all_own on agent_runs
  for all using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

create policy audit_events_select_own on audit_events
  for select using (business_id = public.current_business_id());

create policy outbound_messages_all_own on outbound_messages
  for all using (business_id = public.current_business_id())
  with check (business_id = public.current_business_id());

-- Eval cases are shared product assets (read for authenticated owners)
create policy eval_cases_select_auth on eval_cases
  for select to authenticated using (true);

create policy eval_runs_select_auth on eval_runs
  for select to authenticated using (true);

create policy eval_results_select_auth on eval_results
  for select to authenticated using (true);

-- Waitlist: anon insert only (service role reads)
create policy waitlist_insert_anon on waitlist_leads
  for insert to anon, authenticated
  with check (true);
