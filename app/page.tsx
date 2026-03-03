import { sql } from "@/lib/db";
import HeroSection from "@/app/components/sections/HeroSection";
import FeaturedBooksSection, {
  type Book,
} from "@/app/components/sections/FeaturedBooksSection";
import CuratorsSection, {
  type Curator,
} from "@/app/components/sections/CuratorsSection";
import ThemesSection, { type Tag } from "@/app/components/sections/ThemesSection";
import HowItWorksSection from "@/app/components/sections/HowItWorksSection";
import NewsletterSection from "@/app/components/sections/NewsletterSection";

async function getData() {
  const [books, curators, tags] = await Promise.all([
    sql`
      SELECT id::text, title, author, cover_url
      FROM books
      WHERE deleted_at IS NULL
        AND (isbn13 LIKE '978%' OR isbn13 LIKE '979%')
        AND cover_url IS NOT NULL AND cover_url <> ''
      ORDER BY total_score DESC
      LIMIT 12
    `,
    sql`
      SELECT id, name, slug, bio, avatar_url, focus
      FROM curators
      WHERE deleted_at IS NULL AND visible = true
      ORDER BY display_order, name
      LIMIT 6
    `,
    sql`
      SELECT t.id, t.name, t.slug, t.color,
             COUNT(bt.book_id)::int AS book_count
      FROM tags t
      LEFT JOIN book_tags bt ON bt.tag_id = t.id AND bt.deleted_at IS NULL
      WHERE t.deleted_at IS NULL AND t.visible = true
        AND t.tag_type IN ('topic', 'genre')
      GROUP BY t.id
      ORDER BY book_count DESC, t.name
      LIMIT 20
    `,
  ]);

  return {
    books: books as Book[],
    curators: curators as Curator[],
    tags: tags as Tag[],
  };
}

export default async function Home() {
  const { books, curators, tags } = await getData();

  return (
    <>
      <HeroSection />
      <FeaturedBooksSection books={books} />
      <CuratorsSection curators={curators} />
      <ThemesSection tags={tags} />
      <HowItWorksSection />
      <NewsletterSection />
    </>
  );
}
