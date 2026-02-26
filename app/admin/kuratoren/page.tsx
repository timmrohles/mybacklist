"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SlideOver from "../../components/admin/SlideOver";
import SortableRow from "../../components/admin/SortableRow";

type Curator = {
  id: string;
  name: string;
  slug: string | null;
  bio: string | null;
  avatar_url: string | null;
  focus: string | null;
  website_url: string | null;
  instagram_url: string | null;
  podcast_url: string | null;
  visible: boolean;
  display_order: number | null;
  deleted_at?: string | null;
};

const emptyForm = {
  name: "", slug: "", bio: "", avatarUrl: "", focus: "",
  websiteUrl: "", instagramUrl: "", podcastUrl: "", visible: false,
};

export default function AdminKuratorenPage() {
  const [curators, setCurators] = useState<Curator[]>([]);
  const [trash, setTrash] = useState<Curator[]>([]);
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [loading, setLoading] = useState(false);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Curator | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchCurators = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/curators");
    const data = await res.json();
    setCurators(data.curators ?? []);
    setLoading(false);
  }, []);

  const fetchTrash = useCallback(async () => {
    const res = await fetch("/api/admin/curators?deleted=true");
    const data = await res.json();
    setTrash(data.curators ?? []);
  }, []);

  useEffect(() => { fetchCurators(); }, [fetchCurators]);
  useEffect(() => { if (tab === "trash") fetchTrash(); }, [tab, fetchTrash]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(c: Curator) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug ?? "",
      bio: c.bio ?? "",
      avatarUrl: c.avatar_url ?? "",
      focus: c.focus ?? "",
      websiteUrl: c.website_url ?? "",
      instagramUrl: c.instagram_url ?? "",
      podcastUrl: c.podcast_url ?? "",
      visible: c.visible,
    });
    setSlideOpen(true);
  }

  async function saveCurator() {
    setSaving(true);
    if (editing) {
      const res = await fetch("/api/admin/curators", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      const data = await res.json();
      if (data.curator) setCurators((prev) => prev.map((c) => c.id === data.curator.id ? data.curator : c));
    } else {
      const res = await fetch("/api/admin/curators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.curator) setCurators((prev) => [...prev, data.curator]);
    }
    setSaving(false);
    setSlideOpen(false);
  }

  async function toggleVisible(id: string, current: boolean) {
    const res = await fetch("/api/admin/curators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, toggle_visible: true, visible: !current }),
    });
    const data = await res.json();
    if (data.curator) setCurators((prev) => prev.map((c) => c.id === id ? data.curator : c));
  }

  async function softDelete(id: string) {
    if (!confirm("Kurator in Papierkorb verschieben?")) return;
    await fetch(`/api/admin/curators?id=${id}`, { method: "DELETE" });
    setCurators((prev) => prev.filter((c) => c.id !== id));
  }

  async function restore(id: string) {
    const res = await fetch("/api/admin/curators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restore: true }),
    });
    const data = await res.json();
    if (data.curator) {
      setTrash((prev) => prev.filter((c) => c.id !== id));
      setCurators((prev) => [...prev, data.curator]);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = curators.findIndex((c) => c.id === active.id);
    const newIndex = curators.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(curators, oldIndex, newIndex);
    setCurators(reordered);
    await fetch("/api/admin/curators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((c) => c.id) }),
    });
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", backgroundColor: "#f4f4f0", padding: "var(--space-8) var(--space-6)" },
    wrap: { maxWidth: "960px", margin: "0 auto" },
    h1: { fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "var(--color-text)", margin: 0 },
    btn: { padding: "var(--space-2) var(--space-4)", backgroundColor: "var(--color-text)", color: "var(--color-surface)", border: "none", borderRadius: "var(--radius)", fontSize: "var(--text-sm)", cursor: "pointer" },
    btnOutline: { padding: "var(--space-2) var(--space-4)", backgroundColor: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", fontSize: "var(--text-sm)", cursor: "pointer" },
    input: { width: "100%", padding: "var(--space-2) var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", fontSize: "var(--text-sm)", backgroundColor: "var(--color-surface)", color: "var(--color-text)", marginBottom: "var(--space-3)" },
    label: { display: "block", fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", marginBottom: "var(--space-1)", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
    table: { width: "100%", borderCollapse: "collapse" as const, backgroundColor: "var(--color-surface)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--color-border)" },
    th: { padding: "var(--space-3) var(--space-4)", textAlign: "left" as const, fontSize: "var(--text-xs)", color: "var(--color-text-subtle)", textTransform: "uppercase" as const, letterSpacing: "0.08em", borderBottom: "1px solid var(--color-border)" },
    td: { padding: "var(--space-3) var(--space-4)", fontSize: "var(--text-sm)", color: "var(--color-text-muted)", borderBottom: "1px solid var(--color-border-muted)" },
    iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "var(--space-1) var(--space-2)", fontSize: "var(--text-base)", color: "var(--color-text-subtle)", lineHeight: 1 },
  };
  function tabStyle(active: boolean): React.CSSProperties {
    return { padding: "var(--space-2) var(--space-4)", border: "none", borderBottom: active ? "2px solid var(--color-accent)" : "2px solid transparent", backgroundColor: "transparent", cursor: "pointer", fontSize: "var(--text-sm)", color: active ? "var(--color-accent)" : "var(--color-text-subtle)", fontWeight: active ? 600 : 400 };
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <h1 style={s.h1}>Kuratoren</h1>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <button onClick={openNew} style={s.btn}>+ Neuer Kurator</button>
            <a href="/admin" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>← Dashboard</a>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }}>
          <button style={tabStyle(tab === "active")} onClick={() => setTab("active")}>Aktiv ({curators.length})</button>
          <button style={tabStyle(tab === "trash")} onClick={() => setTab("trash")}>Papierkorb</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>Lade…</p>
        ) : tab === "active" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={curators.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: "32px" }}></th>
                    <th style={{ ...s.th, width: "44px" }}>Avatar</th>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Schwerpunkt</th>
                    <th style={s.th}>Sichtbar</th>
                    <th style={s.th}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {curators.map((c) => (
                    <SortableRow key={c.id} id={c.id}>
                      <td style={s.td}>
                        {c.avatar_url ? (
                          <img src={c.avatar_url} alt={c.name} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>
                            {c.name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td style={s.td}>{c.name}</td>
                      <td style={s.td}>{c.focus ?? "–"}</td>
                      <td style={s.td}>
                        <button
                          onClick={() => toggleVisible(c.id, c.visible)}
                          style={{ padding: "2px 10px", border: "1px solid var(--color-border)", borderRadius: "999px", fontSize: "var(--text-xs)", cursor: "pointer", backgroundColor: c.visible ? "#dcfce7" : "#f3f4f6", color: c.visible ? "#166534" : "var(--color-text-subtle)" }}
                        >
                          {c.visible ? "Sichtbar" : "Versteckt"}
                        </button>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "var(--space-1)" }}>
                          <button onClick={() => openEdit(c)} style={s.iconBtn} title="Bearbeiten">✏️</button>
                          <button onClick={() => softDelete(c.id)} style={s.iconBtn} title="Löschen">🗑️</button>
                        </div>
                      </td>
                    </SortableRow>
                  ))}
                  {curators.length === 0 && (
                    <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Keine Kuratoren vorhanden.</td></tr>
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Name</th>
                <th style={s.th}>Gelöscht am</th>
                <th style={s.th}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {trash.map((c) => (
                <tr key={c.id}>
                  <td style={s.td}>{c.name}</td>
                  <td style={{ ...s.td, fontSize: "var(--text-xs)" }}>{c.deleted_at ? new Date(c.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                  <td style={s.td}><button onClick={() => restore(c.id)} style={s.btnOutline}>Wiederherstellen</button></td>
                </tr>
              ))}
              {trash.length === 0 && (
                <tr><td colSpan={3} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Papierkorb ist leer.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Kurator bearbeiten" : "Neuer Kurator"}>
        <div>
          <label style={s.label}>Name *</label>
          <input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vollständiger Name" />

          <label style={s.label}>Slug</label>
          <input style={s.input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="kurator-slug" />

          <label style={s.label}>Schwerpunkt</label>
          <input style={s.input} value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} placeholder="z.B. Literatur, Sachbuch" />

          <label style={s.label}>Avatar-URL</label>
          <input style={s.input} value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://…/avatar.jpg" />

          <label style={s.label}>Bio</label>
          <textarea style={{ ...s.input, minHeight: "80px", resize: "vertical" }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Kurze Biografie" />

          <label style={s.label}>Website</label>
          <input style={s.input} value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://…" />

          <label style={s.label}>Instagram-URL</label>
          <input style={s.input} value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://instagram.com/…" />

          <label style={s.label}>Podcast-URL</label>
          <input style={s.input} value={form.podcastUrl} onChange={(e) => setForm({ ...form, podcastUrl: e.target.value })} placeholder="https://…" />

          <label style={{ ...s.label, display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", marginBottom: "var(--space-4)" }}>
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
            Sichtbar auf der Website
          </label>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button onClick={saveCurator} disabled={saving || !form.name} style={{ ...s.btn, flex: 1, opacity: saving || !form.name ? 0.6 : 1 }}>
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button onClick={() => setSlideOpen(false)} style={{ ...s.btnOutline, flex: 1 }}>Abbrechen</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
