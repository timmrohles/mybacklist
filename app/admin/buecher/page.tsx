"use client";

import { useState, useEffect, useCallback } from "react";
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
      if (data.book) {
        setBooks((prev) => prev.map((b) => b.id === data.book.id ? data.book : b));
      }
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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
          <h1 style={s.h1}>Bücher</h1>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <button onClick={openNew} style={s.btn}>+ Neues Buch</button>
            <a href="/admin" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-subtle)" }}>← Dashboard</a>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-4)" }}>
          <button style={tabStyle(tab === "active")} onClick={() => setTab("active")}>Aktiv</button>
          <button style={tabStyle(tab === "trash")} onClick={() => setTab("trash")}>Papierkorb</button>
        </div>

        {/* Search (active only) */}
        {tab === "active" && (
          <form onSubmit={(e) => { e.preventDefault(); fetchBooks(search); }} style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Titel, Autor oder ISBN suchen…" style={{ ...s.input, marginBottom: 0, flex: 1 }} />
            <button type="submit" style={s.btn}>Suchen</button>
          </form>
        )}

        {loading ? (
          <p style={{ color: "var(--color-text-subtle)", fontSize: "var(--text-sm)" }}>Lade…</p>
        ) : tab === "active" ? (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: "48px" }}>Cover</th>
                <th style={s.th}>Titel</th>
                <th style={s.th}>Autor</th>
                <th style={s.th}>ISBN-13</th>
                <th style={s.th}>Featured</th>
                <th style={s.th}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td style={s.td}>
                    {book.cover_url ? (
                      <img src={book.cover_url} alt="" style={{ width: "32px", height: "44px", objectFit: "cover", borderRadius: "2px" }} />
                    ) : (
                      <div style={{ width: "32px", height: "44px", backgroundColor: "var(--color-border)", borderRadius: "2px" }} />
                    )}
                  </td>
                  <td style={s.td}>
                    <a href={`/buch/${book.id}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-text)", textDecoration: "none" }}>
                      {book.title}
                    </a>
                  </td>
                  <td style={s.td}>{book.author ?? "–"}</td>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: "var(--text-xs)" }}>{book.isbn13 ?? "–"}</td>
                  <td style={s.td}>
                    <button
                      onClick={() => toggleFeatured(book.id, book.is_featured)}
                      disabled={toggling === book.id}
                      style={{ padding: "var(--space-1) var(--space-3)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-xs)", cursor: "pointer", backgroundColor: book.is_featured ? "var(--color-accent)" : "var(--color-surface)", color: book.is_featured ? "#fff" : "var(--color-text-muted)", transition: "all 0.15s" }}
                    >
                      {toggling === book.id ? "…" : book.is_featured ? "★ Featured" : "☆ Setzen"}
                    </button>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: "var(--space-1)" }}>
                      <button onClick={() => openEdit(book)} style={s.iconBtn} title="Bearbeiten">✏️</button>
                      <button onClick={() => copyBook(book.id)} style={s.iconBtn} title="Kopieren">⧉</button>
                      <button onClick={() => softDelete(book.id)} style={s.iconBtn} title="Löschen">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={6} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Keine Bücher gefunden.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Titel</th>
                <th style={s.th}>Autor</th>
                <th style={s.th}>Gelöscht am</th>
                <th style={s.th}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {trash.map((book) => (
                <tr key={book.id}>
                  <td style={s.td}>{book.title}</td>
                  <td style={s.td}>{book.author ?? "–"}</td>
                  <td style={{ ...s.td, fontSize: "var(--text-xs)" }}>{book.deleted_at ? new Date(book.deleted_at).toLocaleDateString("de-DE") : "–"}</td>
                  <td style={s.td}>
                    <button onClick={() => restore(book.id)} style={s.btnOutline}>Wiederherstellen</button>
                  </td>
                </tr>
              ))}
              {trash.length === 0 && (
                <tr><td colSpan={4} style={{ ...s.td, textAlign: "center", color: "var(--color-text-subtle)" }}>Papierkorb ist leer.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SlideOver */}
      <SlideOver open={slideOpen} onClose={() => setSlideOpen(false)} title={editing ? "Buch bearbeiten" : "Neues Buch"}>
        <div>
          <label style={s.label}>Titel *</label>
          <input style={s.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Buchtitel" />

          <label style={s.label}>Autor</label>
          <input style={s.input} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Autor" />

          <label style={s.label}>ISBN-13</label>
          <input style={s.input} value={form.isbn13} onChange={(e) => setForm({ ...form, isbn13: e.target.value })} placeholder="978…" />

          <label style={s.label}>Verlag</label>
          <input style={s.input} value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder="Verlagsname" />

          <label style={s.label}>Cover-URL</label>
          <input style={s.input} value={form.coverUrl} onChange={(e) => setForm({ ...form, coverUrl: e.target.value })} placeholder="https://…" />

          <label style={s.label}>Jahr</label>
          <input style={s.input} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />

          <label style={s.label}>Preis</label>
          <input style={s.input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="18.99" />

          <label style={s.label}>Beschreibung</label>
          <textarea
            style={{ ...s.input, minHeight: "100px", resize: "vertical" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Kurzbeschreibung…"
          />

          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
            <button onClick={saveBook} disabled={saving || !form.title} style={{ ...s.btn, flex: 1, opacity: saving || !form.title ? 0.6 : 1 }}>
              {saving ? "Speichern…" : "Speichern"}
            </button>
            <button onClick={() => setSlideOpen(false)} style={{ ...s.btnOutline, flex: 1 }}>Abbrechen</button>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
