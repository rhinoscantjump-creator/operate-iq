export type HubStatus = "live" | "coming-soon";

export type FunnelStage =
  | "capture"
  | "reactivate"
  | "reputation"
  | "convert"
  | "insight";

export type VerticalPack =
  | "gym"
  | "clinic"
  | "home-services"
  | "salon"
  | "general";

export interface StatSource {
  claim: string;
  source: string;
  note?: string;
}

export interface HubKpi {
  id: string;
  label: string;
  description: string;
  targetHint: string;
}

export interface HubIntegration {
  id: string;
  label: string;
  purpose: string;
}

export interface ComplianceRule {
  id: string;
  title: string;
  detail: string;
}

export interface HubCapability {
  title: string;
  detail: string;
}

/** AEO / playbook deep-dive — symptom → leak → steps → guardrail */
export interface HubDeepDive {
  symptom: string;
  audience: string;
  timeLeak: string;
  guardrail: string;
  before: string;
  after: string;
  steps: string[];
  failureModes: { title: string; detail: string }[];
  whenNotToAutomate: string;
}

export interface Hub {
  id: string;
  slug: string;
  number: string;
  status: HubStatus;
  operator: string;
  titleLead: string;
  titleAccent: string;
  funnelStage: FunnelStage;
  leakStat: string;
  leakBody: string;
  punchline: string;
  diagramLabel: string;
  capabilities: HubCapability[];
  kpis: HubKpi[];
  productImprovements: string[];
  verticalNotes: Partial<Record<VerticalPack, string>>;
  integrations: string[];
  complianceIds: string[];
  hireOrderLogical: number;
  hireOrderFastRoi: number | null;
  comingSoonLeak?: string;
  /** Hub IDs this add-on extends (e.g. hub-03) */
  supplementsHubIds?: string[];
  supplementsWhy?: string;
  /** Live hubs: citable playbook structure for answer engines */
  deepDive?: HubDeepDive;
}

export interface LeakScoreSample {
  hubId: string;
  score: number;
  trend: "up" | "down" | "flat";
  note: string;
}

export const funnelLabels: Record<FunnelStage, string> = {
  capture: "Capture",
  reactivate: "Reactivate",
  reputation: "Reputation",
  convert: "Convert",
  insight: "Insight",
};

export const funnelOrder: FunnelStage[] = [
  "capture",
  "reactivate",
  "reputation",
  "convert",
  "insight",
];
