import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sitesTable = pgTable("sites", {
  id: text("id").primaryKey(),
  url: text("url").unique().notNull(),
  name: text("name"),
  userId: text("user_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analysesTable = pgTable("analyses", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull().references(() => sitesTable.id),
  url: text("url").notNull(),
  score: integer("score"),
  issues: integer("issues").default(0),
  issuesJson: text("issues_json").default("[]"),
  title: text("title"),
  description: text("description"),
  headingsJson: text("headings_json").default("[]"),
  linksCount: integer("links_count").default(0),
  imagesCount: integer("images_count").default(0),
  loadTimeMs: integer("load_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentTasksTable = pgTable("agent_tasks", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  agentType: text("agent_type").notNull(),
  status: text("status").default("pending"),
  title: text("title").notNull(),
  content: text("content").default(""),
  metadata: text("metadata").default("{}"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const contentItemsTable = pgTable("content_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentType: text("agent_type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").default("draft"),
  platform: text("platform"),
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});
