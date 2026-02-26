import { neon } from "@neondatabase/serverless";

async function getFeaturedBooks() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const books = await sql`SELECT id::text, title, author, cover_url FROM books WHERE deleted_at IS NULL AND isbn IS NOT NULL AND isbn != '' LIMIT 12`;
    return { books, error: null };
  } catch (error: any) {
    console.error("DB Error:", error.message);
    return { books: [], error: error.message as string };
  }
}

export default async function Home() {
  const { books, error } = await getFeaturedBooks();

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
        {error ? (
          <p className="text-red-500 text-sm font-mono">DB-Fehler: {error}</p>
        ) : books.length === 0 ? (
          <p className="text-gray-400 text-sm">Noch keine Bücher vorhanden.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {books.map((book: any) => (
              <a key={book.id} href={`/buch/${book.id}`} className="group">
                <div className="aspect-[2/3] bg-gray-100 rounded overflow-hidden mb-2">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p className="text-xs text-gray-400 text-center leading-tight">{book.title}</p>
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
