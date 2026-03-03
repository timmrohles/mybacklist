"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SlideOver from "../../components/admin/SlideOver";

type Book = {
  id: string;
  title: string;
  author: string | null;
  isbn13: string | null;
  is_featured: boolean;
  cover_url: string | null;
  deleted_at?: string | null;
};

const emptyForm = { title: "", author: "", isbn13: "", publisher: "", coverUrl: "", description: "", year: "", price: "" };

const th = "px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-[0.08em] border-b border-border font-normal";
const td = "px-4 py-3 text-sm text-muted-foreground border-b border-border";

export default function AdminBuecherPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [trash, setTrash] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"active" | "trash">("active");

  const [slideOpen, setSlideOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchBooks = useCallback(async (q: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/books?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setBooks(data.books ?? []);
    setLoading(false);
  }, []);

  const fetchTrash = useCallback(async () => {
    const res = await fetch("/api/admin/books?deleted=true");
    const data = await res.json();
    setTrash(data.books ?? []);
  }, []);

  useEffect(() => { fetchBooks(""); }, [fetchBooks]);
  useEffect(() => { if (tab === "trash") fetchTrash(); }, [tab, fetchTrash]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setSlideOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setForm({
      title: book.title,
      author: book.author ?? "",
      isbn13: book.isbn13 ?? "",
      publisher: "",
      coverUrl: book.cover_url ?? "",
      description: "",
      year: "",
      price: "",
    });
    setSlideOpen(true);
  }

  async function saveBook() {
    setSaving(true);
    if (editing) {
      const res = await fetch("/api/admin/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
      const data = await res.json();
      if (data.book) setBooks((prev) => prev.map((b) => b.id === data.book.id ? data.book : b));
    } else {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.book) setBooks((prev) => [data.book, ...prev]);
    }
    setSaving(false);
    setSlideOpen(false);
  }

  async function copyBook(id: string) {
    const res = await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy", id }),
    });
    const data = await res.json();
    if (data.book) setBooks((prev) => [data.book, ...prev]);
  }

  async function softDelete(id: string) {
    if (!confirm("Buch in Papierkorb verschieben?")) return;
    await fetch(`/api/admin/books?id=${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  async function restore(id: string) {
    const res = await fetch("/api/admin/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, restore: true }),
    });
    const data = await res.json();
    if (data.book) {
      setTrash((prev) => prev.filter((b) => b.id !== id));
      setBooks((prev) => [data.book, ...prev]);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    setToggling(id);
    await fetch("/api/admin/books", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_featured: !current }),
    });
    setBooks((prev) => prev.map((b) => b.id === id ? { ...b, is_featured: !current } : b));
    setToggling(null);
  }

  return (
    <div className="min-h-screen bg-background py-8 px-6">
      <div className="max-w-[960px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-serif text-2xl text-foreground">Bücher</h1>
          <div className="flex gap-3 items-center">
            <Button size="sm" onClick={openNew}>+ Neues Buch</Button>
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
              {t === "active" ? "Aktiv" : "Papierkorb"}
            </button>
          ))}
        </div>

        {tab === "active" && (
          <form onSubmit={(e) => { e.preventDefault(); fetchBooks(search); }} className="flex gap-3 mb-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Titel, Autor oder ISBN suchen…"
              className="flex-1"
            />
            <Button type="submit" size="sm">Suchen</Button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : tab === "active" ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full border-collapse bg-card">
              <thead>
                <tr>
                  <th className={`${th} w-12`}>Cover</th>
                  <th className={th}>Titel</th>
                  <th className={th}>Autor</th>
                  <th className={th}>ISBN-13</th>
                  <th className={th}>Featured</th>
                  <th className={th}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id}>
                    <td className={td}>
                      {book.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-8 h-11 object-cover rounded-sm" />
                      ) : (
                        <div className="w-8 h-11 bg-border rounded-sm" />
                      )}
                    </td>
                    <td className={td}>
                      <a href={`/buch/${book.id}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                        {book.title}
                      </a>
                    </td>
                    <td className={td}>{book.author ?? "–"}</td>
                    <td className={`${td} font-mono text-xs`}>{book.isbn13 ?? "–"}</td>
                    <td className={td}>
                      <button
                        onClick={() => toggleFeatured(book.id, book.is_featured)}
                        disabled={toggling === book.id}
                        className={`px-3 py-0.5 border border-border rounded text-xs cursor-pointer transition-colors ${book.is_featured ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}
                      >
                        {toggling === book.id ? "…" : book.is_featured ? "★ Featured" : "☆ Setzen"}
                      </button>
                    </td>
                    <td className={td}>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(book)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Bearbeiten">✏️</button>
                        <button onClick={() => copyBook(book.id)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Kopieren">⧉</button>
                        <button onClick={() => softDelete(book.id)} className="bg-transparent border-none cursor-pointer px-2 py-1 text-muted-foreground hover:text-foreground transition-colors" title="Löschen">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr><td colSpan={6} className={`${td} text-center text-muted-foreground`}>Keine Bücher gefunden.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full border-collapse bg-card">
              <thead>
                <tr>
                  <th className={th}>Titel</th>
                  <th className={th}>Autor</th>
                  <th className={th}>Gelöscht am</th>
                  <th className={th}>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {trash.map((book) => (
                  <tr key={book.id}>
                    <td className={td}>{book.title}</td>
                    <td className={td}>{book.author ?? "–"}</td>
                    <td className={`${td} text-xs`}>{book.deleted_at ? new Date(book.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                    <td className={td}>
                      <Button variant="outline" size="sm" onClick={() => restore(book.id)}>Wiederherstellen</Button>
                    </td>
                  </tr>
                ))}
                {trash.length === 0 && (
                  <tr><td colSpan={4} className={`${td} text-center text-muted-foreground`}>Papierkorb ist leer.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Buch bearbeiten" : "Neues Buch"}>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Titel *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Buchtitel" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Autor</label>
            <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Autor" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">ISBN-13</label>
            <Input value={form.isbn13} onChange={(e) => setForm({ ...form, isbn13: e.target.value })} placeholder="978…" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Verlag</label>
            <Input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder="Verlagsname" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Cover-URL</label>
            <Input value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Jahr</label>
            <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Preis</label>
            <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="18.99" />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground uppercase tracking-[0.06em] mb-1">Beschreibung</label>
            <textarea
              className="w-full min-h-[100px] resize-y px-3 py-2 border border-input rounded-md text-sm bg-background text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Kurzbeschreibung…"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <Button onClick={saveBook} disabled={saving || !form.title} className="flex-1">
              {saving ? "Speichern…" : "Speichern"}
            </Button>
            <Button variant="outline" onClick={() => setSlideOpen(false)} className="flex-1">Abbrechen</Button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
