import type { AgentRun, AuditEvent, Business } from "../../types/index.js";

export interface DefendNarratives {
  owner: {
    problem: string;
    outcome: string;
    evidence: string[];
    risk: string;
  };
  engineer: {
    architecture: string;
    decisions: string[];
    tradeoffs: string[];
  };
}

export function buildOwnerEvidence(input: {
  business: Business;
  run: AgentRun;
  audit: AuditEvent[];
}): DefendNarratives {
  const { business, run, audit } = input;
  const sends = audit.filter((a) => a.kind === "send").length;
  const escalations = audit.filter((a) => a.kind === "escalate").length;
  const errors = audit.filter((a) => a.kind === "error").length;
  const skips = audit.filter((a) => a.kind === "skip").length;

  return {
    owner: {
      problem: `${business.name} has dormant CRM contacts while ad spend keeps buying strangers.`,
      outcome: `Hub 01 pilot (${run.mode}) processed ${run.metrics.pilotSelected} of ${run.metrics.contactsConsidered} contacts: ${run.metrics.messaged} messaged, ${run.metrics.skipped} skipped, ${run.metrics.escalated} escalated.`,
      evidence: [
        `List coverage: ${run.metrics.listCoveragePercent}%`,
        `Audit events: ${audit.length} (sends=${sends}, skips=${skips}, escalations=${escalations}, errors=${errors})`,
        `Estimated model cost: $${run.costUsd.toFixed(6)} (${run.costTokensIn} in / ${run.costTokensOut} out tokens)`,
        `Checkpoint phase: ${run.checkpoint.phase}`,
      ],
      risk: "Quiet hours, SMS consent, and human handoff are enforced before any live send. Ramp beyond the 5–10% pilot only after reply/booking KPIs hold.",
    },
    engineer: {
      architecture:
        "CSV/CRM import → cheap-tier segment classifier → primary-tier outreach decision (structured JSON) → consent/quiet-hours send gate → idempotent outbound + full audit trail with resumable checkpoints.",
      decisions: [
        "Pilot selection is deterministic by contact id for reproducible resumes.",
        "Classification uses cheap tier; copy/decision uses primary tier for cost control.",
        "Idempotency key = runId:contactId:channel prevents double-text on crash/retry.",
        "Edge-case language and unknown segments escalate instead of auto-sending.",
      ],
      tradeoffs: [
        "Stub SMS first; Twilio adapter is a drop-in when a real pilot business connects.",
        "Rule-based decision engine for offline eval stability; swap prompts behind the same Zod schemas.",
        "Bookings/revenue KPIs reserved until calendar webhooks exist.",
      ],
    },
  };
}

export const defendTemplates = {
  ownerPitch: `Problem → Outcome → Evidence → Risk
Use buildOwnerEvidence().owner as the spoken outline for SME owners (not enterprise procurement).`,
  engineerPitch: `Architecture → Decisions → Tradeoffs
Use buildOwnerEvidence().engineer when defending the system to technical reviewers.`,
};
