/** Shared domain types for the Operate IQ cross-hub platform. */

export type VerticalPack =
  | "gym"
  | "clinic"
  | "home-services"
  | "salon"
  | "general";

export type HubId =
  | "hub-01"
  | "hub-02"
  | "hub-03"
  | "hub-04"
  | "hub-05"
  | "hub-06"
  | "hub-07"
  | "hub-08"
  | "hub-09"
  | "hub-10"
  | "hub-11"
  | "hub-12"
  | "hub-13";

export type DormancySegment =
  | "never-booked"
  | "no-show"
  | "cancelled"
  | "lapsed"
  | "unknown";

export type AgentRunStatus =
  | "pending"
  | "planning"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type AuditEventKind =
  | "prompt"
  | "response"
  | "tool_call"
  | "tool_result"
  | "send"
  | "skip"
  | "escalate"
  | "error"
  | "checkpoint"
  | "metric";

export type EvalIdealAction = "message" | "skip" | "escalate";

export type RunMode = "dry-run" | "live";

export interface Business {
  id: string;
  name: string;
  vertical: VerticalPack;
  timezone: string;
  quietHoursStart: number;
  quietHoursEnd: number;
  bookingLink?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  businessId: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  businessId: string;
  externalId?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  lastActivityAt?: string;
  segment: DormancySegment;
  smsConsent: boolean;
  emailConsent: boolean;
  doNotContact: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface HubEntitlement {
  id: string;
  businessId: string;
  hubId: HubId;
  enabled: boolean;
  source: "pilot" | "manual" | "stripe";
  stripeSubscriptionItemId?: string;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
}

export interface AgentRunMetrics {
  contactsConsidered: number;
  pilotSelected: number;
  messaged: number;
  skipped: number;
  escalated: number;
  failed: number;
  listCoveragePercent: number;
  reactivationRate?: number;
  bookingsFromDormant?: number;
  revenueReactivated?: number;
}

export interface AgentRunCheckpoint {
  phase: "idle" | "segmented" | "pilot_selected" | "processing" | "done";
  contactCursor: number;
  pilotContactIds: string[];
  processedContactIds: string[];
  lastError?: string;
}

export interface AgentRun {
  id: string;
  businessId: string;
  hubId: HubId;
  status: AgentRunStatus;
  mode: RunMode;
  pilotPercent: number;
  checkpoint: AgentRunCheckpoint;
  metrics: AgentRunMetrics;
  costTokensIn: number;
  costTokensOut: number;
  costUsd: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  businessId: string;
  agentRunId?: string;
  hubId: HubId;
  kind: AuditEventKind;
  toolName?: string;
  contactId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface OutboundMessage {
  id: string;
  businessId: string;
  agentRunId: string;
  contactId: string;
  channel: "sms" | "email";
  idempotencyKey: string;
  body: string;
  status: "queued" | "sent" | "failed" | "skipped";
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface EvalCase {
  id: string;
  hubId: HubId;
  datasetId: string;
  name: string;
  input: Record<string, unknown>;
  idealAction: EvalIdealAction;
  idealTone?: string;
  idealNotes?: string;
  createdAt: string;
}

export interface EvalRun {
  id: string;
  hubId: HubId;
  datasetId: string;
  startedAt: string;
  completedAt?: string;
  summary: Record<string, unknown>;
}

export interface EvalResult {
  id: string;
  evalRunId: string;
  evalCaseId: string;
  passed: boolean;
  predictedAction?: EvalIdealAction;
  failureCategory?: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface WaitlistLead {
  id: string;
  email: string;
  businessName?: string;
  vertical?: VerticalPack;
  hubInterest: string;
  notes?: string;
  source: string;
  createdAt: string;
}

export interface OperatingPlan {
  hubId: HubId;
  businessId: string;
  summary: string;
  segments: Record<DormancySegment, number>;
  recommendedPilotPercent: number;
  eligibleCount: number;
  blockedReasons: string[];
  vertical: VerticalPack;
}

export interface EvalReport {
  hubId: HubId;
  datasetId: string;
  total: number;
  passed: number;
  passRate: number;
  failureCategories: Record<string, number>;
  results: EvalResult[];
}

export function emptyMetrics(): AgentRunMetrics {
  return {
    contactsConsidered: 0,
    pilotSelected: 0,
    messaged: 0,
    skipped: 0,
    escalated: 0,
    failed: 0,
    listCoveragePercent: 0,
  };
}

export function emptyCheckpoint(): AgentRunCheckpoint {
  return {
    phase: "idle",
    contactCursor: 0,
    pilotContactIds: [],
    processedContactIds: [],
  };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function newId(prefix = ""): string {
  const id = crypto.randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}
