import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/admin/books?q=&deleted=true
export async function GET(req: NextRequest) {
  const db = sql();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const deleted = searchParams.get("deleted") === "true";

  if (deleted) {
    const books = await db`
      SELECT id, title, author, isbn13, is_featured, cover_url, deleted_at
      FROM books
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `;
    return NextResponse.json({ books });
  }

  if (q) {
    const books = await db`
      SELECT id, title, author, isbn13, is_featured, cover_url
      FROM books
      WHERE deleted_at IS NULL
        AND (title ILIKE ${"%" + q + "%"} OR author ILIKE ${"%" + q + "%"} OR isbn13 ILIKE ${"%" + q + "%"})
      ORDER BY title
      LIMIT 100
    `;
    return NextResponse.json({ books });
  }

  const books = await db`
    SELECT id, title, author, isbn13, is_featured, cover_url
    FROM books
    WHERE deleted_at IS NULL
    ORDER BY title
    LIMIT 200
  `;
  return NextResponse.json({ books });
}

// POST /api/admin/books — create or copy
export async function POST(req: NextRequest) {
  const db = sql();
  const body = await req.json();

  // Copy: { action: "copy", id: "..." }
  if (body.action === "copy") {
    const [orig] = await db`SELECT * FROM books WHERE id = ${body.id}`;
    if (!orig) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const newId = crypto.randomUUID();
    const [book] = await db`
      INSERT INTO books (id, title, author, slug, publisher, isbn, isbn13, cover_url, description, year, price, is_featured)
      VALUES (
        ${newId},
        ${orig.title + " (Kopie)"},
        ${orig.author ?? null},
        ${orig.slug ? orig.slug + "-kopie" : null},
        ${orig.publisher ?? null},
        ${orig.isbn ?? null},
        ${orig.isbn13 ?? null},
        ${orig.cover_url ?? null},
        ${orig.description ?? null},
        ${orig.year ?? null},
        ${orig.price ?? null},
        false
      )
      RETURNING id, title, author, isbn13, is_featured, cover_url
    `;
    return NextResponse.json({ book });
  }

  // Create: { title, author, isbn13, publisher, coverUrl, description, year, price }
  const { title, author, isbn13, publisher, coverUrl, description, year, price } = body;
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const id = crypto.randomUUID();
  const [book] = await db`
    INSERT INTO books (id, title, author, isbn13, publisher, cover_url, description, year, price, is_featured)
    VALUES (${id}, ${title}, ${author ?? null}, ${isbn13 ?? null}, ${publisher ?? null}, ${coverUrl ?? null}, ${description ?? null}, ${year ?? null}, ${price ?? null}, false)
    RETURNING id, title, author, isbn13, is_featured, cover_url
  `;
  return NextResponse.json({ book }, { status: 201 });
}

// PUT /api/admin/books — update
export async function PUT(req: NextRequest) {
  const db = sql();
  const { id, title, author, isbn13, publisher, coverUrl, description, year, price, isFeatured } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [book] = await db`
    UPDATE books
    SET
      title       = COALESCE(${title ?? null}, title),
      author      = ${author ?? null},
      isbn13      = ${isbn13 ?? null},
      publisher   = ${publisher ?? null},
      cover_url   = ${coverUrl ?? null},
      description = ${description ?? null},
      year        = ${year ?? null},
      price       = ${price ?? null},
      is_featured = COALESCE(${isFeatured ?? null}, is_featured),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING id, title, author, isbn13, is_featured, cover_url
  `;
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ book });
}

// PATCH /api/admin/books — toggle featured or restore
export async function PATCH(req: NextRequest) {
  const db = sql();
  const body = await req.json();

  // Restore from trash
  if (body.restore) {
    const [book] = await db`
      UPDATE books SET deleted_at = NULL WHERE id = ${body.id}
      RETURNING id, title, author, isbn13, is_featured, cover_url
    `;
    return NextResponse.json({ book });
  }

  // Toggle featured
  const [book] = await db`
    UPDATE books SET is_featured = ${body.is_featured} WHERE id = ${body.id}
    RETURNING id, title, author, isbn13, is_featured, cover_url
  `;
  return NextResponse.json({ book });
}

// DELETE /api/admin/books?id=&hard=true
export async function DELETE(req: NextRequest) {
  const db = sql();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const hard = searchParams.get("hard") === "true";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (hard) {
    await db`DELETE FROM books WHERE id = ${id}`;
  } else {
    await db`UPDATE books SET deleted_at = NOW() WHERE id = ${id}`;
  }
  return NextResponse.json({ ok: true });
}
