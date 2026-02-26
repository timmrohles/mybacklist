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

type Affiliate = {
  id: string;
  name: string;
  slug: string | null;
  link_template: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  is_active: boolean;
  display_order: number | null;
  deleted_at?: string | null;
};

const emptyForm = { name: "", slug: "", linkTemplate: "", logoUrl: "", faviconUrl: "", is_active: true };

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [trash, setTrash] = useState<Affiliate[]>([]);
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [loading, setLoading] = useState(false);

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Affiliate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/affiliates");
    const data = await res.json();
    setAffiliates(data.affiliates ?? []);
    setLoading(false);
  }, []);

  const fetchTrash = useCallback(async () => {
    const res = await fetch("/api/admin/affiliates?deleted=true");
    const data = await res.json();
    setTrash(data.affiliates ?? []);
  }, []);

  useEffect(() => { fetchAffiliates(); }, [fetchAffiliates]);
  useEffect(() => { if (tab === "trash") fetchTrash(); }, [tab, fetchTrash]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(a: Affiliate) {
    setEditing(a);
    setForm({
      name: a.name,
      slug: a.slug ?? "",
      linkTemplate: a.link_template ?? "",
      logoUrl: a.logo_url ?? "",
      faviconUrl: a.favicon_url ?? "",
      is_active: a.is_active,
    });
    setSlideOpen(true);
  }

  async function saveAffiliate() {
    setSaving(true);
    if (editing) {
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      const data = await res.json();
      if (data.affiliate) setAffiliates((prev) => prev.map((a) => a.id === data.affiliate.id ? data.affiliate : a));
    } else {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.affiliate) setAffiliates((prev) => [...prev, data.affiliate]);
    }
    setSaving(false);
    setSlideOpen(false);
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, toggle_active: true, is_active: !current }),
    });
    const data = await res.json();
    if (data.affiliate) setAffiliates((prev) => prev.map((a) => a.id === id ? data.affiliate : a));
  }

  async function softDelete(id: string) {
    if (!confirm("Affiliate in Papierkorb verschieben?")) return;
    await fetch(`/api/admin/affiliates?id=${id}`, { method: "DELETE" });
    setAffiliates((prev) => prev.filter((a) => a.id !== id));
  }

  async function restore(id: string) {
    const res = await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restore: true }),
    });
    const data = await res.json();
    if (data.affiliate) {
      setTrash((prev) => prev.filter((a) => a.id !== id));
      setAffiliates((prev) => [...prev, data.affiliate]);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = affiliates.findIndex((a) => a.id === active.id);
    const newIndex = affiliates.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(affiliates, oldIndex, newIndex);
    setAffiliates(reordered);
    await fetch("/api/admin/affiliates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((a) => a.id) }),
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
          <h1 style={s.h1}>Affiliates</h1>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <button onClick={openNew} style={s.btn}>+ Neuer Affiliate</button>
            <a href="/admin" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>← Dashboard</a>
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }}>
          <button style={tabStyle(tab === "active")} onClick={() => setTab("active")}>Aktiv ({affiliates.length})</button>
          <button style={tabStyle(tab === "trash")} onClick={() => setTab("trash")}>Papierkorb</button>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>Lade…</p>
        ) : tab === "active" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={affiliates.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={{ ...s.th, width: "32px" }}></th>
                    <th style={s.th}>Logo</th>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Slug</th>
                    <th style={s.th}>Aktiv</th>
                    <th style={s.th}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((a) => (
                    <SortableRow key={a.id} id={a.id}>
                      <td style={s.td}>
                        {a.favicon_url ? (
                          <img src={a.favicon_url} alt="" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                        ) : a.logo_url ? (
                          <img src={a.logo_url} alt="" style={{ width: "48px", height: "20px", objectFit: "contain" }} />
                        ) : (
                          <div style={{ width: "20px", height: "20px", backgroundColor: "var(--color-border)", borderRadius: "2px" }} />
                        )}
                      </td>
                      <td style={s.td}>{a.name}</td>
                      <td style={{ ...s.td, fontFamily: "monospace", fontSize: "var(--text-xs)" }}>{a.slug ?? "–"}</td>
                      <td style={s.td}>
                        <button
                          onClick={() => toggleActive(a.id, a.is_active)}
                          style={{ padding: "2px 10px", border: "1px solid var(--color-border)", borderRadius: "999px", fontSize: "var(--text-xs)", cursor: "pointer", backgroundColor: a.is_active ? "#dcfce7" : "#f3f4f6", color: a.is_active ? "#166534" : "var(--color-text-subtle)" }}
                        >
                          {a.is_active ? "Aktiv" : "Inaktiv"}
                        </button>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "var(--space-1)" }}>
                          <button onClick={() => openEdit(a)} style={s.iconBtn} title="Bearbeiten">✏️</button>
                          <button onClick={() => softDelete(a.id)} style={s.iconBtn} title="Löschen">🗑️</button>
                        </div>
                      </td>
                    </SortableRow>
                  ))}
                  {affiliates.length === 0 && (
                    <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Keine Affiliates vorhanden.</td></tr>
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
              {trash.map((a) => (
                <tr key={a.id}>
                  <td style={s.td}>{a.name}</td>
                  <td style={{ ...s.td, fontSize: "var(--text-xs)" }}>{a.deleted_at ? new Date(a.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                  <td style={s.td}><button onClick={() => restore(a.id)} style={s.btnOutline}>Wiederherstellen</button></td>
                </tr>
              ))}
              {trash.length === 0 && (
                <tr><td colSpan={3} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Papierkorb ist leer.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Affiliate bearbeiten" : "Neuer Affiliate"}>
        <div>
          <label style={s.label}>Name *</label>
          <input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Buchhändler Name" />

          <label style={s.label}>Slug</label>
          <input style={s.input} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="buchhaendler-slug" />

          <label style={s.label}>Link-Template</label>
          <input style={s.input} value={form.linkTemplate} onChange={(e) => setForm({ ...form, linkTemplate: e.target.value })} placeholder="https://example.com/book/{isbn13}" />

          <label style={s.label}>Logo-URL</label>
          <input style={s.input} value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://…/logo.svg" />

          <label style={s.label}>Favicon-URL</label>
          <input style={s.input} value={form.faviconUrl} onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })} placeholder="https://…/favicon.ico" />

          <label style={{ ...s.label, display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", marginBottom: "var(--space-4)" }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Aktiv
          </label>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <button onClick={saveAffiliate} disabled={saving || !form.name} style={{ ...s.btn, flex: 1, opacity: saving || !form.name ? 0.6 : 1 }}>
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button onClick={() => setSlideOpen(false)} style={{ ...s.btnOutline, flex: 1 }}>Abbrechen</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
