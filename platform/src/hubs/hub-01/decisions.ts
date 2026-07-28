import { z } from "zod";
import type { Contact, DormancySegment, EvalIdealAction, VerticalPack } from "../../types/index.js";

export const SegmentDecisionSchema = z.object({
  contactId: z.string(),
  segment: z.enum([
    "never-booked",
    "no-show",
    "cancelled",
    "lapsed",
    "unknown",
  ]),
  confidence: z.number().min(0).max(1),
  modelTier: z.enum(["cheap", "primary"]),
});

export const OutreachDecisionSchema = z.object({
  contactId: z.string(),
  action: z.enum(["message", "skip", "escalate"]),
  channel: z.enum(["sms", "email"]).optional(),
  reason: z.string(),
  messageBody: z.string().optional(),
  failureCode: z
    .enum([
      "missing_consent",
      "bad_phone",
      "quiet_hours",
      "do_not_contact",
      "malformed_response",
      "sms_timeout",
      "partial_completion",
      "edge_case_language",
      "none",
    ])
    .default("none"),
  modelTier: z.enum(["cheap", "primary"]),
});

export type SegmentDecision = z.infer<typeof SegmentDecisionSchema>;
export type OutreachDecision = z.infer<typeof OutreachDecisionSchema>;

const EDGE_CASE_RE =
  /\b(lawsuit|attorney|lawyer|suicide|kill myself|medical emergency|stop|unsubscribe|angry|fraud)\b/i;

/** Cheap-tier classifier: rule-based dormancy labeling (swap for small LLM later). */
export function classifySegmentCheap(contact: Contact): SegmentDecision {
  if (contact.segment !== "unknown") {
    return SegmentDecisionSchema.parse({
      contactId: contact.id,
      segment: contact.segment,
      confidence: 0.92,
      modelTier: "cheap",
    });
  }
  const inferred = inferFromMetadata(contact);
  return SegmentDecisionSchema.parse({
    contactId: contact.id,
    segment: inferred,
    confidence: inferred === "unknown" ? 0.4 : 0.6,
    modelTier: "cheap",
  });
}

function inferFromMetadata(contact: Contact): DormancySegment {
  const raw = String(contact.metadata.rawStatus ?? "").toLowerCase();
  if (raw.includes("no-show") || raw === "noshow" || raw.includes("no show")) {
    return "no-show";
  }
  if (raw.includes("cancel")) return "cancelled";
  if (raw.includes("inquiry") || raw.includes("lead")) return "never-booked";
  if (raw.includes("lapsed") || raw.includes("inactive")) return "lapsed";
  if (contact.lastActivityAt) {
    const days =
      (Date.now() - new Date(contact.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days > 90) return "lapsed";
  }
  // Stay unknown so the operator escalates for owner classification.
  return "unknown";
}

export interface DecideOutreachInput {
  contact: Contact;
  segment: DormancySegment;
  vertical: VerticalPack;
  businessName: string;
  bookingLink: string;
  quietHours: boolean;
  draftMessage: string;
}

/**
 * Primary-tier decision for outreach.
 * Deterministic heuristics stand in for an LLM so evals are stable offline;
 * structured schema matches production agent outputs.
 */
export function decideOutreach(input: DecideOutreachInput): OutreachDecision {
  const { contact } = input;

  if (contact.doNotContact) {
    return OutreachDecisionSchema.parse({
      contactId: contact.id,
      action: "skip",
      reason: "Contact marked do-not-contact",
      failureCode: "do_not_contact",
      modelTier: "cheap",
    });
  }

  const note = String(contact.metadata.notes ?? contact.metadata.lastReply ?? "");
  if (EDGE_CASE_RE.test(note) || EDGE_CASE_RE.test(contact.fullName ?? "")) {
    return OutreachDecisionSchema.parse({
      contactId: contact.id,
      action: "escalate",
      reason: "Edge-case language requires human handoff",
      failureCode: "edge_case_language",
      modelTier: "primary",
    });
  }

  if (input.quietHours) {
    return OutreachDecisionSchema.parse({
      contactId: contact.id,
      action: "skip",
      reason: "Outside send window (quiet hours)",
      failureCode: "quiet_hours",
      modelTier: "cheap",
    });
  }

  if (!contact.smsConsent || !contact.phone) {
    return OutreachDecisionSchema.parse({
      contactId: contact.id,
      action: "skip",
      reason: !contact.phone ? "Missing phone" : "Missing SMS consent",
      failureCode: !contact.phone ? "bad_phone" : "missing_consent",
      modelTier: "cheap",
    });
  }

  if (input.segment === "unknown") {
    return OutreachDecisionSchema.parse({
      contactId: contact.id,
      action: "escalate",
      reason: "Ambiguous segment — owner should classify",
      failureCode: "none",
      modelTier: "primary",
    });
  }

  return OutreachDecisionSchema.parse({
    contactId: contact.id,
    action: "message",
    channel: "sms",
    reason: `Pilot reactivation for ${input.segment}`,
    messageBody: input.draftMessage,
    failureCode: "none",
    modelTier: "primary",
  });
}

/** Map eval-case shaped input into a synthetic contact + decide. */
export function decideFromEvalInput(raw: Record<string, unknown>): {
  predicted: EvalIdealAction;
  decision: OutreachDecision;
} {
  const contact: Contact = {
    id: String(raw.contactId ?? "eval-contact"),
    businessId: "eval",
    fullName: String(raw.fullName ?? "Alex"),
    phone: raw.phone == null ? undefined : String(raw.phone),
    email: raw.email == null ? undefined : String(raw.email),
    lastActivityAt: raw.lastActivityAt == null ? undefined : String(raw.lastActivityAt),
    segment: (raw.segment as DormancySegment) ?? "lapsed",
    smsConsent: Boolean(raw.smsConsent),
    emailConsent: Boolean(raw.emailConsent),
    doNotContact: Boolean(raw.doNotContact),
    metadata: {
      notes: raw.notes,
      lastReply: raw.lastReply,
      rawStatus: raw.rawStatus,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const segmentDecision = classifySegmentCheap(contact);
  const decision = decideOutreach({
    contact: { ...contact, segment: segmentDecision.segment },
    segment: segmentDecision.segment,
    vertical: (raw.vertical as VerticalPack) ?? "general",
    businessName: String(raw.businessName ?? "Demo Biz"),
    bookingLink: "https://operate-iq.com/book?demo=1",
    quietHours: Boolean(raw.quietHours),
    draftMessage: String(raw.draftMessage ?? "Hi — we saved a spot for you."),
  });

  return { predicted: decision.action, decision };
}

/** Token cost accounting helper (approximate). */
export function estimateCostUsd(tokensIn: number, tokensOut: number, tier: "cheap" | "primary") {
  const rates =
    tier === "cheap"
      ? { in: 0.00000015, out: 0.0000006 }
      : { in: 0.0000025, out: 0.00001 };
  return tokensIn * rates.in + tokensOut * rates.out;
}
