import { pgTable, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const activities = pgTable('activities', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const activityImages = pgTable('activity_images', {
  id: varchar('id', { length: 255 }).primaryKey(),
  activityId: varchar('activity_id', { length: 255 }).references(() => activities.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const achievements = pgTable('achievements', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: text('title').notNull(),
  event: text('event').notNull(),
  description: text('description').notNull(),
  level: text('level').notNull(),
  year: integer('year').notNull(),
  winner: text('winner').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const organizationMembers = pgTable('organization_members', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  category: text('category').notNull(),
  gender: text('gender').notNull(),
  photoUrl: text('photo_url'),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  siteName: text('site_name').notNull(),
  schoolName: text('school_name').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  logoUrl: text('logo_url'),
  instagram: text('instagram'),
  youtube: text('youtube'),
  contact: text('contact'),
});
