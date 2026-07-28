import type { MemoryStore } from "../../db/memory-store.js";
import { defaultStore } from "../../db/memory-store.js";
import { renderOffer } from "../../adapters/crm-csv.js";
import { createBookingLinkAdapter } from "../../adapters/calendar.js";
import { createStubSmsAdapter, type SmsAdapter } from "../../adapters/sms.js";
import type { HubOperator, PlanInput } from "../types.js";
import type {
  Contact,
  DormancySegment,
  EvalReport,
  OperatingPlan,
} from "../../types/index.js";
import {
  checkConsent,
  escalateToOwner,
  idempotencyKey,
  isQuietHours,
  loadContacts,
  writeAudit,
  type ToolContext,
} from "../../tools/shared.js";
import {
  classifySegmentCheap,
  decideOutreach,
  estimateCostUsd,
} from "./decisions.js";
import { evaluateHub01 } from "../../evals/hub01-runner.js";
import { buildOwnerEvidence } from "./evidence.js";

export interface Hub01Deps {
  store?: MemoryStore;
  sms?: SmsAdapter;
}

function pickPilot(contacts: Contact[], percent: number): Contact[] {
  const eligible = contacts.filter((c) => !c.doNotContact);
  const n = Math.max(1, Math.ceil((eligible.length * percent) / 100));
  return [...eligible].sort((a, b) => a.id.localeCompare(b.id)).slice(0, n);
}

function countSegments(contacts: Contact[]): Record<DormancySegment, number> {
  const counts: Record<DormancySegment, number> = {
    "never-booked": 0,
    "no-show": 0,
    cancelled: 0,
    lapsed: 0,
    unknown: 0,
  };
  for (const c of contacts) counts[c.segment] += 1;
  return counts;
}

export function createHub01Operator(deps: Hub01Deps = {}): HubOperator {
  const store = deps.store ?? defaultStore;
  const sms = deps.sms ?? createStubSmsAdapter();
  const calendar = createBookingLinkAdapter();

  return {
    id: "hub-01",
    name: "The Outreach Operator",

    async plan(input: PlanInput): Promise<OperatingPlan> {
      const business = store.getBusiness(input.businessId);
      if (!store.hasHubAccess(business.id, "hub-01")) {
        throw new Error("Hub 01 is not entitled for this business");
      }

      const contacts = store.listContacts(business.id);
      for (const contact of contacts) {
        const decision = classifySegmentCheap(contact);
        if (decision.segment !== contact.segment) {
          store.updateContact(contact.id, { segment: decision.segment });
        }
      }
      const refreshed = store.listContacts(business.id);
      const segments = countSegments(refreshed);
      const eligible = refreshed.filter((c) => checkConsent(c, "sms").allowed);
      const blockedReasons: string[] = [];
      if (refreshed.length === 0) blockedReasons.push("no_contacts");
      if (eligible.length === 0) blockedReasons.push("no_eligible_consented_contacts");

      return {
        hubId: "hub-01",
        businessId: business.id,
        summary:
          "Database reactivation operating map: segment dormant contacts, pilot 5–10%, send vertical offer with booking link, escalate edge cases.",
        segments,
        recommendedPilotPercent: input.pilotPercent ?? 10,
        eligibleCount: eligible.length,
        blockedReasons,
        vertical: business.vertical,
      };
    },

    async run(runId: string): Promise<void> {
      let run = store.getAgentRun(runId);
      if (run.hubId !== "hub-01") throw new Error("Run is not for hub-01");
      const business = store.getBusiness(run.businessId);
      if (!store.hasHubAccess(business.id, "hub-01")) {
        throw new Error("Hub 01 is not entitled for this business");
      }

      // Completed runs are idempotent no-ops (prevents double-text on retry).
      if (run.status === "completed" && run.checkpoint.phase === "done") {
        return;
      }

      const ctx: ToolContext = {
        store,
        business,
        hubId: "hub-01",
        agentRunId: run.id,
        mode: run.mode,
      };

      try {
        run = store.updateAgentRun(run.id, {
          status: "running",
          startedAt: run.startedAt ?? new Date().toISOString(),
        });

        let checkpoint = { ...run.checkpoint };
        let contacts = loadContacts(ctx);

        if (checkpoint.phase === "idle" || checkpoint.phase === "segmented") {
          await writeAudit(ctx, "prompt", {
            phase: "segment",
            message: "Classify dormancy segments for all contacts",
          });
          for (const contact of contacts) {
            const decision = classifySegmentCheap(contact);
            store.updateContact(contact.id, { segment: decision.segment });
            run = store.updateAgentRun(run.id, {
              costTokensIn: run.costTokensIn + 40,
              costTokensOut: run.costTokensOut + 12,
              costUsd: run.costUsd + estimateCostUsd(40, 12, "cheap"),
            });
            await writeAudit(ctx, "tool_result", { decision }, {
              toolName: "classify_segment",
              contactId: contact.id,
            });
          }
          contacts = loadContacts(ctx);
          checkpoint = { ...checkpoint, phase: "segmented" };
          run = store.updateAgentRun(run.id, { checkpoint });
          await writeAudit(ctx, "checkpoint", { checkpoint });
        }

        if (
          checkpoint.phase === "segmented" ||
          (checkpoint.phase === "pilot_selected" &&
            checkpoint.pilotContactIds.length === 0)
        ) {
          const pilot = pickPilot(contacts, run.pilotPercent);
          checkpoint = {
            phase: "pilot_selected",
            contactCursor: 0,
            pilotContactIds: pilot.map((c) => c.id),
            processedContactIds: checkpoint.processedContactIds ?? [],
          };
          run = store.updateAgentRun(run.id, {
            checkpoint,
            metrics: {
              ...run.metrics,
              contactsConsidered: contacts.length,
              pilotSelected: pilot.length,
            },
          });
          await writeAudit(ctx, "checkpoint", { checkpoint });
        }

        const processed = new Set(checkpoint.processedContactIds);
        const pilotIds = checkpoint.pilotContactIds;
        const quiet = isQuietHours(business);

        checkpoint = { ...checkpoint, phase: "processing" };
        run = store.updateAgentRun(run.id, { checkpoint });

        for (let i = checkpoint.contactCursor; i < pilotIds.length; i++) {
          const contactId = pilotIds[i]!;
          if (processed.has(contactId)) {
            checkpoint = { ...checkpoint, contactCursor: i + 1 };
            continue;
          }

          const contact = store.contacts.get(contactId);
          if (!contact) {
            run = store.updateAgentRun(run.id, {
              metrics: { ...run.metrics, failed: run.metrics.failed + 1 },
            });
            await writeAudit(ctx, "error", { error: "contact_missing", contactId });
            processed.add(contactId);
            checkpoint = {
              ...checkpoint,
              contactCursor: i + 1,
              processedContactIds: [...processed],
            };
            run = store.updateAgentRun(run.id, { checkpoint });
            await writeAudit(ctx, "checkpoint", { checkpoint });
            continue;
          }

          const link = calendar.bookingLinkFor(business, contact);
          const draft = renderOffer({
            vertical: business.vertical,
            segment: contact.segment,
            name: contact.fullName ?? "there",
            businessName: business.name,
            link,
          });

          await writeAudit(
            ctx,
            "prompt",
            { phase: "outreach_decision", contactId },
            { contactId },
          );

          const decision = decideOutreach({
            contact,
            segment: contact.segment,
            vertical: business.vertical,
            businessName: business.name,
            bookingLink: link,
            quietHours: quiet,
            draftMessage: draft,
          });

          const tin = decision.modelTier === "primary" ? 120 : 40;
          const tout = decision.modelTier === "primary" ? 80 : 20;
          run = store.updateAgentRun(run.id, {
            costTokensIn: run.costTokensIn + tin,
            costTokensOut: run.costTokensOut + tout,
            costUsd: run.costUsd + estimateCostUsd(tin, tout, decision.modelTier),
          });

          await writeAudit(ctx, "response", { decision }, {
            toolName: "decide_outreach",
            contactId,
          });

          if (decision.action === "escalate") {
            await escalateToOwner(ctx, contact, decision.reason, { decision });
            run = store.updateAgentRun(run.id, {
              metrics: { ...run.metrics, escalated: run.metrics.escalated + 1 },
            });
          } else if (decision.action === "skip") {
            await writeAudit(ctx, "skip", { decision }, {
              toolName: "skip_contact",
              contactId,
            });
            run = store.updateAgentRun(run.id, {
              metrics: { ...run.metrics, skipped: run.metrics.skipped + 1 },
            });
          } else {
            const channel = decision.channel ?? "sms";
            const key = idempotencyKey(run.id, contact.id, channel);
            const existing = store.getOutboundByKey(key);
            if (existing?.status === "sent") {
              await writeAudit(ctx, "skip", { reason: "already_sent", key }, {
                toolName: "idempotent_send",
                contactId,
              });
            } else {
              const consent = checkConsent(contact, channel);
              if (!consent.allowed) {
                await writeAudit(ctx, "skip", { reason: consent.reason }, {
                  toolName: "send_gate",
                  contactId,
                });
                run = store.updateAgentRun(run.id, {
                  metrics: { ...run.metrics, skipped: run.metrics.skipped + 1 },
                });
              } else {
                const body = decision.messageBody ?? draft;
                const outbound = store.createOutbound({
                  businessId: business.id,
                  agentRunId: run.id,
                  contactId: contact.id,
                  channel,
                  idempotencyKey: key,
                  body,
                  status: "queued",
                });

                if (run.mode === "dry-run") {
                  store.updateOutbound(outbound.id, {
                    status: "sent",
                    providerMessageId: `dry_${key}`,
                  });
                  await writeAudit(
                    ctx,
                    "send",
                    { mode: "dry-run", body, to: contact.phone, key },
                    { toolName: "send_sms", contactId },
                  );
                  run = store.updateAgentRun(run.id, {
                    metrics: { ...run.metrics, messaged: run.metrics.messaged + 1 },
                  });
                } else {
                  await writeAudit(ctx, "tool_call", { to: contact.phone, key }, {
                    toolName: "send_sms",
                    contactId,
                  });
                  const result = await sms.send({
                    to: contact.phone!,
                    body,
                    idempotencyKey: key,
                  });
                  if (!result.ok) {
                    store.updateOutbound(outbound.id, {
                      status: "failed",
                      errorMessage: result.error,
                    });
                    await writeAudit(
                      ctx,
                      "error",
                      {
                        error: result.error ?? "sms_failed",
                        failureCode: "sms_timeout",
                      },
                      { toolName: "send_sms", contactId },
                    );
                    run = store.updateAgentRun(run.id, {
                      metrics: { ...run.metrics, failed: run.metrics.failed + 1 },
                    });
                  } else {
                    store.updateOutbound(outbound.id, {
                      status: "sent",
                      providerMessageId: result.providerMessageId,
                    });
                    await writeAudit(
                      ctx,
                      "send",
                      {
                        mode: "live",
                        body,
                        to: contact.phone,
                        key,
                        providerMessageId: result.providerMessageId,
                      },
                      { toolName: "send_sms", contactId },
                    );
                    run = store.updateAgentRun(run.id, {
                      metrics: { ...run.metrics, messaged: run.metrics.messaged + 1 },
                    });
                  }
                }
              }
            }
          }

          processed.add(contactId);
          checkpoint = {
            phase: "processing",
            contactCursor: i + 1,
            pilotContactIds: pilotIds,
            processedContactIds: [...processed],
          };
          const latest = store.getAgentRun(run.id);
          const coverage =
            contacts.length === 0
              ? 0
              : Math.round((processed.size / contacts.length) * 1000) / 10;
          run = store.updateAgentRun(run.id, {
            checkpoint,
            metrics: {
              ...latest.metrics,
              listCoveragePercent: coverage,
              reactivationRate:
                latest.metrics.pilotSelected === 0
                  ? 0
                  : Math.round(
                      (latest.metrics.messaged / latest.metrics.pilotSelected) * 1000,
                    ) / 10,
            },
          });
          await writeAudit(ctx, "checkpoint", { checkpoint });
        }

        checkpoint = { ...checkpoint, phase: "done" };
        const finalRun = store.getAgentRun(run.id);
        const evidence = buildOwnerEvidence({
          business,
          run: finalRun,
          audit: store.listAudit(run.id),
        });
        run = store.updateAgentRun(run.id, {
          status: "completed",
          checkpoint,
          completedAt: new Date().toISOString(),
          metrics: {
            ...finalRun.metrics,
            bookingsFromDormant: finalRun.metrics.bookingsFromDormant ?? 0,
            revenueReactivated: finalRun.metrics.revenueReactivated ?? 0,
          },
        });
        await writeAudit(ctx, "metric", {
          metrics: run.metrics,
          evidenceSummary: evidence.owner.outcome,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const failed = store.getAgentRun(runId);
        store.updateAgentRun(runId, {
          status: "failed",
          errorMessage: message,
          checkpoint: { ...failed.checkpoint, lastError: message },
        });
        await writeAudit(ctx, "error", {
          error: message,
          failureCode: "partial_completion",
        });
        throw err;
      }
    },

    async evaluate(datasetId: string): Promise<EvalReport> {
      return evaluateHub01(store, datasetId);
    },
  };
}
