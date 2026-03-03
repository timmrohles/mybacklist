import { pgTable, text, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core';

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
  isIndie: boolean('is_indie').default(false),
  totalScore: integer('total_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const tags = pgTable('tags', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  description: text('description'),
  tagType: text('tag_type'),
  color: text('color'),
  visible: boolean('visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const bookTags = pgTable('book_tags', {
  bookId: integer('book_id'),
  tagId: integer('tag_id'),
  origin: text('origin'),
  deletedAt: timestamp('deleted_at'),
});

export const curators = pgTable('curators', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  focus: text('focus'),
  websiteUrl: text('website_url'),
  instagramUrl: text('instagram_url'),
  podcastUrl: text('podcast_url'),
  visible: boolean('visible').default(false),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const curations = pgTable('curations', {
  id: integer('id').primaryKey(),
  curatorId: integer('curator_id'),
  title: text('title').notNull(),
  rationale: text('rationale'),
  status: text('status').default('draft'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const curationBooks = pgTable('curation_books', {
  id: integer('id').primaryKey(),
  curationId: integer('curation_id'),
  bookId: integer('book_id'),
  sortOrder: integer('sort_order').default(0),
  deletedAt: timestamp('deleted_at'),
});

export const affiliates = pgTable('affiliates', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug'),
  linkTemplate: text('link_template'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order').default(0),
  deletedAt: timestamp('deleted_at'),
});
