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

type Tag = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  color: string | null;
  category: string | null;
  tag_type: string | null;
  visible: boolean;
  display_order: number | null;
  deleted_at?: string | null;
};

const emptyForm = { name: "", slug: "", description: "", color: "", category: "", tag_type: "", visible: true };

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [trash, setTrash] = useState<Tag[]>([]);
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [loading, setLoading] = useState(false);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTags = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/tags");
    const data = await res.json();
    setTags(data.tags ?? []);
    setLoading(false);
  }, []);

  const fetchTrash = useCallback(async () => {
    const res = await fetch("/api/admin/tags?deleted=true");
    const data = await res.json();
    setTrash(data.tags ?? []);
  }, []);

  useEffect(() => { fetchTags(); }, [fetchTags]);
  useEffect(() => { if (tab === "trash") fetchTrash(); }, [tab, fetchTrash]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(tag: Tag) {
    setEditing(tag);
    setForm({
      name: tag.name,
      slug: tag.slug ?? "",
      description: tag.description ?? "",
      color: tag.color ?? "",
      category: tag.category ?? "",
      tag_type: tag.tag_type ?? "",
      visible: tag.visible,
    });
    setSlideOpen(true);
  }

  async function saveTag() {
    setSaving(true);
    const payload = { ...form };
    if (editing) {
      const res = await fetch("/api/admin/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...payload }),
      });
      const data = await res.json();
      if (data.tag) setTags((prev) => prev.map((t) => t.id === data.tag.id ? data.tag : t));
    } else {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.tag) setTags((prev) => [...prev, data.tag]);
    }
    setSaving(false);
    setSlideOpen(false);
  }

  async function copyTag(id: string) {
    const res = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy", id }),
    });
    const data = await res.json();
    if (data.tag) setTags((prev) => [...prev, data.tag]);
  }

  async function softDelete(id: string) {
    if (!confirm("Tag in Papierkorb verschieben?")) return;
    await fetch(`/api/admin/tags?id=${id}`, { method: "DELETE" });
    setTags((prev) => prev.filter((t) => t.id !== id));
  }

  async function restore(id: string) {
    const res = await fetch("/api/admin/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restore: true }),
    });
    const data = await res.json();
    if (data.tag) {
      setTrash((prev) => prev.filter((t) => t.id !== id));
      setTags((prev) => [...prev, data.tag]);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tags.findIndex((t) => t.id === active.id);
    const newIndex = tags.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tags, oldIndex, newIndex);
    setTags(reordered);
    await fetch("/api/admin/tags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((t) => t.id) }),
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
          <h1 style={s.h1}>Tags</h1>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <button onClick={openNew} style={s.btn}>+ Neuer Tag</button>
            <a href="/admin" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>← Dashboard</a>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }}>
          <button style={tabStyle(tab === "active")} onClick={() => setTab("active")}>Aktiv ({tags.length})</button>
          <button style={tabStyle(tab === "trash")} onClick={() => setTab("trash")}>Papierkorb</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>Lade…</p>
        ) : tab === "active" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tags.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: "32px" }}></th>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Slug</th>
                    <th style={s.th}>Kategorie</th>
                    <th style={s.th}>Typ</th>
                    <th style={s.th}>Sichtbar</th>
                    <th style={s.th}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <SortableRow key={tag.id} id={tag.id}>
                      <td style={s.td}>
                        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                          {tag.color && <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: tag.color, display: "inline-block", flexShrink: 0 }} />}
                          {tag.name}
                        </span>
                      </td>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: "var(--text-xs)" }}>{tag.slug ?? "–"}</td>
                      <td style={s.td}>{tag.category ?? "–"}</td>
                      <td style={s.td}>{tag.tag_type ?? "–"}</td>
                      <td style={s.td}>
                        <span style={{ fontSize: "var(--text-xs)", padding: "2px 8px", borderRadius: "999px", backgroundColor: tag.visible ? "#dcfce7" : "#f3f4f6", color: tag.visible ? "#166534" : "var(--color-text-subtle)" }}>
                          {tag.visible ? "Ja" : "Nein"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "var(--space-1)" }}>
                          <button onClick={() => openEdit(tag)} style={s.iconBtn} title="Bearbeiten">✏️</button>
                          <button onClick={() => copyTag(tag.id)} style={s.iconBtn} title="Kopieren">⧉</button>
                          <button onClick={() => softDelete(tag.id)} style={s.iconBtn} title="Löschen">🗑️</button>
                        </div>
                      </td>
                    </SortableRow>
                  ))}
                  {tags.length === 0 && (
                    <tr><td colSpan={7} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Keine Tags vorhanden.</td></tr>
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
              {trash.map((tag) => (
                <tr key={tag.id}>
                  <td style={s.td}>{tag.name}</td>
                  <td style={{ ...s.td, fontSize: "var(--text-xs)" }}>{tag.deleted_at ? new Date(tag.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                  <td style={s.td}><button onClick={() => restore(tag.id)} style={s.btnOutline}>Wiederherstellen</button></td>
                </tr>
              ))}
              {trash.length === 0 && (
                <tr><td colSpan={3} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Papierkorb ist leer.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Tag bearbeiten" : "Neuer Tag"}>
        <div>
          <label style={s.label}>Name *</label>
          <input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tag-Name" />

          <label style={s.label}>Slug</label>
          <input style={s.input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="tag-slug" />

          <label style={s.label}>Kategorie</label>
          <input style={s.input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="z.B. Thema" />

          <label style={s.label}>Typ</label>
          <input style={s.input} value={form.tag_type} onChange={(e) => setForm({ ...form, tag_type: e.target.value })} placeholder="z.B. genre" />

          <label style={s.label}>Farbe (Hex)</label>
          <input style={s.input} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#c8502a" />

          <label style={s.label}>Beschreibung</label>
          <textarea style={{ ...s.input, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kurze Beschreibung" />

          <label style={{ ...s.label, display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", marginBottom: "var(--space-4)" }}>
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
            Sichtbar
          </label>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button onClick={saveTag} disabled={saving || !form.name} style={{ ...s.btn, flex: 1, opacity: saving || !form.name ? 0.6 : 1 }}>
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button onClick={() => setSlideOpen(false)} style={{ ...s.btnOutline, flex: 1 }}>Abbrechen</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
