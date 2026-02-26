import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/admin/affiliates?deleted=true
export async function GET(req: NextRequest) {
  const db = sql();
  const deleted = new URL(req.url).searchParams.get("deleted") === "true";

  if (deleted) {
    const affiliates = await db`
      SELECT id, name, slug, link_template, logo_url, favicon_url, is_active, display_order, deleted_at
      FROM affiliates WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC
    `;
    return NextResponse.json({ affiliates });
  }

  const affiliates = await db`
    SELECT id, name, slug, link_template, logo_url, favicon_url, is_active, display_order
    FROM affiliates WHERE deleted_at IS NULL ORDER BY display_order ASC NULLS LAST, name ASC
  `;
  return NextResponse.json({ affiliates });
}

// POST /api/admin/affiliates — create
export async function POST(req: NextRequest) {
  const db = sql();
  const { name, slug, linkTemplate, logoUrl, faviconUrl, is_active } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const id = crypto.randomUUID();
  const [affiliate] = await db`
    INSERT INTO affiliates (id, name, slug, link_template, logo_url, favicon_url, is_active)
    VALUES (${id}, ${name}, ${slug ?? null}, ${linkTemplate ?? null}, ${logoUrl ?? null}, ${faviconUrl ?? null}, ${is_active ?? true})
    RETURNING id, name, slug, link_template, logo_url, favicon_url, is_active, display_order
  `;
  return NextResponse.json({ affiliate }, { status: 201 });
}

// PUT /api/admin/affiliates — update
export async function PUT(req: NextRequest) {
  const db = sql();
  const { id, name, slug, linkTemplate, logoUrl, faviconUrl, is_active } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [affiliate] = await db`
    UPDATE affiliates
    SET
      name          = COALESCE(${name ?? null}, name),
      slug          = ${slug ?? null},
      link_template = ${linkTemplate ?? null},
      logo_url      = ${logoUrl ?? null},
      favicon_url   = ${faviconUrl ?? null},
      is_active     = ${is_active ?? true}
    WHERE id = ${id}
    RETURNING id, name, slug, link_template, logo_url, favicon_url, is_active, display_order
  `;
  if (!affiliate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ affiliate });
}

// PATCH /api/admin/affiliates — reorder, toggle active, or restore
export async function PATCH(req: NextRequest) {
  const db = sql();
  const body = await req.json();

  if (body.restore) {
    const [affiliate] = await db`
      UPDATE affiliates SET deleted_at = NULL WHERE id = ${body.id}
      RETURNING id, name, slug, link_template, logo_url, favicon_url, is_active, display_order
    `;
    return NextResponse.json({ affiliate });
  }

  if (body.toggle_active) {
    const [affiliate] = await db`
      UPDATE affiliates SET is_active = ${body.is_active} WHERE id = ${body.id}
      RETURNING id, name, slug, link_template, logo_url, favicon_url, is_active, display_order
    `;
    return NextResponse.json({ affiliate });
  }

  // Reorder: { ids: string[] }
  const { ids } = body as { ids: string[] };
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids required" }, { status: 400 });

  for (let i = 0; i < ids.length; i++) {
    await db`UPDATE affiliates SET display_order = ${i} WHERE id = ${ids[i]}`;
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/affiliates?id=
export async function DELETE(req: NextRequest) {
  const db = sql();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db`UPDATE affiliates SET deleted_at = NOW() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
