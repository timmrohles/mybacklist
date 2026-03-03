/**
 * Migrates book cover images to Vercel Blob.
 *
 * Sources (in order of priority):
 *   1. Open Library Covers API  (https://covers.openlibrary.org/b/isbn/{isbn13}-L.jpg)
 *   2. Google Books API          (thumbnail from volumeInfo.imageLinks)
 *
 * Why not bilder.buecher.de?
 *   Cloudflare bot protection blocks all server-side fetches — even with a
 *   browser User-Agent. A real browser with JS execution would be required.
 *
 * Setup:
 *   1. Create a Blob store in Vercel dashboard → Storage, connect to project
 *   2. vercel env pull .env.local  (to get BLOB_READ_WRITE_TOKEN)
 *   3. pnpm tsx scripts/migrate-covers.ts
 *
 * Options (env vars):
 *   MIGRATE_LIMIT=500   books to process (default: 500)
 *   MIGRATE_DRY_RUN=1   print only, no uploads or DB updates
 */

import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

// Load .env.local
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
const MIN_IMAGE_BYTES = 2000; // anything smaller is likely a placeholder

async function fetchOpenLibrary(isbn13: string): Promise<Buffer | null> {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    // Open Library returns a tiny 1x1 gif when no cover is found
    if (buf.length < MIN_IMAGE_BYTES) return null;
    return buf;
  } catch {
    return null;
  }
}

async function fetchGoogleBooks(isbn13: string): Promise<Buffer | null> {
  try {
    const key = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : "";
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn13}&fields=items/volumeInfo/imageLinks&maxResults=1${key}`;
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const json = await res.json();
    const links = json?.items?.[0]?.volumeInfo?.imageLinks;
    if (!links) return null;
    // Prefer larger sizes
    const imgUrl: string =
      (links.large ?? links.medium ?? links.thumbnail ?? "").replace("http://", "https://").replace("&edge=curl", "").replace("zoom=1", "zoom=3");
    if (!imgUrl) return null;
    const imgRes = await fetch(imgUrl);
    if (!imgRes.ok) return null;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.length < MIN_IMAGE_BYTES) return null;
    return buf;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`\nCover migration — limit: ${LIMIT}${DRY_RUN ? " (DRY RUN)" : ""}\n`);

  const books = await sql`
    SELECT id::text, title, isbn13, cover_url
    FROM books
    WHERE deleted_at IS NULL
      AND isbn13 IS NOT NULL AND isbn13 <> ''
      AND cover_url IS NOT NULL AND cover_url <> ''
      AND cover_url NOT LIKE '%vercel-storage.com%'
      AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')
    ORDER BY total_score DESC NULLS LAST
    LIMIT ${LIMIT}
  `;

  console.log(`Found ${books.length} books to migrate.\n`);

  let ok = 0;
  let fail = 0;

  for (const book of books) {
    const isbn = book.isbn13 as string;
    const label = (book.title as string).slice(0, 48).padEnd(48);
    process.stdout.write(`[${ok + fail + 1}/${books.length}] ${label} `);

    if (DRY_RUN) {
      console.log(`→ covers/${isbn}.jpg (skipped)`);
      ok++;
      continue;
    }

    // Try sources in order
    let buffer: Buffer | null = null;
    let source = "";

    buffer = await fetchOpenLibrary(isbn);
    if (buffer) { source = "OpenLib"; }

    if (!buffer) {
      buffer = await fetchGoogleBooks(isbn);
      if (buffer) { source = "Google "; }
    }

    if (!buffer) {
      console.log("FAIL (no source)");
      fail++;
      continue;
    }

    try {
      const blob = await put(`covers/${isbn}.jpg`, buffer, {
        access: "public",
        contentType: "image/jpeg",
        addRandomSuffix: false,
      });
      await sql`UPDATE books SET cover_url = ${blob.url} WHERE id = ${book.id}`;
      console.log(`✓ [${source}] ${blob.url.slice(0, 55)}…`);
      ok++;
    } catch (err) {
      console.log(`FAIL (blob): ${err}`);
      fail++;
    }

    await new Promise((r) => setTimeout(r, 80));
  }

  console.log(`\nDone: ${ok} migrated, ${fail} failed.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
