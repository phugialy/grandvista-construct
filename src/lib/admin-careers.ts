export const departments = [
  "Field Operations",
  "Estimating",
  "Safety",
  "Office & Admin",
  "Business Development",
];

export const employmentTypes = ["Full-time", "Part-time", "Contract"];

export const jobPostingStatuses = ["draft", "published", "closed"] as const;
export type JobPostingStatus = (typeof jobPostingStatuses)[number];

export function isJobPostingStatus(value: unknown): value is JobPostingStatus {
  return typeof value === "string" && (jobPostingStatuses as readonly string[]).includes(value);
}

export function slugifyJobTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
