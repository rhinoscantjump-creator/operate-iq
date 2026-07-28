import type { MemoryStore } from "../db/memory-store.js";
import type {
  AuditEventKind,
  Business,
  Contact,
  HubId,
} from "../types/index.js";

export interface ToolContext {
  store: MemoryStore;
  business: Business;
  hubId: HubId;
  agentRunId: string;
  mode: "dry-run" | "live";
}

export async function writeAudit(
  ctx: ToolContext,
  kind: AuditEventKind,
  payload: Record<string, unknown>,
  extras?: { toolName?: string; contactId?: string },
) {
  return ctx.store.appendAudit({
    businessId: ctx.business.id,
    agentRunId: ctx.agentRunId,
    hubId: ctx.hubId,
    kind,
    toolName: extras?.toolName,
    contactId: extras?.contactId,
    payload,
  });
}

export function loadContacts(ctx: ToolContext): Contact[] {
  return ctx.store.listContacts(ctx.business.id);
}

export function checkConsent(contact: Contact, channel: "sms" | "email"): {
  allowed: boolean;
  reason?: string;
} {
  if (contact.doNotContact) {
    return { allowed: false, reason: "do_not_contact" };
  }
  if (channel === "sms") {
    if (!contact.phone) return { allowed: false, reason: "missing_phone" };
    if (!contact.smsConsent) return { allowed: false, reason: "missing_sms_consent" };
  }
  if (channel === "email") {
    if (!contact.email) return { allowed: false, reason: "missing_email" };
    if (!contact.emailConsent) return { allowed: false, reason: "missing_email_consent" };
  }
  return { allowed: true };
}

/** Quiet hours gate using business local clock approximation (UTC offset ignored in demo). */
export function isQuietHours(business: Business, at = new Date()): boolean {
  const hour = at.getHours();
  const start = business.quietHoursStart;
  const end = business.quietHoursEnd;
  if (start === end) return false;
  if (start > end) {
    // e.g. 21 → 8
    return hour >= start || hour < end;
  }
  return hour >= start && hour < end;
}

export function createBookingLink(business: Business, contact: Contact): string {
  const base = business.bookingLink ?? "https://operate-iq.com/book";
  const params = new URLSearchParams({
    biz: business.id,
    contact: contact.id,
  });
  return `${base}?${params.toString()}`;
}

export async function escalateToOwner(
  ctx: ToolContext,
  contact: Contact,
  reason: string,
  details?: Record<string, unknown>,
) {
  await writeAudit(ctx, "escalate", { reason, ...details }, {
    toolName: "escalate_to_owner",
    contactId: contact.id,
  });
  return { escalated: true as const, reason };
}

export function idempotencyKey(
  agentRunId: string,
  contactId: string,
  channel: "sms" | "email",
): string {
  return `${agentRunId}:${contactId}:${channel}`;
}
