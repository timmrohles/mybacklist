/**
 * Migrates book cover images from bilder.buecher.de to Vercel Blob.
 *
 * Setup before running:
 *   1. Create a Blob store in Vercel dashboard → Storage
 *   2. Run: vercel env pull .env.local  (to get BLOB_READ_WRITE_TOKEN locally)
 *   3. Run: pnpm tsx scripts/migrate-covers.ts
 *
 * Options (via env vars):
 *   MIGRATE_LIMIT=500   how many books to process (default: 500)
 *   MIGRATE_DRY_RUN=1   only print what would happen, don't upload or update DB
 */

import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

// Load .env.local manually
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      process.env[line.slice(0, eq).trim()] ??= line.slice(eq + 1).trim();
    }
  }
} catch {}

const sql = neon(process.env.DATABASE_URL!);

const LIMIT = parseInt(process.env.MIGRATE_LIMIT ?? "500", 10);
const DRY_RUN = process.env.MIGRATE_DRY_RUN === "1";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function fetchCover(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA },
    });
    if (!res.ok) {
      console.warn(`  ⚠ HTTP ${res.status} for ${url}`);
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.warn(`  ⚠ Fetch failed: ${err}`);
    return null;
  }
}

async function main() {
  console.log(`\nCover migration — limit: ${LIMIT}${DRY_RUN ? " (DRY RUN)" : ""}\n`);

  // Fetch books with external covers not yet migrated to Blob
  const books = await sql`
    SELECT id::text, title, cover_url
    FROM books
    WHERE deleted_at IS NULL
      AND cover_url IS NOT NULL
      AND cover_url <> ''
      AND cover_url NOT LIKE '%vercel-storage.com%'
      AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')
    ORDER BY total_score DESC NULLS LAST
    LIMIT ${LIMIT}
  `;

  console.log(`Found ${books.length} books to migrate.\n`);

  let ok = 0;
  let fail = 0;

  for (const book of books) {
    const originalUrl: string = book.cover_url;
    // Derive a stable filename from the original URL path
    const urlPath = new URL(originalUrl).pathname; // e.g. /produkte/56/56299/56299461n.jpg
    const blobPath = `covers${urlPath}`; // covers/produkte/56/56299/56299461n.jpg

    process.stdout.write(`[${ok + fail + 1}/${books.length}] ${book.title.slice(0, 50).padEnd(50)} `);

    if (DRY_RUN) {
      console.log(`→ ${blobPath} (skipped)`);
      ok++;
      continue;
    }

    const buffer = await fetchCover(originalUrl);
    if (!buffer) {
      console.log("FAIL (fetch)");
      fail++;
      continue;
    }

    try {
      const blob = await put(blobPath, buffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      });

      await sql`UPDATE books SET cover_url = ${blob.url} WHERE id = ${book.id}`;
      console.log(`✓ ${blob.url.slice(0, 60)}…`);
      ok++;
    } catch (err) {
      console.log(`FAIL (blob): ${err}`);
      fail++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`\nDone: ${ok} migrated, ${fail} failed.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
