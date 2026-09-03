export const tradeCategories = [
  "Materials Supplier",
  "Subcontractor",
  "Equipment Rental",
  "Design Partner",
  "Consultant",
  "Other",
];

export function slugifyPartnerName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
