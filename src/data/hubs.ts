import type {
  ComplianceRule,
  FunnelStage,
  Hub,
  HubIntegration,
  LeakScoreSample,
  StatSource,
} from "./types";

/** Locked product naming: Hub + Operator (not "Employee"). Multi-SMB local-service OS. */
export const product = {
  name: "Operate IQ",
  tagline: "Plug the revenue leaks local businesses ignore.",
  positioning:
    "A multi-hub operating system for local service businesses — gyms, clinics, home services, salons, and more. Each hub is an AI operator that plugs one named leak.",
  naming: {
    unit: "Hub",
    role: "Operator",
  },
} as const;

export const statSources: StatSource[] = [
  {
    claim:
      "Customers heavily rely on online reviews before choosing a local business.",
    source:
      "BrightLocal Local Consumer Review Survey (industry benchmark; cite latest year on publish)",
    note: "Use “most customers check reviews” rather than a fragile exact % if the year-specific figure cannot be footnoted on-page.",
  },
  {
    claim:
      "Lead response within 5 minutes materially lifts conversion vs multi-hour delays.",
    source:
      "Harvard Business Review / InsideSales lead-response research (classic speed-to-lead findings)",
    note: "Present as “up to 400% lift in contact/qualify rates when responding in minutes vs hours,” with methodology note.",
  },
  {
    claim:
      "A large share of calls to small/local businesses go unanswered during business hours.",
    source:
      "Invoca / industry missed-call studies for local & multi-location businesses",
    note: "Keep “majority of missed callers do not leave voicemail / often call a competitor” as the operational truth.",
  },
  {
    claim:
      "Many frontline sellers receive little formal sales training; trained teams outperform.",
    source:
      "ATD / sales-enablement industry reports on training investment vs performance",
    note: "Frame as directional: training correlates with higher revenue per rep — not a guaranteed +50%.",
  },
  {
    claim:
      "Dormant CRM contacts are a common unpaid growth channel for brick-and-mortar SMBs.",
    source:
      "Operator benchmarks from local CRM reactivation campaigns (segmented SMS/email)",
    note: "Avoid inventing a hard “27% never follow up” without a public cite; use “a large share of first-visit leads never get a second touch.”",
  },
];

export const integrations: HubIntegration[] = [
  {
    id: "crm",
    label: "CRM / contact DB",
    purpose: "Lead segments, consent flags, ownership, and campaign history",
  },
  {
    id: "calendar",
    label: "Calendar / booking",
    purpose: "Real-time availability, booking, reschedule, and reminders",
  },
  {
    id: "phone",
    label: "Business phone",
    purpose: "Missed-call triggers, optional AI voice, call recording consent",
  },
  {
    id: "sms",
    label: "SMS / messaging",
    purpose: "Compliant outbound and two-way conversations",
  },
  {
    id: "webforms",
    label: "Website forms & chat",
    purpose: "Instant lead capture into Hub 03 nurture",
  },
  {
    id: "ads",
    label: "Meta / Google lead ads",
    purpose: "Same 5-minute response SLA as website leads",
  },
  {
    id: "reviews",
    label: "Google / review platforms",
    purpose: "Review links, monitoring, and reply workflows",
  },
  {
    id: "social",
    label: "Social / messaging inboxes",
    purpose: "FB, IG, WhatsApp, and DM threads in one response queue",
  },
  {
    id: "payments",
    label: "Payments / billing",
    purpose: "Invoices, failed cards, and collection nudges",
  },
];

export const complianceRules: ComplianceRule[] = [
  {
    id: "sms-consent",
    title: "SMS & messaging consent",
    detail:
      "Only message contacts with documented opt-in for the relevant channel. Honor STOP/HELP. Align with TCPA (US), POPIA (ZA), GDPR/ePrivacy (EU/UK), and local carrier rules.",
  },
  {
    id: "review-incentives",
    title: "Review incentives (platform-safe)",
    detail:
      "Never gate a reward on leaving a positive review. Ask for an honest rating first. Run any thank-you / referral reward as a separate step after the review ask — Google and other platforms prohibit review conditioning.",
  },
  {
    id: "human-handoff",
    title: "Human handoff",
    detail:
      "Escalate billing disputes, medical/legal edge cases, angry customers, and “talk to a person” requests to a named human with full conversation context.",
  },
  {
    id: "recording-consent",
    title: "Call recording & coaching",
    detail:
      "Hub 05 only scores conversations where recording/transcript consent is obtained. Coaching uses scorecards on script, objections, close, and follow-up — not secret surveillance.",
  },
  {
    id: "data-minimization",
    title: "Data minimization",
    detail:
      "Hubs only pull the fields needed for the job. Vertical packs can add industry-specific fields without expanding the default schema.",
  },
];

export const hubs: Hub[] = [
  {
    id: "hub-01",
    slug: "database-reactivation",
    number: "01",
    status: "live",
    operator: "The Outreach Operator",
    titleLead: "Database",
    titleAccent: "Reactivation",
    funnelStage: "reactivate",
    leakStat: "Untapped",
    leakBody:
      "A large share of first-visit and inquiry leads never get a second touch. Local CRMs fill with dust while ad spend keeps buying the same strangers.",
    punchline:
      "The business is sitting on a goldmine of leads it never touched. This hub turns dust into dollars.",
    diagramLabel: "Old leads → booked again",
    capabilities: [
      {
        title: "Segment before you send",
        detail:
          "Splits dormant contacts into never-booked, no-show, cancelled, and lapsed — then matches offer templates by vertical pack.",
      },
      {
        title: "Pilot 5–10% of the list",
        detail:
          "Starts with a controlled slice so messaging, offers, and booking capacity are proven before full rollout.",
      },
      {
        title: "AI outreach with an offer",
        detail:
          "Plugs into the existing database and reaches out with a clear, vertical-aware offer — no new ad spend required.",
      },
      {
        title: "Fastest cash hire",
        detail:
          "Designed as the fastest-ROI first hire when the CRM is already full: prove value in week one by driving old contacts back through the door.",
      },
    ],
    kpis: [
      {
        id: "reactivation-rate",
        label: "Reactivation rate",
        description: "Dormant contacts who reply or book",
        targetHint: "Track by segment",
      },
      {
        id: "booked-from-dormant",
        label: "Bookings from dormant",
        description: "Appointments attributed to reactivation",
        targetHint: "Week-1 proof metric",
      },
      {
        id: "revenue-reactivated",
        label: "Revenue reactivated",
        description: "Closed revenue from reactivated contacts",
        targetHint: "No new ad spend",
      },
      {
        id: "list-coverage",
        label: "List coverage",
        description: "% of eligible consented list contacted",
        targetHint: "Ramp after pilot",
      },
    ],
    productImprovements: [
      "Segmented dormancy buckets (never booked / no-show / cancelled / lapsed)",
      "5–10% pilot before full send",
      "Vertical offer templates (gym, clinic, home services, salon, general)",
    ],
    verticalNotes: {
      gym: "Trial or “come back this week” membership offers; avoid spammy blast language.",
      clinic:
        "Rebook reminders for lapsed patients with clinical-safe wording and consent.",
      "home-services":
        "Seasonal or unfinished-quote win-backs for past inquiries.",
      salon: "Lapsed-client rebook with stylist preference and quiet hours.",
      general:
        "Neutral “we saved your spot / special for past inquiries” templates.",
    },
    integrations: ["crm", "sms", "calendar"],
    complianceIds: ["sms-consent", "human-handoff", "data-minimization"],
    hireOrderLogical: 3,
    hireOrderFastRoi: 1,
    deepDive: {
      symptom:
        "The CRM is full of past inquiries and first visits, but almost nobody gets a second touch.",
      audience:
        "Gym, clinic, home-service, salon, and SMB owners who already paid for leads that went quiet.",
      timeLeak:
        "Ad spend keeps buying strangers while dormant contacts sit unused — often weeks of booked capacity left on the table.",
      guardrail:
        "Only consented contacts get outbound messages. Pilot 5–10% of the list first. Escalate billing, medical, or angry replies to a named human.",
      before:
        "Staff sporadically call or blast the whole list. Offers are generic. Nobody knows which segment booked, and capacity gets swamped or ignored.",
      after:
        "Dormant contacts are segmented (never-booked, no-show, cancelled, lapsed). A small pilot proves the offer, then outreach books into the live calendar with attribution.",
      steps: [
        "Connect CRM + SMS and confirm consent flags for eligible contacts.",
        "Segment never-booked, no-show, cancelled, and lapsed lists — exclude do-not-contact.",
        "Pick one vertical-aware offer template and pilot 5–10% of the eligible list.",
        "Send outreach with a clear book link into live calendar availability.",
        "Measure replies, bookings, and revenue from dormant contacts before full rollout.",
      ],
      failureModes: [
        {
          title: "Blast without segments",
          detail:
            "One generic blast tanks reply rates and burns trust. Match offer to why they went quiet.",
        },
        {
          title: "No capacity plan",
          detail:
            "A successful reactivation without booking slots creates angry customers. Pilot against real calendar capacity.",
        },
        {
          title: "Missing consent",
          detail:
            "Messaging contacts without documented opt-in creates compliance risk. Filter first, then send.",
        },
      ],
      whenNotToAutomate:
        "Do not auto-message contacts in active disputes, medical-sensitive cases without approved copy, or anyone who already opted out — those stay with a human.",
    },
  },
  {
    id: "hub-02",
    slug: "reviews-referrals",
    number: "02",
    status: "live",
    operator: "The Reputation Operator",
    titleLead: "Reviews",
    titleAccent: "& Referrals",
    funnelStage: "reputation",
    leakStat: "Most",
    leakBody:
      "Most customers check reviews before buying — yet frontline teams rarely ask. Reputation and referrals stay accidental instead of systematic. (Exact survey % varies by year; cite BrightLocal on publish.)",
    punchline:
      "Everybody checks reviews. Basically nobody asks for them. This hub fixes that overnight.",
    diagramLabel: "Ask → review → refer",
    capabilities: [
      {
        title: "Stage 1 — honest review ask",
        detail:
          "After a completed visit/job, AI asks for a 1–5 experience rating and routes happy customers to the review link. No reward is gated on leaving a review.",
      },
      {
        title: "Stage 2 — separate referral reward",
        detail:
          "After the review step, a separate thank-you / referral offer can run (guest invite, credit, seasonal perk) without conditioning the review itself.",
      },
      {
        title: "Review reply automation",
        detail:
          "Drafts on-brand replies to new reviews and flags negatives for human handoff — reputation defense starts here.",
      },
      {
        title: "Referral lead capture",
        detail:
          "Sends a clean referral link and tracks free inbound leads — usually the highest-intent acquisition channel a local business gets.",
      },
    ],
    kpis: [
      {
        id: "ask-rate",
        label: "Review ask rate",
        description: "% of eligible customers asked",
        targetHint: "Near 100% of completed jobs",
      },
      {
        id: "review-conversion",
        label: "Review conversion",
        description: "Asks that become public reviews",
        targetHint: "By channel",
      },
      {
        id: "reply-sla",
        label: "Reply SLA",
        description: "Median time to reply to new reviews",
        targetHint: "< 24h",
      },
      {
        id: "referral-leads",
        label: "Referral leads",
        description: "Leads attributed to referral links",
        targetHint: "Cost = $0 ads",
      },
    ],
    productImprovements: [
      "Two-stage flow: honest ask first, referral reward second",
      "No review-gated incentives (platform compliance)",
      "Automated review replies with human escalation",
    ],
    verticalNotes: {
      gym: "Referral invite / guest session after the review ask — never “review to win free membership.”",
      clinic:
        "Soft ask language; referral rewards only where clinically and ethically appropriate.",
      "home-services": "Photo-friendly review prompts after completed jobs.",
      salon: "Stylist-tagged asks; quiet hours respected.",
      general:
        "Neutral “how was your visit?” → review link → optional thank-you referral.",
    },
    integrations: ["crm", "sms", "reviews", "calendar"],
    complianceIds: ["sms-consent", "review-incentives", "human-handoff"],
    hireOrderLogical: 4,
    hireOrderFastRoi: 3,
    deepDive: {
      symptom:
        "Happy customers leave without ever being asked for a review or referral.",
      audience:
        "Local service businesses where Google and word-of-mouth decide who wins the next job.",
      timeLeak:
        "Reputation stays accidental. Referral leads — usually the highest-intent channel — never get a systematic ask.",
      guardrail:
        "Never gate a reward on a positive review. Ask for an honest rating first; run any thank-you or referral offer as a separate step.",
      before:
        "Staff forget to ask. Occasional manual texts. Negative reviews sit unanswered. Referrals happen only when someone remembers.",
      after:
        "After a completed visit, AI asks for an honest rating, routes happy customers to the review link, drafts replies, then optionally runs a separate referral thank-you.",
      steps: [
        "Trigger the ask after completed jobs/visits from calendar or CRM status.",
        "Stage 1: request an honest 1–5 experience rating — no reward attached.",
        "Route 4–5 ratings to the public review link; escalate low ratings to a human.",
        "Stage 2 (optional): send a separate thank-you / referral offer after the ask.",
        "Auto-draft review replies; require human send on negatives and edge cases.",
      ],
      failureModes: [
        {
          title: "Review-gated incentives",
          detail:
            "“Leave a 5-star review to get X” violates platform rules and destroys trust. Keep reward separate from the ask.",
        },
        {
          title: "No reply on negatives",
          detail:
            "Unanswered 1-star reviews compound damage. Escalate immediately with full context.",
        },
        {
          title: "Asking too early",
          detail:
            "Asking before the job is complete or while the customer is unhappy backfires. Trigger only on completed, eligible visits.",
        },
      ],
      whenNotToAutomate:
        "Do not auto-ask during active complaints, refund disputes, or clinical incidents — wait for a human all-clear.",
    },
  },
  {
    id: "hub-03",
    slug: "website-lead-nurturing",
    number: "03",
    status: "live",
    operator: "The Website Operator",
    titleLead: "Website",
    titleAccent: "Lead Nurturing",
    funnelStage: "capture",
    leakStat: "5 min",
    leakBody:
      "Speed-to-lead research (HBR / InsideSales) shows responding within minutes can lift contact and qualify rates by up to ~400% versus multi-hour delays — while many local teams still take a day or two.",
    punchline:
      "Follow up in minutes instead of hours and watch conversion rates multiply.",
    diagramLabel: "Minutes vs hours",
    capabilities: [
      {
        title: "Multi-channel capture",
        detail:
          "Same 5-minute SLA across website forms, on-site chat, and Meta/Google lead ads — not website-only.",
      },
      {
        title: "24/7 conversation + booking",
        detail:
          "Answers common questions and books into the live calendar without the owner babysitting the inbox.",
      },
      {
        title: "Show-up reminders",
        detail:
          "Confirmation and reminder sequences reduce soft no-shows before Hub 06 takes over recovery.",
      },
      {
        title: "Hands-off for staff",
        detail:
          "Owner and staff stay out of the first-touch loop unless the lead asks for a human or hits an escalation rule.",
      },
    ],
    kpis: [
      {
        id: "median-first-response",
        label: "Median first response",
        description: "Time from lead create to first AI touch",
        targetHint: "< 5 minutes",
      },
      {
        id: "book-rate",
        label: "Book rate",
        description: "Inbound leads that book",
        targetHint: "By channel",
      },
      {
        id: "show-rate",
        label: "Show rate",
        description: "Booked leads that attend",
        targetHint: "After reminders",
      },
      {
        id: "channel-coverage",
        label: "Channel coverage",
        description: "Forms / chat / lead ads connected",
        targetHint: "All three live",
      },
    ],
    productImprovements: [
      "Explicit channels: web form, chat, FB/IG & Google lead ads",
      "Show-up reminder sibling flow",
      "Escalation to human without dropping context",
    ],
    verticalNotes: {
      gym: "Trial-class booking + reminder cadence.",
      clinic:
        "Intake questions before booking; HIPAA-aware wording where required.",
      "home-services":
        "Service-area and urgency qualification before calendar.",
      salon: "Service + stylist preference capture.",
      general: "FAQ + book flow with quiet hours.",
    },
    integrations: ["webforms", "ads", "crm", "sms", "calendar"],
    complianceIds: ["sms-consent", "human-handoff", "data-minimization"],
    hireOrderLogical: 2,
    hireOrderFastRoi: 2,
    deepDive: {
      symptom:
        "Website and ad leads sit for hours or overnight before anyone replies.",
      audience:
        "Local businesses running forms, chat, or Meta/Google lead ads where speed-to-lead decides who books.",
      timeLeak:
        "Responding in minutes can lift contact/qualify rates dramatically vs multi-hour delays — while many teams still take a day or two.",
      guardrail:
        "AI handles first touch and booking; escalate “talk to a person,” medical/legal edge cases, and angry leads with full conversation context.",
      before:
        "Leads land in email or ad inboxes. Someone checks when free. By then the prospect booked elsewhere or went cold.",
      after:
        "Forms, chat, and lead ads share a 5-minute SLA. AI answers FAQs, books into the live calendar, and sends show-up reminders — staff only join on escalation.",
      steps: [
        "Connect website forms, on-site chat, and Meta/Google lead ads into one lead queue.",
        "Set the first-touch SLA to under five minutes, including after hours where quiet-hour rules allow.",
        "Load FAQ + qualification questions for the vertical pack.",
        "Book into live calendar availability with confirmation + reminder sequence.",
        "Route human-ask and edge cases to a named owner without dropping the thread.",
      ],
      failureModes: [
        {
          title: "Website-only coverage",
          detail:
            "Lead ads and chat with a slower SLA recreate the same leak. Same five-minute rule on every channel.",
        },
        {
          title: "No calendar sync",
          detail:
            "Booking without live availability creates double-books and no-shows. Connect the calendar first.",
        },
        {
          title: "FAQ that overpromises",
          detail:
            "Unapproved medical, pricing, or legal claims in the bot create risk. Keep answers to approved copy.",
        },
      ],
      whenNotToAutomate:
        "Do not let AI diagnose, quote regulated services, or commit custom pricing outside the approved playbook — those need a human.",
    },
  },
  {
    id: "hub-04",
    slug: "missed-call-text-back",
    number: "04",
    status: "live",
    operator: "The Reception Operator",
    titleLead: "Missed Call",
    titleAccent: "Text-Back",
    funnelStage: "capture",
    leakStat: "Missed",
    leakBody:
      "A large share of calls to local businesses go unanswered. Most callers will not leave a voicemail — they call the next business on the list.",
    punchline:
      "Every missed call used to be a lost customer. This hub plugs one of the biggest leaks in any local business.",
    diagramLabel: "Missed call → SMS (optional voice)",
    capabilities: [
      {
        title: "Instant text-back (default)",
        detail:
          "When a call is missed, AI texts within seconds from the business line, qualifies, and books — including after hours.",
      },
      {
        title: "Optional AI voice answer",
        detail:
          "Upgrade path: answer the live call with AI voice where consented and appropriate. Text-back remains the reliable baseline.",
      },
      {
        title: "After-hours & multi-location",
        detail:
          "Routes by location, hours, and overflow rules so franchises and multi-site operators do not share one messy inbox.",
      },
      {
        title: "Feeds the rest of the OS",
        detail:
          "Recovered conversations flow into CRM, calendar, and later review/referral asks — making every other hub more effective.",
      },
    ],
    kpis: [
      {
        id: "missed-call-recovery",
        label: "Missed-call recovery",
        description: "% of missed calls that get a reply",
        targetHint: "> 90%",
      },
      {
        id: "textback-latency",
        label: "Text-back latency",
        description: "Seconds from miss to first SMS",
        targetHint: "< 60s",
      },
      {
        id: "booked-from-missed",
        label: "Booked from missed",
        description: "Appointments from missed-call threads",
        targetHint: "Primary ROI",
      },
      {
        id: "after-hours-share",
        label: "After-hours capture",
        description: "Recovered conversations outside open hours",
        targetHint: "Watch overnight",
      },
    ],
    productImprovements: [
      "Clear split: text-back baseline vs optional AI voice",
      "After-hours coverage",
      "Multi-location routing",
    ],
    verticalNotes: {
      gym: "Membership / trial FAQ + tour booking.",
      clinic:
        "Urgent vs routine triage language; never give medical advice.",
      "home-services": "Job-type + photo request + estimate booking.",
      salon: "Walk-in vs appointment messaging by hours.",
      general: "Qualify → book → handoff rules.",
    },
    integrations: ["phone", "sms", "crm", "calendar"],
    complianceIds: ["sms-consent", "recording-consent", "human-handoff"],
    hireOrderLogical: 1,
    hireOrderFastRoi: 4,
    deepDive: {
      symptom:
        "Calls go unanswered during busy hours and after close — and most callers never leave a voicemail.",
      audience:
        "Any local business where the phone still drives bookings: clinics, trades, salons, gyms, multi-location operators.",
      timeLeak:
        "Missed callers often dial the next business on the list within minutes. Each miss is a silent lost job.",
      guardrail:
        "Text-back is the baseline. Optional AI voice only with recording consent. Escalate billing, medical, and “talk to a person” requests immediately.",
      before:
        "Phone rings out. Voicemail fills up. Staff return calls hours later to dead air. After-hours leads disappear overnight.",
      after:
        "A missed call triggers an SMS within seconds from the business line. AI qualifies and books — including after hours — and can optionally answer with AI voice where consented.",
      steps: [
        "Connect the business phone system and SMS channel on the same number identity.",
        "Enable instant text-back on missed/rejected calls with a clear qualify → book script.",
        "Set after-hours and multi-location routing rules.",
        "Optional: enable AI voice answer with recording consent where appropriate.",
        "Push recovered conversations into CRM + calendar so Hubs 02–05 can reuse the contact.",
      ],
      failureModes: [
        {
          title: "Slow text-back",
          detail:
            "A reply after five minutes loses the race. Target under 60 seconds from miss to first SMS.",
        },
        {
          title: "One messy inbox for every location",
          detail:
            "Franchises and multi-site shops need location-aware routing or threads get answered by the wrong team.",
        },
        {
          title: "Voice without consent",
          detail:
            "Recording or AI voice without notice creates compliance risk. Keep text-back as the safe default.",
        },
      ],
      whenNotToAutomate:
        "Emergency, medical-advice, or hostile callers should reach a human path immediately — do not keep them in a bot loop.",
    },
  },
  {
    id: "hub-05",
    slug: "sales-coaching",
    number: "05",
    status: "live",
    operator: "The Sales Trainer",
    titleLead: "Sales",
    titleAccent: "Coaching",
    funnelStage: "convert",
    leakStat: "Untrained",
    leakBody:
      "Many frontline sellers never get formal training. Industry enablement reports link training investment to higher revenue per rep — directional, not a guaranteed lift. Better leads from Hubs 01–04 still die if the team cannot close.",
    punchline:
      "Better leads mean nothing if the team cannot close. This hub makes sure they can.",
    diagramLabel: "Script · close · objections · follow-up",
    capabilities: [
      {
        title: "Transcript scoring first",
        detail:
          "v1 scopes to call and SMS transcripts with consent — grades Script, Close, Objections, and Follow-up on a visible scorecard.",
      },
      {
        title: "Coachable gaps, not vibes",
        detail:
          "Shows where reps lose people (e.g. weak close, missing follow-up) with examples pulled from real conversations.",
      },
      {
        title: "Protect marketing ROI",
        detail:
          "Makes sure every dollar spent on capture and reactivation converts at a higher rate before you buy more traffic.",
      },
      {
        title: "No overclaimed “GPT coach”",
        detail:
          "Does not pretend to replace a manager. It scores process against your playbook and queues human coaching moments.",
      },
    ],
    kpis: [
      {
        id: "close-rate-delta",
        label: "Close-rate delta",
        description: "Change in close rate after coaching loops",
        targetHint: "Primary outcome",
      },
      {
        id: "scorecard-coverage",
        label: "Scorecard coverage",
        description: "% of consented conversations scored",
        targetHint: "Ramp weekly",
      },
      {
        id: "followup-compliance",
        label: "Follow-up compliance",
        description: "Promised follow-ups completed on time",
        targetHint: "Process health",
      },
      {
        id: "objection-handle",
        label: "Objection handle rate",
        description: "Scored conversations that address top objections",
        targetHint: "By playbook",
      },
    ],
    productImprovements: [
      "Scoped to call/SMS transcript scoring (v1)",
      "Explicit four-axis scorecard",
      "Requires recording/transcript consent",
    ],
    verticalNotes: {
      gym: "Tour-to-membership scorecard.",
      clinic: "Treatment-plan explanation & next-step booking.",
      "home-services": "Estimate presentation and urgency handling.",
      salon: "Rebook and retail attach moments.",
      general: "Custom playbook axes with the same four grades.",
    },
    integrations: ["phone", "sms", "crm"],
    complianceIds: ["recording-consent", "human-handoff", "data-minimization"],
    hireOrderLogical: 5,
    hireOrderFastRoi: 5,
    deepDive: {
      symptom:
        "Leads from ads, web, and reactivation still die on the phone because the team was never coached.",
      audience:
        "Owners whose frontline staff sell tours, estimates, memberships, or treatment plans without a shared scorecard.",
      timeLeak:
        "Marketing ROI leaks at the close. Untrained conversations waste every dollar spent on Hubs 01–04.",
      guardrail:
        "Only score conversations with recording/transcript consent. This is a scorecard + coaching queue — not a replacement for a manager.",
      before:
        "Managers listen to random calls when they have time. Feedback is vague. The same objections keep killing deals with no shared playbook.",
      after:
        "Consented call and SMS transcripts are graded on Script, Close, Objections, and Follow-up. Gaps surface with examples so a human coach can run a tight loop.",
      steps: [
        "Confirm recording/transcript consent rules for the phone and SMS channels.",
        "Load the four-axis scorecard (Script, Close, Objections, Follow-up) for the vertical pack.",
        "Score consented conversations weekly and surface the weakest axis per rep.",
        "Queue human coaching moments with real examples — not generic tips.",
        "Track close-rate delta and follow-up compliance before buying more traffic.",
      ],
      failureModes: [
        {
          title: "Scoring without consent",
          detail:
            "Secret surveillance destroys trust and may break local recording laws. Consent first.",
        },
        {
          title: "Vibes instead of a scorecard",
          detail:
            "“Be more confident” is not coachable. Stick to the four visible axes with examples.",
        },
        {
          title: "AI as the manager",
          detail:
            "The hub queues coaching; a human still owns the conversation with the rep.",
        },
      ],
      whenNotToAutomate:
        "Do not auto-discipline staff from scores alone, and do not score private or non-consented channels.",
    },
  },
  {
    id: "hub-06",
    slug: "no-show-recovery",
    number: "06",
    status: "coming-soon",
    operator: "The Retention Closer",
    titleLead: "No-Show",
    titleAccent: "Recovery",
    funnelStage: "capture",
    leakStat: "Soon",
    leakBody:
      "Booked-but-no-show appointments silently erase Hub 03 and Hub 04 ROI.",
    punchline: "Recover the appointment before you buy another lead.",
    diagramLabel: "No-show → rebook",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["calendar", "sms", "crm"],
    complianceIds: ["sms-consent", "human-handoff"],
    hireOrderLogical: 6,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Capture hubs book appointments; no-shows erase that ROI. Recover booked-but-missed slots before buying more leads.",
    supplementsHubIds: ["hub-03", "hub-04"],
    supplementsWhy:
      "Hub 03 and Hub 04 create bookings — this hub protects show rate when people ghost the calendar.",
  },
  {
    id: "hub-07",
    slug: "quote-follow-up",
    number: "07",
    status: "coming-soon",
    operator: "The Proposal Closer",
    titleLead: "Quote",
    titleAccent: "Follow-Up",
    funnelStage: "convert",
    leakStat: "Soon",
    leakBody:
      "Quotes and estimates sit unanswered for days while competitors stay in the thread.",
    punchline: "Never let a sent quote die in silence.",
    diagramLabel: "Quote sent → follow-up",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["crm", "sms", "calendar"],
    complianceIds: ["sms-consent", "human-handoff"],
    hireOrderLogical: 7,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Capture creates conversations; many end in a quote that dies unanswered. Keeps proposals alive for Hub 05 to close.",
    supplementsHubIds: ["hub-03", "hub-04", "hub-05"],
    supplementsWhy:
      "Gives Hub 05 something to close — quotes that would otherwise go cold after capture.",
  },
  {
    id: "hub-08",
    slug: "social-inbox-responder",
    number: "08",
    status: "coming-soon",
    operator: "The Front Desk Omnichannel",
    titleLead: "Social / Inbox",
    titleAccent: "Responder",
    funnelStage: "capture",
    leakStat: "Soon",
    leakBody:
      "Unread DMs and social messages are speed-to-lead leaks Hub 03 does not see if it only watches the website.",
    punchline: "Speed-to-lead that is truly omnichannel.",
    diagramLabel: "FB · IG · WA · DM → one queue",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["social", "sms", "crm", "calendar"],
    complianceIds: ["sms-consent", "human-handoff"],
    hireOrderLogical: 8,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Hub 03 covers web forms and chat. This hub plugs the unread FB/IG/WhatsApp/DM leak.",
    supplementsHubIds: ["hub-03"],
    supplementsWhy:
      "Extends Hub 03 beyond the website so first-touch SLA applies everywhere leads actually message you.",
  },
  {
    id: "hub-09",
    slug: "win-back-churn-rescue",
    number: "09",
    status: "coming-soon",
    operator: "The Retention Specialist",
    titleLead: "Win-Back /",
    titleAccent: "Churn Rescue",
    funnelStage: "reactivate",
    leakStat: "Soon",
    leakBody:
      "Cancelled and lapsed paying customers are a different list than dusty inquiry leads — and they need a different tone.",
    punchline: "Bring back customers who already trusted you once.",
    diagramLabel: "Lapsed customer → return offer",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["crm", "sms", "calendar"],
    complianceIds: ["sms-consent", "human-handoff"],
    hireOrderLogical: 9,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Hub 01 reactivates never-converted leads. Hub 09 targets cancelled or lapsed paying customers.",
    supplementsHubIds: ["hub-01"],
    supplementsWhy:
      "Different list, different offer, different compliance tone than cold database reactivation.",
  },
  {
    id: "hub-10",
    slug: "reputation-defense",
    number: "10",
    status: "coming-soon",
    operator: "The Review Responder",
    titleLead: "Reputation",
    titleAccent: "Defense",
    funnelStage: "reputation",
    leakStat: "Soon",
    leakBody:
      "Unanswered negative reviews and slow reply SLAs erode trust faster than new five-star asks can rebuild it.",
    punchline: "Reputation is not only an ask engine — defend the downside.",
    diagramLabel: "Negative review → reply SLA",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["reviews", "crm", "sms"],
    complianceIds: ["review-incentives", "human-handoff"],
    hireOrderLogical: 10,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Hub 02 asks for reviews and referrals. Hub 10 handles negatives, reply SLA, and escalation.",
    supplementsHubIds: ["hub-02"],
    supplementsWhy:
      "Protects the reputation graph Hub 02 builds — unanswered damage still costs you customers.",
  },
  {
    id: "hub-11",
    slug: "owner-daily-brief",
    number: "11",
    status: "coming-soon",
    operator: "The Ops Analyst",
    titleLead: "Owner",
    titleAccent: "Daily Brief",
    funnelStage: "insight",
    leakStat: "Soon",
    leakBody:
      "Owners cannot see which leak is bleeding today across hubs without a cross-hub score and morning brief.",
    punchline: "One morning brief. Every leak, ranked.",
    diagramLabel: "All hubs → one score",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["crm", "calendar", "phone", "reviews"],
    complianceIds: ["data-minimization"],
    hireOrderLogical: 11,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Without a cross-hub leak score, Operate IQ feels like disconnected tools. This is the OS layer.",
    supplementsHubIds: [
      "hub-01",
      "hub-02",
      "hub-03",
      "hub-04",
      "hub-05",
    ],
    supplementsWhy:
      "Meta-hub: scores and triages every live operator from one owner dashboard brain.",
  },
  {
    id: "hub-12",
    slug: "payment-collection-nudge",
    number: "12",
    status: "coming-soon",
    operator: "The Cash Collector",
    titleLead: "Payment /",
    titleAccent: "Collection Nudge",
    funnelStage: "reactivate",
    leakStat: "Soon",
    leakBody:
      "Unpaid invoices, failed cards, and overdue balances leak cash after the sale — without needing new ads.",
    punchline: "Recover revenue from relationships you already have.",
    diagramLabel: "Unpaid → nudge → paid",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["payments", "crm", "sms"],
    complianceIds: ["sms-consent", "human-handoff"],
    hireOrderLogical: 12,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Reactivation and win-back bring people in; unpaid invoices leak cash after the sale.",
    supplementsHubIds: ["hub-01", "hub-09"],
    supplementsWhy:
      "Monetizes existing relationships — complements lead reactivation and customer win-back.",
  },
  {
    id: "hub-13",
    slug: "staff-onboarding-gpt",
    number: "13",
    status: "coming-soon",
    operator: "The Culture Trainer",
    titleLead: "Staff Onboarding",
    titleAccent: "GPT",
    funnelStage: "convert",
    leakStat: "Soon",
    leakBody:
      "New hires touch leads before they know the script — inconsistent first impressions and turnover damage every hub upstream.",
    punchline: "Train tone and playbooks before they touch a lead.",
    diagramLabel: "New hire → script → floor",
    capabilities: [],
    kpis: [],
    productImprovements: [],
    verticalNotes: {},
    integrations: ["crm", "sms"],
    complianceIds: ["human-handoff", "data-minimization"],
    hireOrderLogical: 13,
    hireOrderFastRoi: null,
    comingSoonLeak:
      "Hub 05 coaches live conversations. Hub 13 ramps new hires on scripts and tone first.",
    supplementsHubIds: ["hub-05"],
    supplementsWhy:
      "Reduces turnover damage and inconsistent first impressions before Hub 05 scores live calls.",
  },
];

export const logicalHireOrder = hubs
  .filter((h) => h.status === "live")
  .sort((a, b) => a.hireOrderLogical - b.hireOrderLogical);

export const fastRoiHireOrder = hubs
  .filter((h) => h.status === "live" && h.hireOrderFastRoi != null)
  .sort((a, b) => (a.hireOrderFastRoi ?? 99) - (b.hireOrderFastRoi ?? 99));

export const liveHubs = hubs.filter((h) => h.status === "live");
export const comingSoonHubs = hubs.filter((h) => h.status === "coming-soon");

/** Recommended next three to flesh after core five */
export const recommendedNextHubs = ["hub-06", "hub-07", "hub-11"];

export function getHubBySlug(slug: string) {
  return hubs.find((h) => h.slug === slug);
}

export function getHubById(id: string) {
  return hubs.find((h) => h.id === id);
}

export function getIntegration(id: string) {
  return integrations.find((i) => i.id === id);
}

export function getCompliance(id: string) {
  return complianceRules.find((r) => r.id === id);
}

/** Hubs (usually add-ons) that supplement a given live hub */
export function getSupplementingHubs(hubId: string) {
  return hubs.filter((h) => h.supplementsHubIds?.includes(hubId));
}

export function formatSupplementLabel(hubIds: string[]) {
  return hubIds
    .map((id) => {
      const h = getHubById(id);
      return h ? `Hub ${h.number}` : id;
    })
    .join(" + ");
}

export function hubsByFunnel(stage: FunnelStage) {
  return hubs.filter((h) => h.funnelStage === stage);
}

export const sampleLeakScores: LeakScoreSample[] = [
  {
    hubId: "hub-04",
    score: 42,
    trend: "down",
    note: "Missed-call recovery weak after 6pm",
  },
  {
    hubId: "hub-03",
    score: 58,
    trend: "flat",
    note: "Lead ads not connected — website only",
  },
  {
    hubId: "hub-01",
    score: 71,
    trend: "up",
    note: "Pilot segment booking above baseline",
  },
  {
    hubId: "hub-02",
    score: 49,
    trend: "up",
    note: "Ask rate rising; reply SLA still slow",
  },
  {
    hubId: "hub-05",
    score: 63,
    trend: "flat",
    note: "Close axis is the coaching priority",
  },
];

export function overallLeakScore(scores: LeakScoreSample[] = sampleLeakScores) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
}
