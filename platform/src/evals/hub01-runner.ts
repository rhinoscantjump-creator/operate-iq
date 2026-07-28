import type { MemoryStore } from "../db/memory-store.js";
import type { EvalReport } from "../types/index.js";
import { decideFromEvalInput } from "../hubs/hub-01/decisions.js";
import { HUB01_DATASET_ID, materializeGoldenCases } from "./golden-hub01.js";

export function seedHub01Evals(store: MemoryStore): number {
  const existing = store.listEvalCases("hub-01", HUB01_DATASET_ID);
  if (existing.length >= 20) return existing.length;
  for (const seed of materializeGoldenCases()) {
    store.addEvalCase(seed);
  }
  return store.listEvalCases("hub-01", HUB01_DATASET_ID).length;
}

export async function evaluateHub01(
  store: MemoryStore,
  datasetId = HUB01_DATASET_ID,
): Promise<EvalReport> {
  seedHub01Evals(store);
  const cases = store.listEvalCases("hub-01", datasetId);
  const evalRun = store.createEvalRun("hub-01", datasetId);
  const failureCategories: Record<string, number> = {};
  let passed = 0;

  const results = cases.map((evalCase) => {
    const { predicted, decision } = decideFromEvalInput(evalCase.input);
    const ok = predicted === evalCase.idealAction;
    if (ok) {
      passed += 1;
    } else {
      const category = `action:${predicted}_expected:${evalCase.idealAction}`;
      failureCategories[category] = (failureCategories[category] ?? 0) + 1;
    }
    return store.addEvalResult({
      evalRunId: evalRun.id,
      evalCaseId: evalCase.id,
      passed: ok,
      predictedAction: predicted,
      failureCategory: ok ? undefined : `action_mismatch`,
      details: {
        name: evalCase.name,
        idealAction: evalCase.idealAction,
        decision,
      },
    });
  });

  const passRate = cases.length === 0 ? 0 : Math.round((passed / cases.length) * 1000) / 10;
  const summary = {
    total: cases.length,
    passed,
    passRate,
    failureCategories,
  };
  store.completeEvalRun(evalRun.id, summary);

  return {
    hubId: "hub-01",
    datasetId,
    total: cases.length,
    passed,
    passRate,
    failureCategories,
    results,
  };
}
