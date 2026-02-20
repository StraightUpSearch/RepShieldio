import { pgTable, text, serial, timestamp, boolean, varchar, jsonb, index, integer } from "drizzle-orm/pg-core";
import { sqliteTable, text as sqliteText, integer as sqliteInt } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Determine database type from environment
const isPostgres = !!process.env.DATABASE_URL;

// ============ PostgreSQL Table Definitions ============

const _pgSessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
}, (table) => [index("IDX_session_expire").on(table.expire)]);

const _pgUsers = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"),
  role: varchar("role").default("user").notNull(),
  accountBalance: varchar("account_balance").default("0.00"),
  creditsRemaining: integer("credits_remaining").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const _pgTickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => _pgUsers.id),
  type: varchar("type").notNull(),
  status: varchar("status").default("pending").notNull(),
  priority: varchar("priority").default("standard").notNull(),
  assignedTo: varchar("assigned_to"),
  title: text("title").notNull(),
  description: text("description"),
  redditUrl: text("reddit_url"),
  amount: varchar("amount"),
  progress: integer("progress").default(0),
  requestData: jsonb("request_data"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const _pgTransactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => _pgUsers.id),
  ticketId: integer("ticket_id").references(() => _pgTickets.id),
  type: varchar("type").notNull(),
  amount: varchar("amount").notNull(),
  description: text("description"),
  status: varchar("status").default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgPasswordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => _pgUsers.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgAuditRequests = pgTable("audit_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  website: text("website"),
  message: text("message"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgQuoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  redditUrl: text("reddit_url").notNull(),
  email: text("email").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgBrandScanTickets = pgTable("brand_scan_tickets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  brandName: text("brand_name").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgScanResults = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => _pgUsers.id),
  brandName: varchar("brand_name").notNull(),
  scanType: varchar("scan_type").notNull(),
  totalMentions: integer("total_mentions").default(0),
  riskLevel: varchar("risk_level"),
  riskScore: integer("risk_score").default(0),
  platformData: jsonb("platform_data"),
  processingTime: integer("processing_time"),
  scanId: varchar("scan_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgSubscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => _pgUsers.id),
  planId: varchar("plan_id").notNull(),
  status: varchar("status").default("active").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const _pgFunnelEvents = pgTable("funnel_events", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type").notNull(),
  userId: varchar("user_id"),
  sessionId: varchar("session_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

const _pgBlogPosts = pgTable("blog_posts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 60 }),
  metaDescription: varchar("meta_description", { length: 160 }),
  keywords: text("keywords"),
  featuredImage: varchar("featured_image"),
  author: varchar("author").notNull(),
  status: varchar("status", { enum: ["draft", "published", "archived"] }).default("draft"),
  category: varchar("category"),
  tags: text("tags").array(),
  readingTime: integer("reading_time"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const _pgBlogCategories = pgTable("blog_categories", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  metaTitle: varchar("meta_title", { length: 60 }),
  metaDescription: varchar("meta_description", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ SQLite Table Definitions ============

const _sqliteSessions = sqliteTable("sessions", {
  sid: sqliteText("sid").primaryKey(),
  sess: sqliteText("sess").notNull(),
  expire: sqliteInt("expire").notNull(),
});

const _sqliteUsers = sqliteTable("users", {
  id: sqliteText("id").primaryKey().notNull(),
  email: sqliteText("email").unique().notNull(),
  firstName: sqliteText("first_name"),
  lastName: sqliteText("last_name"),
  profileImageUrl: sqliteText("profile_image_url"),
  password: sqliteText("password"),
  role: sqliteText("role").default("user").notNull(),
  accountBalance: sqliteText("account_balance").default("0.00"),
  creditsRemaining: sqliteInt("credits_remaining").default(0),
  createdAt: sqliteInt("created_at"),
  updatedAt: sqliteInt("updated_at"),
});

const _sqliteTickets = sqliteTable("tickets", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  userId: sqliteText("user_id").notNull().references(() => _sqliteUsers.id),
  type: sqliteText("type").notNull(),
  status: sqliteText("status").default("pending").notNull(),
  priority: sqliteText("priority").default("standard").notNull(),
  assignedTo: sqliteText("assigned_to"),
  title: sqliteText("title").notNull(),
  description: sqliteText("description"),
  redditUrl: sqliteText("reddit_url"),
  amount: sqliteText("amount"),
  progress: sqliteInt("progress").default(0),
  requestData: sqliteText("request_data"),
  notes: sqliteText("notes"),
  createdAt: sqliteInt("created_at"),
  updatedAt: sqliteInt("updated_at"),
});

const _sqliteTransactions = sqliteTable("transactions", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  userId: sqliteText("user_id").notNull().references(() => _sqliteUsers.id),
  ticketId: sqliteInt("ticket_id").references(() => _sqliteTickets.id),
  type: sqliteText("type").notNull(),
  amount: sqliteText("amount").notNull(),
  description: sqliteText("description"),
  status: sqliteText("status").default("completed").notNull(),
  createdAt: sqliteInt("created_at"),
});

const _sqlitePasswordResetTokens = sqliteTable("password_reset_tokens", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  userId: sqliteText("user_id").notNull().references(() => _sqliteUsers.id),
  token: sqliteText("token").notNull().unique(),
  expiresAt: sqliteInt("expires_at").notNull(),
  used: sqliteInt("used").default(0),
  createdAt: sqliteInt("created_at"),
});

const _sqliteAuditRequests = sqliteTable("audit_requests", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  name: sqliteText("name").notNull(),
  email: sqliteText("email").notNull(),
  company: sqliteText("company").notNull(),
  website: sqliteText("website"),
  message: sqliteText("message"),
  processed: sqliteInt("processed").default(0),
  createdAt: sqliteInt("created_at"),
});

const _sqliteQuoteRequests = sqliteTable("quote_requests", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  redditUrl: sqliteText("reddit_url").notNull(),
  email: sqliteText("email").notNull(),
  processed: sqliteInt("processed").default(0),
  createdAt: sqliteInt("created_at"),
});

const _sqliteBrandScanTickets = sqliteTable("brand_scan_tickets", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  name: sqliteText("name").notNull(),
  email: sqliteText("email").notNull(),
  company: sqliteText("company").notNull(),
  brandName: sqliteText("brand_name").notNull(),
  processed: sqliteInt("processed").default(0),
  createdAt: sqliteInt("created_at"),
});

const _sqliteScanResults = sqliteTable("scan_results", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  userId: sqliteText("user_id").references(() => _sqliteUsers.id),
  brandName: sqliteText("brand_name").notNull(),
  scanType: sqliteText("scan_type").notNull(),
  totalMentions: sqliteInt("total_mentions").default(0),
  riskLevel: sqliteText("risk_level"),
  riskScore: sqliteInt("risk_score").default(0),
  platformData: sqliteText("platform_data"),
  processingTime: sqliteInt("processing_time"),
  scanId: sqliteText("scan_id").notNull(),
  createdAt: sqliteInt("created_at"),
});

const _sqliteSubscriptions = sqliteTable("subscriptions", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  userId: sqliteText("user_id").notNull().references(() => _sqliteUsers.id),
  planId: sqliteText("plan_id").notNull(),
  status: sqliteText("status").default("active").notNull(),
  stripeSubscriptionId: sqliteText("stripe_subscription_id"),
  stripeCustomerId: sqliteText("stripe_customer_id"),
  currentPeriodStart: sqliteInt("current_period_start"),
  currentPeriodEnd: sqliteInt("current_period_end"),
  cancelledAt: sqliteInt("cancelled_at"),
  createdAt: sqliteInt("created_at"),
  updatedAt: sqliteInt("updated_at"),
});

const _sqliteFunnelEvents = sqliteTable("funnel_events", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  eventType: sqliteText("event_type").notNull(),
  userId: sqliteText("user_id"),
  sessionId: sqliteText("session_id"),
  metadata: sqliteText("metadata"),
  createdAt: sqliteInt("created_at"),
});

const _sqliteBlogPosts = sqliteTable("blog_posts", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  title: sqliteText("title").notNull(),
  slug: sqliteText("slug").notNull().unique(),
  excerpt: sqliteText("excerpt"),
  content: sqliteText("content").notNull(),
  metaTitle: sqliteText("meta_title"),
  metaDescription: sqliteText("meta_description"),
  keywords: sqliteText("keywords"),
  featuredImage: sqliteText("featured_image"),
  author: sqliteText("author").notNull(),
  status: sqliteText("status").default("draft"),
  category: sqliteText("category"),
  tags: sqliteText("tags"),
  readingTime: sqliteInt("reading_time"),
  publishedAt: sqliteInt("published_at"),
  createdAt: sqliteInt("created_at"),
  updatedAt: sqliteInt("updated_at"),
});

const _sqliteBlogCategories = sqliteTable("blog_categories", {
  id: sqliteInt("id").primaryKey({ autoIncrement: true }),
  name: sqliteText("name").notNull(),
  slug: sqliteText("slug").notNull().unique(),
  description: sqliteText("description"),
  metaTitle: sqliteText("meta_title"),
  metaDescription: sqliteText("meta_description"),
  createdAt: sqliteInt("created_at"),
});

// ============ Exports (cast to PG types for consistent TypeScript) ============
// At runtime, Drizzle uses the actual table object; the type cast only affects TS compilation.

export const sessions = (isPostgres ? _pgSessions : _sqliteSessions) as typeof _pgSessions;
export const users = (isPostgres ? _pgUsers : _sqliteUsers) as typeof _pgUsers;
export const tickets = (isPostgres ? _pgTickets : _sqliteTickets) as typeof _pgTickets;
export const transactions = (isPostgres ? _pgTransactions : _sqliteTransactions) as typeof _pgTransactions;
export const passwordResetTokens = (isPostgres ? _pgPasswordResetTokens : _sqlitePasswordResetTokens) as typeof _pgPasswordResetTokens;
export const auditRequests = (isPostgres ? _pgAuditRequests : _sqliteAuditRequests) as typeof _pgAuditRequests;
export const quoteRequests = (isPostgres ? _pgQuoteRequests : _sqliteQuoteRequests) as typeof _pgQuoteRequests;
export const brandScanTickets = (isPostgres ? _pgBrandScanTickets : _sqliteBrandScanTickets) as typeof _pgBrandScanTickets;
export const scanResults = (isPostgres ? _pgScanResults : _sqliteScanResults) as typeof _pgScanResults;
export const subscriptions = (isPostgres ? _pgSubscriptions : _sqliteSubscriptions) as typeof _pgSubscriptions;
export const funnelEvents = (isPostgres ? _pgFunnelEvents : _sqliteFunnelEvents) as typeof _pgFunnelEvents;
export const blogPosts = (isPostgres ? _pgBlogPosts : _sqliteBlogPosts) as typeof _pgBlogPosts;
export const blogCategories = (isPostgres ? _pgBlogCategories : _sqliteBlogCategories) as typeof _pgBlogCategories;

// ============ Insert Schemas ============
// Cast through z.AnyZodObject to work around drizzle-zod .omit() type inference issue

const omit = (schema: ReturnType<typeof createInsertSchema>, keys: Record<string, true>) =>
  (schema as z.AnyZodObject).omit(keys);

export const insertAuditRequestSchema = omit(createInsertSchema(_pgAuditRequests), {
  id: true, processed: true, createdAt: true,
});

export const insertQuoteRequestSchema = omit(createInsertSchema(_pgQuoteRequests), {
  id: true, processed: true, createdAt: true,
});

export const insertBrandScanTicketSchema = omit(createInsertSchema(_pgBrandScanTickets), {
  id: true, processed: true, createdAt: true,
});

export const insertUserSchema = omit(createInsertSchema(_pgUsers), {
  createdAt: true, updatedAt: true,
});

export const insertTicketSchema = omit(createInsertSchema(_pgTickets), {
  id: true, createdAt: true, updatedAt: true,
});

export const insertBlogPostSchema = omit(createInsertSchema(_pgBlogPosts), {
  id: true, createdAt: true, updatedAt: true,
});

export const insertBlogCategorySchema = omit(createInsertSchema(_pgBlogCategories), {
  id: true, createdAt: true,
});

// ============ Type Exports ============
// Explicit insert types to work around Drizzle $inferInsert not resolving
// optional columns through the dual SQLite/PG cast pattern.

export interface InsertAuditRequest {
  name: string;
  email: string;
  company: string;
  id?: number;
  website?: string | null;
  message?: string | null;
  processed?: boolean | null;
  createdAt?: Date | null;
}
export type AuditRequest = typeof auditRequests.$inferSelect;

export interface InsertQuoteRequest {
  redditUrl: string;
  email: string;
  id?: number;
  processed?: boolean | null;
  createdAt?: Date | null;
}
export type QuoteRequest = typeof quoteRequests.$inferSelect;

export interface InsertBrandScanTicket {
  name: string;
  email: string;
  company: string;
  brandName: string;
  id?: number;
  processed?: boolean | null;
  createdAt?: Date | null;
}
export type BrandScanTicket = typeof brandScanTickets.$inferSelect;

export interface UpsertUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  password?: string | null;
  role?: string;
  accountBalance?: string | null;
  creditsRemaining?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
export type User = typeof users.$inferSelect;

export interface InsertTicket {
  userId: string;
  type: string;
  title: string;
  id?: number;
  status?: string;
  priority?: string;
  assignedTo?: string | null;
  description?: string | null;
  redditUrl?: string | null;
  amount?: string | null;
  progress?: number | null;
  requestData?: unknown | null;
  notes?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
export type Ticket = typeof tickets.$inferSelect;

export interface InsertBlogPost {
  title: string;
  slug: string;
  content: string;
  author: string;
  id?: number;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  featuredImage?: string | null;
  status?: "draft" | "published" | "archived" | null;
  category?: string | null;
  tags?: string[] | null;
  readingTime?: number | null;
  publishedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
export type BlogPost = typeof blogPosts.$inferSelect;

export interface InsertBlogCategory {
  name: string;
  slug: string;
  id?: number;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: Date | null;
}
export type BlogCategory = typeof blogCategories.$inferSelect;

// ============ Relations ============

export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets),
  transactions: many(transactions),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  ticket: one(tickets, {
    fields: [transactions.ticketId],
    references: [tickets.id],
  }),
}));
