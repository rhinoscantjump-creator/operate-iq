import type { EvalCase, EvalIdealAction, HubId } from "../types/index.js";

export const HUB01_DATASET_ID = "hub-01-golden-v1";

interface SeedCase {
  name: string;
  idealAction: EvalIdealAction;
  idealTone?: string;
  idealNotes?: string;
  input: Record<string, unknown>;
}

/** 20 golden cases for Hub 01 reactivation decisions. */
export const hub01GoldenSeeds: SeedCase[] = [
  {
    name: "lapsed gym member with consent",
    idealAction: "message",
    idealTone: "friendly",
    input: {
      fullName: "Sam",
      phone: "+15550101",
      segment: "lapsed",
      smsConsent: true,
      vertical: "gym",
    },
  },
  {
    name: "never-booked inquiry with consent",
    idealAction: "message",
    idealTone: "helpful",
    input: {
      fullName: "Jordan",
      phone: "+15550102",
      segment: "never-booked",
      smsConsent: true,
      vertical: "salon",
    },
  },
  {
    name: "no-show clinic patient",
    idealAction: "message",
    idealTone: "clinical-safe",
    input: {
      fullName: "Taylor",
      phone: "+15550103",
      segment: "no-show",
      smsConsent: true,
      vertical: "clinic",
    },
  },
  {
    name: "cancelled home-services quote",
    idealAction: "message",
    input: {
      fullName: "Casey",
      phone: "+15550104",
      segment: "cancelled",
      smsConsent: true,
      vertical: "home-services",
    },
  },
  {
    name: "missing SMS consent",
    idealAction: "skip",
    idealNotes: "must not message without consent",
    input: {
      fullName: "Riley",
      phone: "+15550105",
      segment: "lapsed",
      smsConsent: false,
      vertical: "general",
    },
  },
  {
    name: "missing phone number",
    idealAction: "skip",
    input: {
      fullName: "Avery",
      segment: "lapsed",
      smsConsent: true,
      vertical: "general",
    },
  },
  {
    name: "do not contact flag",
    idealAction: "skip",
    input: {
      fullName: "Quinn",
      phone: "+15550107",
      segment: "lapsed",
      smsConsent: true,
      doNotContact: true,
      vertical: "gym",
    },
  },
  {
    name: "quiet hours block",
    idealAction: "skip",
    input: {
      fullName: "Morgan",
      phone: "+15550108",
      segment: "lapsed",
      smsConsent: true,
      quietHours: true,
      vertical: "salon",
    },
  },
  {
    name: "STOP keyword in last reply",
    idealAction: "escalate",
    idealNotes: "human handoff required",
    input: {
      fullName: "Reese",
      phone: "+15550109",
      segment: "lapsed",
      smsConsent: true,
      lastReply: "STOP texting me",
      vertical: "general",
    },
  },
  {
    name: "angry reply language",
    idealAction: "escalate",
    input: {
      fullName: "Drew",
      phone: "+15550110",
      segment: "cancelled",
      smsConsent: true,
      notes: "customer was angry about billing",
      vertical: "clinic",
    },
  },
  {
    name: "lawsuit mention",
    idealAction: "escalate",
    input: {
      fullName: "Parker",
      phone: "+15550111",
      segment: "lapsed",
      smsConsent: true,
      notes: "mentioned lawsuit last visit",
      vertical: "home-services",
    },
  },
  {
    name: "unknown segment needs owner",
    idealAction: "escalate",
    input: {
      fullName: "Jamie",
      phone: "+15550112",
      segment: "unknown",
      smsConsent: true,
      vertical: "general",
    },
  },
  {
    name: "lapsed salon with consent",
    idealAction: "message",
    input: {
      fullName: "Cameron",
      phone: "+15550113",
      segment: "lapsed",
      smsConsent: true,
      vertical: "salon",
    },
  },
  {
    name: "never-booked gym trial",
    idealAction: "message",
    input: {
      fullName: "Harper",
      phone: "+15550114",
      segment: "never-booked",
      smsConsent: true,
      vertical: "gym",
    },
  },
  {
    name: "no-show salon",
    idealAction: "message",
    input: {
      fullName: "Rowan",
      phone: "+15550115",
      segment: "no-show",
      smsConsent: true,
      vertical: "salon",
    },
  },
  {
    name: "cancelled gym membership restart",
    idealAction: "message",
    input: {
      fullName: "Skyler",
      phone: "+15550116",
      segment: "cancelled",
      smsConsent: true,
      vertical: "gym",
    },
  },
  {
    name: "unsubscribe note",
    idealAction: "escalate",
    input: {
      fullName: "Emerson",
      phone: "+15550117",
      segment: "lapsed",
      smsConsent: true,
      lastReply: "please unsubscribe",
      vertical: "general",
    },
  },
  {
    name: "email-only contact no phone",
    idealAction: "skip",
    input: {
      fullName: "Finley",
      email: "finley@example.com",
      emailConsent: true,
      segment: "lapsed",
      smsConsent: false,
      vertical: "clinic",
    },
  },
  {
    name: "home-services seasonal lapsed",
    idealAction: "message",
    input: {
      fullName: "Hayden",
      phone: "+15550119",
      segment: "lapsed",
      smsConsent: true,
      vertical: "home-services",
    },
  },
  {
    name: "fraud concern note",
    idealAction: "escalate",
    input: {
      fullName: "Blake",
      phone: "+15550120",
      segment: "never-booked",
      smsConsent: true,
      notes: "possible fraud inquiry",
      vertical: "general",
    },
  },
];

export function materializeGoldenCases(hubId: HubId = "hub-01"): Omit<EvalCase, "id" | "createdAt">[] {
  return hub01GoldenSeeds.map((seed) => ({
    hubId,
    datasetId: HUB01_DATASET_ID,
    name: seed.name,
    input: seed.input,
    idealAction: seed.idealAction,
    idealTone: seed.idealTone,
    idealNotes: seed.idealNotes,
  }));
}
