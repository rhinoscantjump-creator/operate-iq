/**
 * Vercel serverless waitlist endpoint (api/waitlist.ts).
 * Uses Supabase REST when SUPABASE_URL + key are set; otherwise acknowledges.
 */

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "invalid_json" });
    }
  }
  body = body || {};

  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: "invalid_email" });
  }

  const payload = {
    email,
    business_name: body.businessName ? String(body.businessName).trim() : null,
    vertical: body.vertical || null,
    hub_interest: body.hubInterest || "hub-01",
    notes: body.notes ? String(body.notes).trim() : null,
    source: "marketing-site",
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/waitlist_leads`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        return res
          .status(502)
          .json({ ok: false, error: "supabase_insert_failed", detail: text });
      }
      const data = await response.json();
      return res.status(200).json({ ok: true, stored: "supabase", lead: data[0] || null });
    } catch (err) {
      return res.status(502).json({
        ok: false,
        error: "supabase_request_failed",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log("[waitlist]", payload);
  return res.status(200).json({
    ok: true,
    stored: "acknowledged",
    lead: { ...payload, id: `local_${Date.now()}` },
  });
};
