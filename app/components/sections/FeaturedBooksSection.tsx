import Image from "next/image";
import Link from "next/link";

export type Book = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
};

function formatAuthor(raw: string | null) {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : raw;
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/buch/${book.id}`} className="block group">
      <div className="relative aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2 shadow-sm">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 1024px) 22vw, 160px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-3xl text-muted-foreground/30">B</span>
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-foreground leading-snug mb-0.5 line-clamp-2">
        {book.title}
      </p>
      {book.author && (
        <p className="text-xs text-muted-foreground">{formatAuthor(book.author)}</p>
      )}
    </Link>
  );
}

export default function FeaturedBooksSection({ books }: { books: Book[] }) {
  return (
    <section className="bg-stone-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-2">
              Aktuelle Empfehlungen
            </p>
            <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-foreground">
              Ausgewählte Bücher
            </h2>
          </div>
          <Link
            href="/themen"
            className="text-sm text-primary hover:underline underline-offset-4 shrink-0 ml-8"
          >
            Alle Themen →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </section>
  );
}
