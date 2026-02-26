import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export default async function Home() {
  let books: any[] = [];
  let errorMsg = "";
  let dbUrl = "";

  try {
    dbUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + "..." : "NOT SET";
    const result = await db.execute(sql`SELECT id::text, title, author, cover_url FROM books LIMIT 12`);
    books = result.rows;
  } catch (error: any) {
    errorMsg = error.message || String(error);
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">The Backlist Club</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-6 text-sm font-mono">
        <p><strong>DB URL:</strong> {dbUrl}</p>
        <p><strong>Books found:</strong> {books.length}</p>
        {errorMsg && <p className="text-red-600 mt-2"><strong>Error:</strong> {errorMsg}</p>}
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {books.map((book: any) => (
            <div key={book.id} className="text-xs">
              <div className="aspect-[2/3] bg-gray-200 rounded mb-1">
                {book.cover_url && <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded" />}
              </div>
              <p className="font-medium line-clamp-2">{book.title}</p>
              <p className="text-gray-400">{book.author}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Keine Bücher gefunden.</p>
      )}
    </main>
  );
}
