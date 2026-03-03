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

const th = "px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-[0.08em] border-b border-border font-normal";
const td = "px-4 py-3 text-sm text-muted-foreground border-b border-border";

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

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-[960px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-serif text-2xl text-foreground">Kuratoren</h1>
          <div className="flex gap-3 items-center">
            <Button size="sm" onClick={openNew}>+ Neuer Kurator</Button>
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
              {t === "active" ? `Aktiv (${curators.length})` : "Papierkorb"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : tab === "active" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={curators.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full border-collapse bg-card">
                  <thead>
                    <tr>
                      <th className={`${th} w-8`}></th>
                      <th className={`${th} w-11`}>Avatar</th>
                      <th className={th}>Name</th>
                      <th className={th}>Schwerpunkt</th>
                      <th className={th}>Sichtbar</th>
                      <th className={th}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curators.map((c) => (
                      <SortableRow key={c.id} id={c.id}>
                        <td className={td}>
                          {c.avatar_url ? (
                            <img src={c.avatar_url} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-sm text-muted-foreground">
                              {c.name.charAt(0)}
                            </div>
                          )}
                        </td>
                        <td className={td}>{c.name}</td>
                        <td className={td}>{c.focus ?? "–"}</td>
                        <td className={td}>
                          <button
                            onClick={() => toggleVisible(c.id, c.visible)}
                            className={`px-2.5 py-0.5 border border-border rounded-full text-xs cursor-pointer transition-colors ${c.visible ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}
                          >
                            {c.visible ? "Sichtbar" : "Versteckt"}
                          </button>
                        </td>
                        <td className={td}>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(c)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Bearbeiten">✏️</button>
                            <button onClick={() => softDelete(c.id)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Löschen">🗑️</button>
                          </div>
                        </td>
                      </SortableRow>
                    ))}
                    {curators.length === 0 && (
                      <tr><td colSpan={6} className={`${td} text-center text-muted-foreground`}>Keine Kuratoren vorhanden.</td></tr>
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
                {trash.map((c) => (
                  <tr key={c.id}>
                    <td className={td}>{c.name}</td>
                    <td className={`${td} text-xs`}>{c.deleted_at ? new Date(c.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                    <td className={td}>
                      <Button variant="outline" size="sm" onClick={() => restore(c.id)}>Wiederherstellen</Button>
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

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Kurator bearbeiten" : "Neuer Kurator"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vollständiger Name" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="kurator-slug" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Schwerpunkt</label>
            <Input value={form.focus} onChange={(e) => setForm({ ...form, focus: e.target.value })} placeholder="z.B. Literatur, Sachbuch" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Avatar-URL</label>
            <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://…/avatar.jpg" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Bio</label>
            <textarea
              className="w-full min-h-[80px] resize-y px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Kurze Biografie"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Website</label>
            <Input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Instagram-URL</label>
            <Input value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://instagram.com/…" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Podcast-URL</label>
            <Input value={form.podcastUrl} onChange={(e) => setForm({ ...form, podcastUrl: e.target.value })} placeholder="https://…" />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-[0.06em] cursor-pointer">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
            Sichtbar auf der Website
          </label>
          <div className="flex gap-3 mt-2">
            <Button onClick={saveCurator} disabled={saving || !form.name} className="flex-1">
              {saving ? "Speichern…" : "Speichern"}
            </Button>
            <Button variant="outline" onClick={() => setSlideOpen(false)} className="flex-1">Abbrechen</Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
