import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function getFeaturedBooks() {
  try {
    const result = await db.execute(
      sql`SELECT id, title, author, cover_url, slug FROM books LIMIT 12`
    );
    return result.rows;
  } catch (error) {
    console.error("DB Error:", error);
    return [];
  }
}

export default async function Home() {
  const books = await getFeaturedBooks();

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">The Backlist Club</span>
          <nav className="text-sm text-gray-500 flex gap-6">
            <a href="/themen" className="hover:text-black transition-colors">Themen</a>
            <a href="/kurator" className="hover:text-black transition-colors">Kurator</a>
          </nav>
        </div>
      </header>

      <section className="px-6 py-16 max-w-6xl mx-auto">
        <p className="text-sm text-gray-400 uppercase tracking-widest mb-4">Persönliche Buchempfehlungen</p>
        <h2 className="text-4xl font-bold text-gray-900 mb-4 max-w-2xl leading-tight">
          Bücher die wirklich bleiben.
        </h2>
        <p className="text-lg text-gray-500 max-w-xl">
          Handverlesene Empfehlungen – keine Algorithmen, keine Bestsellerlisten.
          Nur Bücher die ich selbst gelesen und geliebt habe.
        </p>
      </section>

      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">
          Aktuelle Empfehlungen
        </h3>
        {books.length === 0 ? (
          <div>
            <p className="text-gray-400 text-sm">Noch keine Bücher vorhanden.</p>
            <p className="text-gray-300 text-xs mt-2">DB rows: {String(books.length)}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {books.map((book: any) => (
              <a key={book.id} href={`/buch/${book.slug || book.id}`} className="group">
                <div className="aspect-[2/3] bg-gray-100 rounded overflow-hidden mb-2">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p className="text-xs text-gray-400 text-center">{book.title}</p>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight mt-1">{book.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
