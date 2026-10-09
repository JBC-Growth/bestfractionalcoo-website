// Vercel serverless function: emails Fit Call requests through Resend.
// Required env var: RESEND_API_KEY
// Optional env vars: CONTACT_TO, CONTACT_CC, CONTACT_FROM

const TO = process.env.CONTACT_TO || "victoria@bestfractionalcoo.com";
const CC = process.env.CONTACT_CC || "jason@jbcgrowth.com";
const FROM = process.env.CONTACT_FROM || "Best Fractional COO Website <website@bestfractionalcoo.com>";

const FIELDS = [
  ["name", "Name"],
  ["firm", "Firm"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["role", "Role"],
  ["size", "Firm size"],
  ["revenue", "Annual revenue"],
  ["practice", "Practice area"],
  ["service", "Interested in"],
  ["message", "Message"],
];

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const clean = (v, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

  // Spam trap: real visitors never fill the hidden "website" field.
  if (clean(body.website)) return res.status(200).json({ ok: true });

  const data = {};
  for (const [key] of FIELDS) data[key] = clean(body[key]);

  if (!data.name || !data.firm || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
    return res.status(400).json({ error: "Name, firm and a valid email are required." });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Email is not configured." });
  }

  const rows = FIELDS.filter(([key]) => data[key]);
  const text = rows.map(([key, label]) => `${label}: ${data[key]}`).join("\n");
  const html =
    `<h2 style="font-family:Arial,sans-serif">New Fit Call request</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    rows
      .map(
        ([key, label]) =>
          `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#555"><b>${label}</b></td>` +
          `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(data[key])}</td></tr>`
      )
      .join("") +
    `</table>`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      cc: CC ? [CC] : undefined,
      reply_to: data.email,
      subject: `Fit Call request: ${data.firm} (${data.name})`,
      text,
      html,
    }),
  });

  if (!r.ok) {
    console.error("Resend error", r.status, await r.text());
    return res.status(502).json({ error: "Could not send email." });
  }

  return res.status(200).json({ ok: true });
};
