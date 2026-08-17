import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const AREA_OPTIONS = ["Plano", "Dallas", "Fort Worth", "Arlington", "Irving", "McKinney", "Frisco", "North Texas", "DFW"];

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function deriveArea(text) {
  const match = AREA_OPTIONS.filter((area) => area !== "DFW").find((area) => text.includes(area.toLowerCase()));
  return match ?? "DFW";
}

function deriveSignalType(text) {
  if (hasAny(text, ["manufacturing", "industrial", "logistics", "semiconductor", "data center", "factory"])) {
    return "Industrial Growth";
  }
  if (hasAny(text, ["headquarters", "hq", "corporate", "relocation", "campus"])) {
    return "Corporate Moves";
  }
  if (hasAny(text, ["retail", "restaurant", "entertainment", "experience", "lifestyle"])) {
    return "Retail / Experience";
  }
  if (hasAny(text, ["museum", "cultural", "municipal", "city hall", "festival", "stadium", "community"])) {
    return "Civic / Cultural";
  }
  if (hasAny(text, ["investment", "acquisition", "funds", "pace", "capital", "billion"])) {
    return "Capital Movement";
  }
  return "Market Development";
}

function deriveAssetClass(text) {
  if (hasAny(text, ["data center", "colocation"])) return "Data Center";
  if (hasAny(text, ["manufacturing", "industrial", "logistics", "factory"])) return "Industrial";
  if (hasAny(text, ["apartment", "multifamily", "residential"])) return "Multifamily";
  if (hasAny(text, ["retail", "restaurant", "entertainment", "lifestyle"])) return "Retail";
  if (hasAny(text, ["office", "headquarters", "hq", "campus"])) return "Office";
  if (hasAny(text, ["museum", "cultural", "festival", "stadium"])) return "Cultural";
  if (hasAny(text, ["municipal", "city hall", "emergency services"])) return "Civic";
  return "Commercial Market";
}

function deriveCommunitySignal({ title, excerpt, tags }) {
  const text = [title, excerpt, ...(tags ?? [])].filter(Boolean).join(" ").toLowerCase();
  return {
    area: deriveArea(text),
    assetClass: deriveAssetClass(text),
    signalType: deriveSignalType(text),
  };
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: posts, error } = await supabase
  .from("blog_posts")
  .select("id,title,excerpt,tags,signal_area,signal_type,signal_asset_class")
  .is("signal_area", null);

if (error) {
  console.error("Failed to load posts:", error.message);
  process.exit(1);
}

console.log(`Backfilling signal columns for ${posts.length} post(s)...`);

let updated = 0;
for (const post of posts) {
  const signal = deriveCommunitySignal(post);
  const { error: updateError } = await supabase
    .from("blog_posts")
    .update({
      signal_area: signal.area,
      signal_asset_class: signal.assetClass,
      signal_type: signal.signalType,
    })
    .eq("id", post.id);

  if (updateError) {
    console.error(`  Failed on "${post.title}":`, updateError.message);
    continue;
  }

  updated += 1;
}

console.log(`Done. Updated ${updated}/${posts.length} post(s).`);
