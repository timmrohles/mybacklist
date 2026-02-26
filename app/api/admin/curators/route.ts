import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

function sql() {
  return neon(process.env.DATABASE_URL!);
}

// GET /api/admin/curators?deleted=true
export async function GET(req: NextRequest) {
  const db = sql();
  const deleted = new URL(req.url).searchParams.get("deleted") === "true";

  if (deleted) {
    const curators = await db`
      SELECT id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible, display_order, deleted_at
      FROM curators WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC
    `;
    return NextResponse.json({ curators });
  }

  const curators = await db`
    SELECT id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible, display_order
    FROM curators WHERE deleted_at IS NULL ORDER BY display_order ASC NULLS LAST, name ASC
  `;
  return NextResponse.json({ curators });
}

// POST /api/admin/curators — create
export async function POST(req: NextRequest) {
  const db = sql();
  const { name, slug, bio, avatarUrl, focus, websiteUrl, instagramUrl, podcastUrl, visible } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const id = crypto.randomUUID();
  const [curator] = await db`
    INSERT INTO curators (id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible)
    VALUES (
      ${id}, ${name}, ${slug ?? null}, ${bio ?? null}, ${avatarUrl ?? null},
      ${focus ?? null}, ${websiteUrl ?? null}, ${instagramUrl ?? null}, ${podcastUrl ?? null},
      ${visible ?? false}
    )
    RETURNING id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible, display_order
  `;
  return NextResponse.json({ curator }, { status: 201 });
}

// PUT /api/admin/curators — update
export async function PUT(req: NextRequest) {
  const db = sql();
  const { id, name, slug, bio, avatarUrl, focus, websiteUrl, instagramUrl, podcastUrl, visible } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const [curator] = await db`
    UPDATE curators
    SET
      name          = COALESCE(${name ?? null}, name),
      slug          = ${slug ?? null},
      bio           = ${bio ?? null},
      avatar_url    = ${avatarUrl ?? null},
      focus         = ${focus ?? null},
      website_url   = ${websiteUrl ?? null},
      instagram_url = ${instagramUrl ?? null},
      podcast_url   = ${podcastUrl ?? null},
      visible       = ${visible ?? false}
    WHERE id = ${id}
    RETURNING id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible, display_order
  `;
  if (!curator) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ curator });
}

// PATCH /api/admin/curators — reorder, toggle visible, or restore
export async function PATCH(req: NextRequest) {
  const db = sql();
  const body = await req.json();

  if (body.restore) {
    const [curator] = await db`
      UPDATE curators SET deleted_at = NULL WHERE id = ${body.id}
      RETURNING id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible, display_order
    `;
    return NextResponse.json({ curator });
  }

  if (body.toggle_visible) {
    const [curator] = await db`
      UPDATE curators SET visible = ${body.visible} WHERE id = ${body.id}
      RETURNING id, name, slug, bio, avatar_url, focus, website_url, instagram_url, podcast_url, visible, display_order
    `;
    return NextResponse.json({ curator });
  }

  // Reorder: { ids: string[] }
  const { ids } = body as { ids: string[] };
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ids required" }, { status: 400 });

  for (let i = 0; i < ids.length; i++) {
    await db`UPDATE curators SET display_order = ${i} WHERE id = ${ids[i]}`;
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/curators?id=
export async function DELETE(req: NextRequest) {
  const db = sql();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db`UPDATE curators SET deleted_at = NOW() WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
