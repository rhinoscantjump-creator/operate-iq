import {
  type AgentRun,
  type AuditEvent,
  type Business,
  type Contact,
  type EvalCase,
  type EvalResult,
  type EvalRun,
  type HubEntitlement,
  type OutboundMessage,
  type Profile,
  type WaitlistLead,
  emptyCheckpoint,
  emptyMetrics,
  newId,
  nowIso,
  type HubId,
  type RunMode,
  type VerticalPack,
} from "../types/index.js";

/** In-memory store for local/dev/demo without Supabase credentials. */
export class MemoryStore {
  businesses = new Map<string, Business>();
  profiles = new Map<string, Profile>();
  contacts = new Map<string, Contact>();
  entitlements = new Map<string, HubEntitlement>();
  agentRuns = new Map<string, AgentRun>();
  auditEvents: AuditEvent[] = [];
  outboundMessages = new Map<string, OutboundMessage>();
  evalCases = new Map<string, EvalCase>();
  evalRuns = new Map<string, EvalRun>();
  evalResults: EvalResult[] = [];
  waitlist: WaitlistLead[] = [];

  createBusiness(input: {
    name: string;
    vertical?: VerticalPack;
    timezone?: string;
    quietHoursStart?: number;
    quietHoursEnd?: number;
    bookingLink?: string;
  }): Business {
    const ts = nowIso();
    const business: Business = {
      id: newId("biz"),
      name: input.name,
      vertical: input.vertical ?? "general",
      timezone: input.timezone ?? "America/New_York",
      quietHoursStart: input.quietHoursStart ?? 21,
      quietHoursEnd: input.quietHoursEnd ?? 8,
      bookingLink: input.bookingLink,
      createdAt: ts,
      updatedAt: ts,
    };
    this.businesses.set(business.id, business);
    return business;
  }

  createProfile(input: {
    businessId: string;
    email: string;
    fullName?: string;
  }): Profile {
    const profile: Profile = {
      id: newId("profile"),
      businessId: input.businessId,
      email: input.email,
      fullName: input.fullName,
      role: "owner",
      createdAt: nowIso(),
    };
    this.profiles.set(profile.id, profile);
    return profile;
  }

  upsertEntitlement(input: {
    businessId: string;
    hubId: HubId;
    enabled?: boolean;
    source?: HubEntitlement["source"];
  }): HubEntitlement {
    const existing = [...this.entitlements.values()].find(
      (e) => e.businessId === input.businessId && e.hubId === input.hubId,
    );
    if (existing) {
      existing.enabled = input.enabled ?? existing.enabled;
      existing.source = input.source ?? existing.source;
      this.entitlements.set(existing.id, existing);
      return existing;
    }
    const entitlement: HubEntitlement = {
      id: newId("ent"),
      businessId: input.businessId,
      hubId: input.hubId,
      enabled: input.enabled ?? true,
      source: input.source ?? "pilot",
      startsAt: nowIso(),
      createdAt: nowIso(),
    };
    this.entitlements.set(entitlement.id, entitlement);
    return entitlement;
  }

  hasHubAccess(businessId: string, hubId: HubId): boolean {
    return [...this.entitlements.values()].some(
      (e) => e.businessId === businessId && e.hubId === hubId && e.enabled,
    );
  }

  createContact(
    input: Omit<Contact, "id" | "createdAt" | "updatedAt" | "metadata"> & {
      metadata?: Record<string, unknown>;
    },
  ): Contact {
    const ts = nowIso();
    const contact: Contact = {
      ...input,
      id: newId("ct"),
      metadata: input.metadata ?? {},
      createdAt: ts,
      updatedAt: ts,
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }

  listContacts(businessId: string): Contact[] {
    return [...this.contacts.values()].filter((c) => c.businessId === businessId);
  }

  updateContact(id: string, patch: Partial<Contact>): Contact {
    const current = this.contacts.get(id);
    if (!current) throw new Error(`Contact not found: ${id}`);
    const next = { ...current, ...patch, id, updatedAt: nowIso() };
    this.contacts.set(id, next);
    return next;
  }

  createAgentRun(input: {
    businessId: string;
    hubId: HubId;
    mode?: RunMode;
    pilotPercent?: number;
  }): AgentRun {
    const ts = nowIso();
    const run: AgentRun = {
      id: newId("run"),
      businessId: input.businessId,
      hubId: input.hubId,
      status: "pending",
      mode: input.mode ?? "dry-run",
      pilotPercent: input.pilotPercent ?? 10,
      checkpoint: emptyCheckpoint(),
      metrics: emptyMetrics(),
      costTokensIn: 0,
      costTokensOut: 0,
      costUsd: 0,
      createdAt: ts,
      updatedAt: ts,
    };
    this.agentRuns.set(run.id, run);
    return run;
  }

  getAgentRun(id: string): AgentRun {
    const run = this.agentRuns.get(id);
    if (!run) throw new Error(`Agent run not found: ${id}`);
    return run;
  }

  updateAgentRun(id: string, patch: Partial<AgentRun>): AgentRun {
    const current = this.getAgentRun(id);
    const next = { ...current, ...patch, id, updatedAt: nowIso() };
    this.agentRuns.set(id, next);
    return next;
  }

  appendAudit(event: Omit<AuditEvent, "id" | "createdAt">): AuditEvent {
    const full: AuditEvent = {
      ...event,
      id: newId("aud"),
      createdAt: nowIso(),
    };
    this.auditEvents.push(full);
    return full;
  }

  listAudit(agentRunId: string): AuditEvent[] {
    return this.auditEvents.filter((e) => e.agentRunId === agentRunId);
  }

  getOutboundByKey(idempotencyKey: string): OutboundMessage | undefined {
    return [...this.outboundMessages.values()].find(
      (m) => m.idempotencyKey === idempotencyKey,
    );
  }

  createOutbound(input: Omit<OutboundMessage, "id" | "createdAt">): OutboundMessage {
    const existing = this.getOutboundByKey(input.idempotencyKey);
    if (existing) return existing;
    const message: OutboundMessage = {
      ...input,
      id: newId("msg"),
      createdAt: nowIso(),
    };
    this.outboundMessages.set(message.id, message);
    return message;
  }

  updateOutbound(id: string, patch: Partial<OutboundMessage>): OutboundMessage {
    const current = this.outboundMessages.get(id);
    if (!current) throw new Error(`Outbound message not found: ${id}`);
    const next = { ...current, ...patch, id };
    this.outboundMessages.set(id, next);
    return next;
  }

  addEvalCase(input: Omit<EvalCase, "id" | "createdAt">): EvalCase {
    const item: EvalCase = {
      ...input,
      id: newId("eval"),
      createdAt: nowIso(),
    };
    this.evalCases.set(item.id, item);
    return item;
  }

  listEvalCases(hubId: HubId, datasetId: string): EvalCase[] {
    return [...this.evalCases.values()].filter(
      (c) => c.hubId === hubId && c.datasetId === datasetId,
    );
  }

  createEvalRun(hubId: HubId, datasetId: string): EvalRun {
    const run: EvalRun = {
      id: newId("evrun"),
      hubId,
      datasetId,
      startedAt: nowIso(),
      summary: {},
    };
    this.evalRuns.set(run.id, run);
    return run;
  }

  completeEvalRun(id: string, summary: Record<string, unknown>): EvalRun {
    const run = this.evalRuns.get(id);
    if (!run) throw new Error(`Eval run not found: ${id}`);
    const next = { ...run, completedAt: nowIso(), summary };
    this.evalRuns.set(id, next);
    return next;
  }

  addEvalResult(input: Omit<EvalResult, "id" | "createdAt">): EvalResult {
    const result: EvalResult = {
      ...input,
      id: newId("evres"),
      createdAt: nowIso(),
    };
    this.evalResults.push(result);
    return result;
  }

  addWaitlistLead(input: {
    email: string;
    businessName?: string;
    vertical?: VerticalPack;
    hubInterest?: string;
    notes?: string;
    source?: string;
  }): WaitlistLead {
    const hubInterest = input.hubInterest ?? "hub-01";
    const existing = this.waitlist.find(
      (w) => w.email === input.email && w.hubInterest === hubInterest,
    );
    if (existing) return existing;
    const lead: WaitlistLead = {
      id: newId("wait"),
      email: input.email.toLowerCase().trim(),
      businessName: input.businessName,
      vertical: input.vertical,
      hubInterest,
      notes: input.notes,
      source: input.source ?? "marketing-site",
      createdAt: nowIso(),
    };
    this.waitlist.push(lead);
    return lead;
  }

  getBusiness(id: string): Business {
    const business = this.businesses.get(id);
    if (!business) throw new Error(`Business not found: ${id}`);
    return business;
  }
}

/** Singleton used by CLI demos and the Vercel waitlist function (per-instance). */
export const defaultStore = new MemoryStore();
