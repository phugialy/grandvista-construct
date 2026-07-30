export const siteUrl = "https://grandvista-construction.com";

export const companyName = "Grandvista Construction";

export const socialProfileLinks = [
  process.env.NEXT_PUBLIC_GRANDVISTA_FACEBOOK_URL ?? "https://www.facebook.com/grandvistagroup",
  process.env.NEXT_PUBLIC_GRANDVISTA_LINKEDIN_URL ?? "https://www.linkedin.com/company/grandvista-construction-group",
].filter((url): url is string => Boolean(url?.trim()));

export const serviceAreas = ["Plano", "Dallas", "Houston", "DFW", "Texas"];

export const companyDescription =
  "Grandvista Construction is a growth-minded commercial construction partner helping owners, operators, developers, and project teams move from business need to usable built environment through clear planning, field coordination, and accountable execution.";
