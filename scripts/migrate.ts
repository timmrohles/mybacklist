import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

// Load .env.local without dotenv
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      process.env[line.slice(0, eq).trim()] ??= line.slice(eq + 1).trim();
    }
  }
} catch {}

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running migrations...");

  await sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false`;
  console.log("✓ books.is_featured");

  await sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS deleted_at timestamp`;
  console.log("✓ books.deleted_at");

  console.log("Done.");
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
