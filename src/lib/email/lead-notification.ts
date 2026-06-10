import { getSupabaseServiceClient } from "@/lib/supabase/server";

type LeadNotification = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  projectLocation: string | null;
  projectType: string;
  timeline: string | null;
  budget: string | null;
  description: string | null;
};

async function getNotificationRecipients(): Promise<string[]> {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("notification_recipients")
    .select("email")
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (data && data.length > 0) {
    return (data as { email: string }[]).map((r) => r.email);
  }

  const envEmail = process.env.LEAD_NOTIFY_EMAIL?.trim();
  return envEmail ? [envEmail] : [];
}

export async function sendLeadNotification(lead: LeadNotification) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.LEAD_NOTIFY_FROM?.trim() ?? "Grandvista <noreply@grandvista-construction.com>";

  if (!apiKey) {
    return;
  }

  const recipients = await getNotificationRecipients();

  if (recipients.length === 0) {
    return;
  }

  await Promise.all(
    recipients.map((to) =>
      sendEmail(apiKey, {
        from,
        html: buildInternalLeadEmailHtml(lead),
        subject: `New Grandvista project inquiry: ${lead.projectType}`,
        text: buildInternalLeadEmailText(lead),
        to,
      }),
    ),
  );

  await sendEmail(apiKey, {
    from,
    html: buildCustomerConfirmationHtml(lead),
    subject: "Thank you for reaching out to Grandvista Construction",
    text: buildCustomerConfirmationText(lead),
    to: lead.email,
  });
}

async function sendEmail(
  apiKey: string,
  email: {
    from: string;
    html: string;
    subject: string;
    text: string;
    to: string;
  },
) {
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify(email),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    console.error("Lead email failed", await response.text());
  }
}

function buildInternalLeadEmailText(lead: LeadNotification) {
  return [
    "A new project inquiry was submitted through the Grandvista website.",
    "",
    `Name: ${lead.name}`,
    `Company: ${lead.company ?? "Not provided"}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone ?? "Not provided"}`,
    `Project type: ${lead.projectType}`,
    `Project location: ${lead.projectLocation ?? "Not provided"}`,
    `Timeline: ${lead.timeline ?? "Not provided"}`,
    `Budget: ${lead.budget ?? "Not provided"}`,
    "",
    "Description:",
    lead.description ?? "Not provided",
  ].join("\n");
}

function buildCustomerConfirmationText(lead: LeadNotification) {
  return [
    `Hi ${lead.name},`,
    "",
    "Thank you for reaching out to Grandvista Construction.",
    "",
    "This is an automated confirmation that your project inquiry has been received. Our team will review the information you shared and look into the project context, timeline, and next practical steps.",
    "",
    "If we need any additional details, someone from our team will follow up with you directly.",
    "",
    "Grandvista Construction Team",
    "America's Commercial Builder",
  ].join("\n");
}

function buildInternalLeadEmailHtml(lead: LeadNotification) {
  return emailShell({
    eyebrow: "New Project Inquiry",
    intro:
      "A new project inquiry was submitted through the Grandvista website. Review the project context and decide the next practical follow-up.",
    rows: [
      ["Name", lead.name],
      ["Company", lead.company ?? "Not provided"],
      ["Email", lead.email],
      ["Phone", lead.phone ?? "Not provided"],
      ["Project Type", lead.projectType],
      ["Project Location", lead.projectLocation ?? "Not provided"],
      ["Timeline", lead.timeline ?? "Not provided"],
      ["Budget", lead.budget ?? "Not provided"],
      ["Description", lead.description ?? "Not provided"],
    ],
    title: `New inquiry: ${lead.projectType}`,
  });
}

function buildCustomerConfirmationHtml(lead: LeadNotification) {
  return emailShell({
    eyebrow: "Project Inquiry Received",
    intro:
      "This is an automated confirmation that your project inquiry has been received. Our team will review the information you shared and look into the project context, timeline, and next practical steps.",
    rows: [
      ["Name", lead.name],
      ["Project Type", lead.projectType],
      ["Project Location", lead.projectLocation ?? "Not provided"],
      ["Timeline", lead.timeline ?? "Not provided"],
    ],
    title: `Thank you, ${lead.name}.`,
  });
}

function emailShell({
  eyebrow,
  intro,
  rows,
  title,
}: {
  eyebrow: string;
  intro: string;
  rows: [string, string][];
  title: string;
}) {
  const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://grandvista-construct.vercel.app";
  const logoUrl = `${siteUrl}/grandvista-logo.jpg`;

  return `
<!doctype html>
<html>
  <body style="margin:0;background:#f4f0ea;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f0ea;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #ded8cf;">
            <tr>
              <td style="padding:28px 32px 18px;border-top:6px solid #d90429;">
                <img src="${escapeHtml(logoUrl)}" alt="Grandvista Construction" width="104" style="display:block;margin-bottom:22px;border:0;" />
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:#d90429;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0;font-size:32px;line-height:1.08;font-weight:900;color:#111827;">${escapeHtml(title)}</h1>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#4b5563;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  ${rows
                    .map(
                      ([label, value]) => `
                    <tr>
                      <td style="padding:12px 0;border-top:1px solid #eee7df;width:34%;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:#00136f;">${escapeHtml(label)}</td>
                      <td style="padding:12px 0;border-top:1px solid #eee7df;font-size:15px;line-height:1.6;color:#111827;">${escapeHtml(value)}</td>
                    </tr>`,
                    )
                    .join("")}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;background:#111827;color:#ffffff;">
                <p style="margin:0;font-size:18px;font-weight:900;">Grandvista Construction Team</p>
                <p style="margin:6px 0 0;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#c9ced8;">America's Commercial Builder</p>
                <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#d9dee7;">Clear planning. Field coordination. Accountable commercial construction.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
