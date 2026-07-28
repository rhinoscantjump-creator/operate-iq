import type { Contact, DormancySegment, VerticalPack } from "../types/index.js";

export interface CsvContactRow {
  external_id?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  last_activity_at?: string;
  status?: string; // never-booked | no-show | cancelled | lapsed | inquiry | customer
  sms_consent?: string | boolean;
  email_consent?: string | boolean;
  do_not_contact?: string | boolean;
}

function parseBool(value: string | boolean | undefined, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value == null || value === "") return fallback;
  const v = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "y"].includes(v);
}

function mapSegment(status?: string): DormancySegment {
  const s = (status ?? "").trim().toLowerCase();
  if (s === "never-booked" || s === "inquiry" || s === "lead") return "never-booked";
  if (s === "no-show" || s === "noshow") return "no-show";
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "lapsed" || s === "inactive" || s === "customer") return "lapsed";
  return "unknown";
}

/** Minimal CSV parser (no quoted-comma edge cases beyond double quotes). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]!).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });
    return row;
  });
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export function rowsFromCsv(text: string): CsvContactRow[] {
  return parseCsv(text).map((row) => ({
    external_id: row.external_id || row.id,
    full_name: row.full_name || row.name,
    phone: row.phone || row.mobile,
    email: row.email,
    last_activity_at: row.last_activity_at || row.last_seen,
    status: row.status || row.segment,
    sms_consent: row.sms_consent,
    email_consent: row.email_consent,
    do_not_contact: row.do_not_contact,
  }));
}

export function csvRowToContactInput(
  businessId: string,
  row: CsvContactRow,
): Omit<Contact, "id" | "createdAt" | "updatedAt"> {
  return {
    businessId,
    externalId: row.external_id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    lastActivityAt: row.last_activity_at,
    segment: mapSegment(row.status),
    smsConsent: parseBool(row.sms_consent, false),
    emailConsent: parseBool(row.email_consent, false),
    doNotContact: parseBool(row.do_not_contact, false),
    metadata: { importedFrom: "csv", rawStatus: row.status },
  };
}

export interface CrmAdapter {
  id: string;
  importContacts(businessId: string, payload: string): Promise<Contact[]>;
}

export function createCsvCrmAdapter(deps: {
  createContact: (input: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Contact;
}): CrmAdapter {
  return {
    id: "crm-csv",
    async importContacts(businessId, payload) {
      const rows = rowsFromCsv(payload);
      return rows.map((row) => deps.createContact(csvRowToContactInput(businessId, row)));
    },
  };
}

export const verticalOfferTemplates: Record<
  VerticalPack,
  Record<Exclude<DormancySegment, "unknown">, string>
> = {
  gym: {
    "never-booked":
      "Hey {{name}} — still holding a free intro week for you at {{business}}. Grab a spot: {{link}}",
    "no-show":
      "Hi {{name}}, we saved your intro. Come back this week — book here: {{link}}",
    cancelled:
      "{{name}}, life happens. Ready when you are — restart this week: {{link}}",
    lapsed:
      "Miss you at {{business}}, {{name}}. Come-back week is open: {{link}}",
  },
  clinic: {
    "never-booked":
      "Hi {{name}}, following up on your inquiry with {{business}}. Reply or book: {{link}}",
    "no-show":
      "Hi {{name}}, we can rebook your visit at a time that works: {{link}}",
    cancelled:
      "Hi {{name}}, happy to reschedule when you're ready: {{link}}",
    lapsed:
      "Hi {{name}}, it's been a while — schedule a follow-up with {{business}}: {{link}}",
  },
  "home-services": {
    "never-booked":
      "Hi {{name}} — still interested in that estimate from {{business}}? Book a slot: {{link}}",
    "no-show":
      "Hi {{name}}, we can rebook your visit: {{link}}",
    cancelled:
      "Hi {{name}}, want to reopen that project with {{business}}? {{link}}",
    lapsed:
      "Seasonal check-in from {{business}}, {{name}} — schedule service: {{link}}",
  },
  salon: {
    "never-booked":
      "Hi {{name}}, we can get you in this week at {{business}}: {{link}}",
    "no-show":
      "Hi {{name}}, your chair is open again — rebook: {{link}}",
    cancelled:
      "Hi {{name}}, ready to reschedule with your stylist? {{link}}",
    lapsed:
      "Miss you, {{name}}. Book your next visit at {{business}}: {{link}}",
  },
  general: {
    "never-booked":
      "Hi {{name}}, following up from {{business}}. We saved a spot for you: {{link}}",
    "no-show":
      "Hi {{name}}, want to rebook with {{business}}? {{link}}",
    cancelled:
      "Hi {{name}}, ready when you are — reschedule here: {{link}}",
    lapsed:
      "Hi {{name}}, special for past customers of {{business}}: {{link}}",
  },
};

export function renderOffer(input: {
  vertical: VerticalPack;
  segment: DormancySegment;
  name: string;
  businessName: string;
  link: string;
}): string {
  const segment = input.segment === "unknown" ? "lapsed" : input.segment;
  const template = verticalOfferTemplates[input.vertical][segment];
  return template
    .replaceAll("{{name}}", input.name || "there")
    .replaceAll("{{business}}", input.businessName)
    .replaceAll("{{link}}", input.link);
}
