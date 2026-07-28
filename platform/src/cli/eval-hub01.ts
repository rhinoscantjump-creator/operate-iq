import { MemoryStore } from "../db/memory-store.js";
import { createHub01Operator } from "../hubs/hub-01/operator.js";
import { HUB01_DATASET_ID } from "../evals/golden-hub01.js";

async function main() {
  const store = new MemoryStore();
  const operator = createHub01Operator({ store });
  const report = await operator.evaluate(HUB01_DATASET_ID);
  console.log(
    JSON.stringify(
      {
        datasetId: report.datasetId,
        total: report.total,
        passed: report.passed,
        passRate: report.passRate,
        failureCategories: report.failureCategories,
      },
      null,
      2,
    ),
  );
  if (report.passRate < 100) {
    console.error("Eval failures:");
    for (const r of report.results.filter((x) => !x.passed)) {
      console.error("-", r.details.name, r.details);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
