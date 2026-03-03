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

const th = "px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-[0.08em] border-b border-border font-normal";
const td = "px-4 py-3 text-sm text-muted-foreground border-b border-border";

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

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-[960px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-serif text-2xl text-foreground">Tags</h1>
          <div className="flex gap-3 items-center">
            <Button size="sm" onClick={openNew}>+ Neuer Tag</Button>
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
              {t === "active" ? `Aktiv (${tags.length})` : "Papierkorb"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : tab === "active" ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tags.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full border-collapse bg-card">
                  <thead>
                    <tr>
                      <th className={`${th} w-8`}></th>
                      <th className={th}>Name</th>
                      <th className={th}>Slug</th>
                      <th className={th}>Kategorie</th>
                      <th className={th}>Typ</th>
                      <th className={th}>Sichtbar</th>
                      <th className={th}>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tags.map((tag) => (
                      <SortableRow key={tag.id} id={tag.id}>
                        <td className={td}>
                          <span className="flex items-center gap-2">
                            {tag.color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />}
                            {tag.name}
                          </span>
                        </td>
                        <td className={`${td} font-mono text-xs`}>{tag.slug ?? "–"}</td>
                        <td className={td}>{tag.category ?? "–"}</td>
                        <td className={td}>{tag.tag_type ?? "–"}</td>
                        <td className={td}>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${tag.visible ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                            {tag.visible ? "Ja" : "Nein"}
                          </span>
                        </td>
                        <td className={td}>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(tag)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Bearbeiten">✏️</button>
                            <button onClick={() => copyTag(tag.id)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Kopieren">⧉</button>
                            <button onClick={() => softDelete(tag.id)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Löschen">🗑️</button>
                          </div>
                        </td>
                      </SortableRow>
                    ))}
                    {tags.length === 0 && (
                      <tr><td colSpan={7} className={`${td} text-center text-muted-foreground`}>Keine Tags vorhanden.</td></tr>
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
                {trash.map((tag) => (
                  <tr key={tag.id}>
                    <td className={td}>{tag.name}</td>
                    <td className={`${td} text-xs`}>{tag.deleted_at ? new Date(tag.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                    <td className={td}>
                      <Button variant="outline" size="sm" onClick={() => restore(tag.id)}>Wiederherstellen</Button>
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

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Tag bearbeiten" : "Neuer Tag"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Name *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tag-Name" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Slug</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="tag-slug" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Kategorie</label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="z.B. Thema" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Typ</label>
            <Input value={form.tag_type} onChange={(e) => setForm({ ...form, tag_type: e.target.value })} placeholder="z.B. genre" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Farbe (Hex)</label>
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#c8502a" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Beschreibung</label>
            <textarea
              className="w-full min-h-[80px] resize-y px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kurze Beschreibung"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-[0.06em] cursor-pointer">
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
            Sichtbar
          </label>
          <div className="flex gap-3 mt-2">
            <Button onClick={saveTag} disabled={saving || !form.name} className="flex-1">
              {saving ? "Speichern…" : "Speichern"}
            </Button>
            <Button variant="outline" onClick={() => setSlideOpen(false)} className="flex-1">Abbrechen</Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
