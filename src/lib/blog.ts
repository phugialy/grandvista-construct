import { createHash } from "crypto";

export type BlogStatus = "draft" | "published" | "hidden";

export function slugifyBlogTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cleanBlogText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanSeoDescription(value: string) {
  return cleanBlogText(stripHtml(value)).slice(0, 156);
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ");
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function isBlogStatus(value: unknown): value is BlogStatus {
  return value === "draft" || value === "published" || value === "hidden";
}

export function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => cleanBlogText(tag))
    .filter(Boolean)
    .slice(0, 12);
}
