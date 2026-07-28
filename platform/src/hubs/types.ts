import type {
  EvalReport,
  HubId,
  OperatingPlan,
} from "../types/index.js";

/** Audit → plan → run → evaluate. Every hub implements this contract. */
export interface HubOperator {
  id: HubId;
  name: string;
  /** Audit output → operating map for this business. */
  plan(input: PlanInput): Promise<OperatingPlan>;
  /** Resumable execution via agent_runs.checkpoint. */
  run(runId: string): Promise<void>;
  /** Golden-set evals for this hub. */
  evaluate(datasetId: string): Promise<EvalReport>;
}

export interface PlanInput {
  businessId: string;
  pilotPercent?: number;
}

export type HubOperatorFactory = () => HubOperator;
