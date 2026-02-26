import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/admin/tags?deleted=true
export async function GET(req: NextRequest) {
  const db = sql();
  const deleted = new URL(req.url).searchParams.get("deleted") === "true";

  if (deleted) {
    const tags = await db`
      SELECT id, name, slug, description, color, category, tag_type, visible, display_order, deleted_at
      FROM tags WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC
    `;
    return NextResponse.json({ tags });
  }

  const tags = await db`
    SELECT id, name, slug, description, color, category, tag_type, visible, display_order
    FROM tags WHERE deleted_at IS NULL ORDER BY display_order ASC NULLS LAST, name ASC
  `;
  return NextResponse.json({ tags });
}

// POST /api/admin/tags — create or copy
export async function POST(req: NextRequest) {
  const db = sql();
  const body = await req.json();

  if (body.action === "copy") {
    const [orig] = await db`SELECT * FROM tags WHERE id = ${body.id}`;
    if (!orig) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const newId = crypto.randomUUID();
    const [tag] = await db`
      INSERT INTO tags (id, name, slug, description, color, category, tag_type, visible)
      VALUES (
        ${newId},
        ${orig.name + " (Kopie)"},
        ${orig.slug ? orig.slug + "-kopie" : null},
        ${orig.description ?? null},
        ${orig.color ?? null},
        ${orig.category ?? null},
        ${orig.tag_type ?? null},
        false
      )
      RETURNING id, name, slug, description, color, category, tag_type, visible, display_order
    `;
    return NextResponse.json({ tag });
  }

  const { name, slug, description, color, category, tag_type, visible } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const id = crypto.randomUUID();
  const [tag] = await db`
    INSERT INTO tags (id, name, slug, description, color, category, tag_type, visible)
    VALUES (${id}, ${name}, ${slug ?? null}, ${description ?? null}, ${color ?? null}, ${category ?? null}, ${tag_type ?? null}, ${visible ?? false})
    RETURNING id, name, slug, description, color, category, tag_type, visible, display_order
  `;
  return NextResponse.json({ tag }, { status: 201 });
}

// PUT /api/admin/tags — update
export async function PUT(req: NextRequest) {
  const db = sql();
  const { id, name, slug, description, color, category, tag_type, visible } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [tag] = await db`
    UPDATE tags
    SET
      name        = COALESCE(${name ?? null}, name),
      slug        = ${slug ?? null},
      description = ${description ?? null},
      color       = ${color ?? null},
      category    = ${category ?? null},
      tag_type    = ${tag_type ?? null},
      visible     = ${visible ?? false}
    WHERE id = ${id}
    RETURNING id, name, slug, description, color, category, tag_type, visible, display_order
  `;
  if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ tag });
}

// PATCH /api/admin/tags — reorder or restore
export async function PATCH(req: NextRequest) {
  const db = sql();
  const body = await req.json();

  if (body.restore) {
    const [tag] = await db`
      UPDATE tags SET deleted_at = NULL WHERE id = ${body.id}
      RETURNING id, name, slug, description, color, category, tag_type, visible, display_order
    `;
    return NextResponse.json({ tag });
  }

  // Reorder: { ids: string[] }
  const { ids } = body as { ids: string[] };
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids required" }, { status: 400 });

  for (let i = 0; i < ids.length; i++) {
    await db`UPDATE tags SET display_order = ${i} WHERE id = ${ids[i]}`;
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/tags?id=
export async function DELETE(req: NextRequest) {
  const db = sql();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db`UPDATE tags SET deleted_at = NOW() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
