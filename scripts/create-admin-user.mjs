import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "node:crypto";

const args = new Map(
  process.argv.slice(2).flatMap((arg, index, allArgs) => {
    if (!arg.startsWith("--")) {
      return [];
    }

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    const value = inlineValue ?? allArgs[index + 1];
    return [[key, value]];
  }),
);

const role = args.get("role");
const usernameArg = args.get("username");

if (role !== "master" && role !== "web") {
  console.error("Usage: npm run admin:create -- --role=master|web --username=<username>");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const rl = createInterface({ input, output });

try {
  const username = (usernameArg ?? (await rl.question("Username: "))).trim().toLowerCase();
  const password = process.env.ADMIN_USER_PASSWORD ?? (await rl.question("Password: "));

  if (!username || !password) {
    console.error("Username and password are required.");
    process.exit(1);
  }

  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, passwordSalt, 64).toString("hex");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.from("admin_users").upsert(
    {
      active: true,
      password_hash: passwordHash,
      password_salt: passwordSalt,
      role,
      updated_at: new Date().toISOString(),
      username,
    },
    { onConflict: "username" },
  );

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Admin user "${username}" saved with role "${role}".`);
} finally {
  rl.close();
}
