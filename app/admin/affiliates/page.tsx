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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const th = "px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-[0.08em] border-b border-border font-normal";
const td = "px-4 py-3 text-sm text-muted-foreground border-b border-border";

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

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-[960px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-serif text-2xl text-foreground">Affiliates</h1>
          <div className="flex gap-3 items-center">
            <Button size="sm" onClick={openNew}>+ Neuer Affiliate</Button>
            <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Dashboard</a>
          </div>
        </div>

        <div className="flex border-b border-border mb-4">
          {(["active", "trash"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors cursor-pointer bg-transparent ${tab === t ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground"}`}
            >
              {t === "active" ? `Aktiv (${affiliates.length})` : "Papierkorb"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : tab === "active" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={affiliates.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full border-collapse bg-card">
                  <thead>
                    <tr>
                      <th className={`${th} w-8`}></th>
                      <th className={`${th} w-12`}>Logo</th>
                      <th className={th}>Name</th>
                      <th className={th}>Slug</th>
                      <th className={th}>Aktiv</th>
                      <th className={th}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.map((a) => (
                      <SortableRow key={a.id} id={a.id}>
                        <td className={td}>
                          {a.favicon_url ? (
                            <img src={a.favicon_url} alt="" className="w-5 h-5 object-contain" />
                          ) : a.logo_url ? (
                            <img src={a.logo_url} alt="" className="w-12 h-5 object-contain" />
                          ) : (
                            <div className="w-5 h-5 bg-border rounded-sm" />
                          )}
                        </td>
                        <td className={td}>{a.name}</td>
                        <td className={`${td} font-mono text-xs`}>{a.slug ?? "–"}</td>
                        <td className={td}>
                          <button
                            onClick={() => toggleActive(a.id, a.is_active)}
                            className={`px-2.5 py-0.5 border border-border rounded-full text-xs cursor-pointer transition-colors ${a.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}
                          >
                            {a.is_active ? "Aktiv" : "Inaktiv"}
                          </button>
                        </td>
                        <td className={td}>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(a)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Bearbeiten">✏️</button>
                            <button onClick={() => softDelete(a.id)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Löschen">🗑️</button>
                          </div>
                        </td>
                      </SortableRow>
                    ))}
                    {affiliates.length === 0 && (
                      <tr><td colSpan={6} className={`${td} text-center text-muted-foreground`}>Keine Affiliates vorhanden.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full border-collapse bg-card">
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>Gelöscht am</th>
                  <th className={th}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {trash.map((a) => (
                  <tr key={a.id}>
                    <td className={td}>{a.name}</td>
                    <td className={`${td} text-xs`}>{a.deleted_at ? new Date(a.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                    <td className={td}>
                      <Button variant="outline" size="sm" onClick={() => restore(a.id)}>Wiederherstellen</Button>
                    </td>
                  </tr>
                ))}
                {trash.length === 0 && (
                  <tr><td colSpan={3} className={`${td} text-center text-muted-foreground`}>Papierkorb ist leer.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Affiliate bearbeiten" : "Neuer Affiliate"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Buchhändler Name" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="buchhaendler-slug" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Link-Template</label>
            <Input value={form.linkTemplate} onChange={(e) => setForm({ ...form, linkTemplate: e.target.value })} placeholder="https://example.com/book/{isbn13}" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Logo-URL</label>
            <Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://…/logo.svg" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Favicon-URL</label>
            <Input value={form.faviconUrl} onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })} placeholder="https://…/favicon.ico" />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-[0.06em] cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Aktiv
          </label>
          <div className="flex gap-3 mt-2">
            <Button onClick={saveAffiliate} disabled={saving || !form.name} className="flex-1">
              {saving ? "Speichern…" : "Speichern"}
            </Button>
            <Button variant="outline" onClick={() => setSlideOpen(false)} className="flex-1">Abbrechen</Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
