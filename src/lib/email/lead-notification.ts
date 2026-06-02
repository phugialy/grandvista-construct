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

export async function sendLeadNotification(lead: LeadNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  const from = process.env.LEAD_NOTIFY_FROM ?? "Grandvista Website <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from,
      to,
      subject: `New Grandvista project inquiry: ${lead.projectType}`,
      text: buildLeadEmailText(lead),
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    console.error("Lead notification email failed", await response.text());
  }
}

function buildLeadEmailText(lead: LeadNotification) {
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
