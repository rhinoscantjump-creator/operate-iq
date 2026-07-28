import type { MemoryStore } from "../db/memory-store.js";
import type { HubId, RunMode } from "../types/index.js";

/** Lightweight job helpers — swap for Inngest/Trigger.dev in production. */
export async function enqueueHubRun(
  store: MemoryStore,
  input: {
    businessId: string;
    hubId: HubId;
    mode?: RunMode;
    pilotPercent?: number;
  },
) {
  return store.createAgentRun({
    businessId: input.businessId,
    hubId: input.hubId,
    mode: input.mode,
    pilotPercent: input.pilotPercent,
  });
}

export async function resumeHubRun(
  store: MemoryStore,
  runId: string,
  runner: (runId: string) => Promise<void>,
) {
  const run = store.getAgentRun(runId);
  if (run.status === "completed") return run;
  await runner(runId);
  return store.getAgentRun(runId);
}
