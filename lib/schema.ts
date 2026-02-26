import { pgTable, text, integer, boolean, timestamp, decimal, bigint } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author'),
  slug: text('slug'),
  publisher: text('publisher'),
  isbn: text('isbn'),
  isbn13: text('isbn13'),
  coverUrl: text('cover_url'),
  description: text('description'),
  year: text('year'),
  price: text('price'),
  availability: text('availability'),
  language: text('language'),
  pageCount: integer('page_count'),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  color: text('color'),
  category: text('category'),
});

export const bookTags = pgTable('book_tags', {
  bookId: text('book_id').references(() => books.id),
  tagId: text('tag_id').references(() => tags.id),
});

export const curators = pgTable('curators', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  visible: boolean('visible').default(false),
});

export const affiliates = pgTable('affiliates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  linkTemplate: text('link_template'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
});
