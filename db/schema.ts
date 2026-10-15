import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  keywords: text("keywords").notNull().default("[]"),
  coverUrl: text("cover_url").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  canonicalUrl: text("canonical_url").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const deliveries = sqliteTable("deliveries", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  articleId: text("article_id").notNull(),
  platformId: text("platform_id").notNull(),
  state: text("state").notNull(),
  url: text("url").notNull().default(""),
  error: text("error").notNull().default(""),
  views: integer("views").notNull().default(0),
  publishedAt: text("published_at"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("delivery_article_platform_unique").on(table.userId, table.articleId, table.platformId)]);

export const platformSettings = sqliteTable("platform_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  platformId: text("platform_id").notNull(),
  siteId: text("site_id").notNull().default(""),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("platform_settings_user_platform_unique").on(table.userId, table.platformId)]);
