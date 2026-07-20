export const site = {
  name: "Operate-IQ",
  domain: "operate-iq.com",
  url: "https://operate-iq.com",
  tagline: "Operational playbooks for accounting firms",
  description:
    "Practical workflow playbooks for boutique accountants and bookkeepers — tool-specific fixes, guardrails, and before/after maps.",
} as const;

export type TopicSlug =
  | "receipt-capture"
  | "client-onboarding"
  | "billing-ap"
  | "payroll-data-entry"
  | "client-communication"
  | "security-guardrails";

export const topics: Record<
  TopicSlug,
  { title: string; description: string; searchJob: string }
> = {
  "receipt-capture": {
    title: "Receipt capture & books",
    description:
      "Stop losing evenings to receipt chaos — from bank statements to inbox attachments.",
    searchJob: "Owners searching how to stop receipt chaos",
  },
  "client-onboarding": {
    title: "Client onboarding",
    description:
      "Kickoff checklists, intake forms, and folder packs without manual babysitting.",
    searchJob: "Firms drowning in kickoff checklists",
  },
  "billing-ap": {
    title: "Billing & AP",
    description:
      "Invoices, payables, and payment reconciliation without copy-paste.",
    searchJob: "Invoice and payables copy-paste",
  },
  "payroll-data-entry": {
    title: "Payroll & data entry",
    description:
      "Extract data from PDFs and docs instead of retyping into sheets.",
    searchJob: "Manual typing from docs into sheets/software",
  },
  "client-communication": {
    title: "Client communication",
    description:
      "Follow-ups, status updates, and draft replies that do not burn evenings.",
    searchJob: "Emails and follow-ups that burn evenings",
  },
  "security-guardrails": {
    title: "Security & guardrails",
    description:
      "Human-in-the-loop patterns so automation does not risk client records.",
    searchJob: "Fear of AI mistakes — your differentiator",
  },
};

export const tools = [
  "quickbooks",
  "xero",
  "gmail",
  "outlook",
  "excel",
  "hubspot",
  "typeform",
  "slack",
  "stripe",
  "dropbox",
] as const;

export type ToolSlug = (typeof tools)[number];

export const toolLabels: Record<ToolSlug, string> = {
  quickbooks: "QuickBooks",
  xero: "Xero",
  gmail: "Gmail",
  outlook: "Outlook",
  excel: "Excel",
  hubspot: "HubSpot",
  typeform: "Typeform",
  slack: "Slack",
  stripe: "Stripe",
  dropbox: "Dropbox",
};
