import type { Companion } from "./types";

/** Companions sit beside the hub OS — guidance / partner payoff, not Operator skill. */
export const companions: Companion[] = [
  {
    id: "companion-ad-multiplier",
    slug: "ad-multiplier",
    titleLead: "Ad",
    titleAccent: "Multiplier",
    kicker: "Companion · not an Operator",
    punchline:
      "Once the leaks are plugged, the same Google and Meta spend books more — because the click no longer lands in a broken handoff.",
    body:
      "Operate IQ does not run your ad accounts. This companion is the payoff layer: after Reactivate, Reputation, and Capture stop wasting inquiries, paid traffic converts harder. Scale ads when the OS is healthy — not to paper over dust, missed calls, and slow replies.",
    symptom:
      "Budget keeps pouring into Google Ads and Meta while the CRM, phone, and reviews still leak — every click funds a broken first response.",
    whenReady:
      "Once the documented hubs are actually running: dusty leads get a second touch, reviews/referrals run, speed-to-lead is minutes not hours, missed calls text back, no-shows get rescued, quotes get chased, and the team can close.",
    relatedHubIds: ["hub-01", "hub-02", "hub-03", "hub-04", "hub-05"],
    whyAdsImprove: [
      "Speed-to-lead (Hub 03) and missed-call text-back (Hub 04) stop burning the click before a human ever answers.",
      "Reactivation (Hub 01) and reviews/referrals (Hub 02) raise booked capacity and social proof so paid traffic isn’t the only growth lever — and converts against a stronger brand.",
      "Sales coaching (Hub 05) closes the leads ads already paid for instead of letting them die on the phone.",
    ],
    whatItIsNot: [
      "Not Hub 14 — it has no hire-order slot among the 13 operators.",
      "Not an AI Operator with CRM/SMS automation skill like the numbered hubs.",
      "Not a Google Ads or Meta Ads management product — campaign build, bidding, and creative stay with you or a media partner.",
      "Not a promised ROAS percentage — conversion improves because leaks stop wasting the click, not because we invent a lift figure.",
    ],
  },
];

export function getCompanionBySlug(slug: string) {
  return companions.find((c) => c.slug === slug);
}

export function getCompanionsForHub(hubId: string) {
  return companions.filter((c) => c.relatedHubIds.includes(hubId));
}
