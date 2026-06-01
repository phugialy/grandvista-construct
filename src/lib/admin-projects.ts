export const projectTypes = [
  "Commercial Interior",
  "Restaurant / Food Service",
  "Retail",
  "Salon / Wellness",
  "Medical / Office",
  "Warehouse / Industrial",
  "Ground-Up Construction",
  "Tilt-Wall / Shell",
  "Building Improvement",
  "Other Commercial Project",
];

export const clientGoals = [
  "Open a new location",
  "Improve an existing space",
  "Prepare for operations",
  "Expand capacity",
  "Refresh customer experience",
  "Build from the ground up",
  "Other",
];

export const projectPressures = [
  "Opening date",
  "Budget control",
  "Inspection readiness",
  "Trade coordination",
  "Existing conditions",
  "Customer-facing finish",
  "Operational workflow",
  "Schedule coordination",
];

export const builtOutcomes = [
  "Ready for opening",
  "Improved customer experience",
  "Better staff flow",
  "More usable commercial space",
  "Updated business environment",
  "Improved operational function",
  "Ready for tenant/client use",
];

export const projectTags = [
  "Interior",
  "Exterior",
  "Before",
  "During",
  "After",
  "Finished Space",
  "Jobsite",
  "Commercial Interior",
  "Operational Facility",
  "Ground-Up",
];

export function slugifyProjectTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
