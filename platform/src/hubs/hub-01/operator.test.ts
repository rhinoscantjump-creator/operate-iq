import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MemoryStore } from "../../db/memory-store.js";
import { createCsvCrmAdapter } from "../../adapters/crm-csv.js";
import { createHub01Operator } from "./operator.js";
import {
  decideFromEvalInput,
  OutreachDecisionSchema,
} from "./decisions.js";
import { HUB01_DATASET_ID } from "../../evals/golden-hub01.js";
import { getHubOperator, listRegisteredHubs } from "../registry.js";
import type { Contact } from "../../types/index.js";
import type { AuditEvent } from "../../types/index.js";

describe("platform registry", () => {
  it("registers hub-01 and stubs for other hubs", () => {
    const hubs = listRegisteredHubs();
    assert.ok(hubs.includes("hub-01"));
    assert.equal(hubs.length, 13);
    assert.equal(getHubOperator("hub-01").name, "The Outreach Operator");
  });
});

describe("hub-01 decisions", () => {
  it("emits structured outreach decisions", () => {
    const { decision } = decideFromEvalInput({
      fullName: "Sam",
      phone: "+15550101",
      segment: "lapsed",
      smsConsent: true,
      vertical: "gym",
    });
    const parsed = OutreachDecisionSchema.parse(decision);
    assert.equal(parsed.action, "message");
  });

  it("escalates STOP language", () => {
    const { predicted } = decideFromEvalInput({
      phone: "+15550109",
      segment: "lapsed",
      smsConsent: true,
      lastReply: "STOP texting me",
    });
    assert.equal(predicted, "escalate");
  });
});

describe("hub-01 operator run", () => {
  it("imports CSV, dry-runs pilot, writes audit, resumes without double send", async () => {
    const store = new MemoryStore();
    const business = store.createBusiness({
      name: "Test Salon",
      vertical: "salon",
      bookingLink: "https://example.com/book",
    });
    store.upsertEntitlement({ businessId: business.id, hubId: "hub-01" });
    const crm = createCsvCrmAdapter({
      createContact: (input: Omit<Contact, "id" | "createdAt" | "updatedAt">) =>
        store.createContact(input),
    });
    await crm.importContacts(
      business.id,
      `external_id,full_name,phone,status,sms_consent
1,Alex,+15552001,lapsed,true
2,Blake,+15552002,never-booked,true
3,Chris,+15552003,no-show,false
4,Dana,+15552004,cancelled,true
5,Evan,+15552005,lapsed,true
`,
    );

    const operator = createHub01Operator({ store });
    const plan = await operator.plan({ businessId: business.id, pilotPercent: 40 });
    assert.equal(plan.hubId, "hub-01");
    assert.ok(plan.eligibleCount >= 1);

    const run = store.createAgentRun({
      businessId: business.id,
      hubId: "hub-01",
      mode: "dry-run",
      pilotPercent: 40,
    });
    await operator.run(run.id);
    const finished = store.getAgentRun(run.id);
    assert.equal(finished.status, "completed");
    assert.equal(finished.checkpoint.phase, "done");
    const sends = store
      .listAudit(run.id)
      .filter((e: AuditEvent) => e.kind === "send").length;
    assert.ok(sends >= 1);
    assert.ok(finished.metrics.pilotSelected >= 1);

    await operator.run(run.id);
    const sendsAfter = store
      .listAudit(run.id)
      .filter((e: AuditEvent) => e.kind === "send").length;
    assert.equal(sendsAfter, sends);
  });

  it("passes the golden eval suite", async () => {
    const store = new MemoryStore();
    const operator = createHub01Operator({ store });
    const report = await operator.evaluate(HUB01_DATASET_ID);
    assert.equal(report.total, 20);
    assert.equal(report.passRate, 100);
  });
});
