import { MemoryStore } from "../db/memory-store.js";
import { createCsvCrmAdapter } from "../adapters/crm-csv.js";
import { createHub01Operator } from "../hubs/hub-01/operator.js";
import { buildOwnerEvidence } from "../hubs/hub-01/evidence.js";
import { enqueueHubRun } from "../jobs/queue.js";

const sampleCsv = `external_id,full_name,phone,email,status,sms_consent,email_consent,do_not_contact,last_activity_at
1,Sam Lee,+15551001,sam@example.com,lapsed,true,true,false,2025-01-01
2,Jordan Kim,+15551002,jordan@example.com,never-booked,true,false,false,2025-06-01
3,Taylor Ng,+15551003,taylor@example.com,no-show,true,true,false,2025-03-15
4,Casey Ortiz,+15551004,casey@example.com,cancelled,false,true,false,2025-02-20
5,Riley Chen,+15551005,riley@example.com,lapsed,true,true,true,2024-11-01
6,Avery Brooks,+15551006,avery@example.com,inquiry,true,true,false,2025-07-01
7,Quinn Diaz,+15551007,quinn@example.com,lapsed,true,true,false,2024-08-01
8,Morgan Shah,+15551008,morgan@example.com,cancelled,true,true,false,2025-04-01
9,Reese Patel,+15551009,reese@example.com,lapsed,true,true,false,2024-12-12
10,Drew Ali,+15551010,drew@example.com,no-show,true,true,false,2025-05-05
`;

async function main() {
  const store = new MemoryStore();
  const business = store.createBusiness({
    name: "River City Gym",
    vertical: "gym",
    bookingLink: "https://operate-iq.com/book/river-city",
    quietHoursStart: 21,
    quietHoursEnd: 8,
  });
  store.createProfile({
    businessId: business.id,
    email: "owner@rivercity.example",
    fullName: "Owner Demo",
  });
  store.upsertEntitlement({ businessId: business.id, hubId: "hub-01", source: "pilot" });

  const crm = createCsvCrmAdapter({
    createContact: (input) => store.createContact(input),
  });
  const imported = await crm.importContacts(business.id, sampleCsv);

  // Inject one escalate case via metadata notes
  const escalateTarget = imported[8];
  if (escalateTarget) {
    store.updateContact(escalateTarget.id, {
      metadata: { ...escalateTarget.metadata, lastReply: "STOP please" },
    });
  }

  const operator = createHub01Operator({ store });
  const plan = await operator.plan({ businessId: business.id, pilotPercent: 50 });
  console.log("PLAN", JSON.stringify(plan, null, 2));

  const run = await enqueueHubRun(store, {
    businessId: business.id,
    hubId: "hub-01",
    mode: "dry-run",
    pilotPercent: 50,
  });
  await operator.run(run.id);

  const finished = store.getAgentRun(run.id);
  const audit = store.listAudit(run.id);
  const evidence = buildOwnerEvidence({ business, run: finished, audit });

  console.log("RUN METRICS", JSON.stringify(finished.metrics, null, 2));
  console.log("AUDIT COUNT", audit.length);
  console.log("OWNER EVIDENCE", JSON.stringify(evidence.owner, null, 2));
  console.log("ENGINEER EVIDENCE", JSON.stringify(evidence.engineer, null, 2));

  // Resume safety: re-run should not double-send
  const sentBefore = audit.filter((a) => a.kind === "send").length;
  await operator.run(run.id);
  const sentAfter = store.listAudit(run.id).filter((a) => a.kind === "send").length;
  console.log("IDEMPOTENT RE-RUN sends before/after", sentBefore, sentAfter);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
