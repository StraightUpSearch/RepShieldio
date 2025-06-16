import { pgTable, text, serial, timestamp, boolean, varchar, jsonb, index, integer } from "drizzle-orm/pg-core";
import { sqliteTable, text as sqliteText, integer as sqliteInt } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Determine database type from environment
const isPostgres = !!process.env.DATABASE_URL;

// Session storage table for authentication
export const sessions = isPostgres 
  ? pgTable("sessions", {
      sid: varchar("sid").primaryKey(),
      sess: jsonb("sess").notNull(),
      expire: timestamp("expire").notNull(),
    }, (table) => [index("IDX_session_expire").on(table.expire)])
  : sqliteTable("sessions", {
      sid: sqliteText("sid").primaryKey(),
      sess: sqliteText("sess").notNull(), // Store JSON as text in SQLite
      expire: sqliteInt("expire").notNull(), // Store as unix timestamp
    });

// Users table for authentication and ticket management
export const users = isPostgres 
  ? pgTable("users", {
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
    })
  : sqliteTable("users", {
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

// Tickets table to track all customer requests
export const tickets = isPostgres 
  ? pgTable("tickets", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id),
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
    })
  : sqliteTable("tickets", {
      id: sqliteInt("id").primaryKey({ autoIncrement: true }),
      userId: sqliteText("user_id").notNull().references(() => users.id),
      type: sqliteText("type").notNull(),
      status: sqliteText("status").default("pending").notNull(),
      priority: sqliteText("priority").default("standard").notNull(),
      assignedTo: sqliteText("assigned_to"),
      title: sqliteText("title").notNull(),
      description: sqliteText("description"),
      redditUrl: sqliteText("reddit_url"),
      amount: sqliteText("amount"),
      progress: sqliteInt("progress").default(0),
      requestData: sqliteText("request_data"), // Store JSON as text in SQLite
      notes: sqliteText("notes"),
      createdAt: sqliteInt("created_at"),
      updatedAt: sqliteInt("updated_at"),
    });

// Transactions table for financial tracking
export const transactions = isPostgres 
  ? pgTable("transactions", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id),
      ticketId: integer("ticket_id").references(() => tickets.id),
      type: varchar("type").notNull(),
      amount: varchar("amount").notNull(),
      description: text("description"),
      // DEPRECATED: stripePaymentId removed for simplified workflow
      status: varchar("status").default("completed").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
    })
  : sqliteTable("transactions", {
      id: sqliteInt("id").primaryKey({ autoIncrement: true }),
      userId: sqliteText("user_id").notNull().references(() => users.id),
      ticketId: sqliteInt("ticket_id").references(() => tickets.id),
      type: sqliteText("type").notNull(),
      amount: sqliteText("amount").notNull(),
      description: sqliteText("description"),
      // DEPRECATED: stripePaymentId removed for simplified workflow
      status: sqliteText("status").default("completed").notNull(),
      createdAt: sqliteInt("created_at"),
    });

// Legacy tables - keeping for backwards compatibility
export const auditRequests = isPostgres 
  ? pgTable("audit_requests", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      company: text("company").notNull(),
      website: text("website"),
      message: text("message"),
      processed: boolean("processed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
    })
  : sqliteTable("audit_requests", {
      id: sqliteInt("id").primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      email: sqliteText("email").notNull(),
      company: sqliteText("company").notNull(),
      website: sqliteText("website"),
      message: sqliteText("message"),
      processed: sqliteInt("processed").default(0), // 0/1 for boolean in SQLite
      createdAt: sqliteInt("created_at"),
    });

export const quoteRequests = isPostgres 
  ? pgTable("quote_requests", {
      id: serial("id").primaryKey(),
      redditUrl: text("reddit_url").notNull(),
      email: text("email").notNull(),
      processed: boolean("processed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
    })
  : sqliteTable("quote_requests", {
      id: sqliteInt("id").primaryKey({ autoIncrement: true }),
      redditUrl: sqliteText("reddit_url").notNull(),
      email: sqliteText("email").notNull(),
      processed: sqliteInt("processed").default(0),
      createdAt: sqliteInt("created_at"),
    });

export const brandScanTickets = isPostgres 
  ? pgTable("brand_scan_tickets", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      company: text("company").notNull(),
      brandName: text("brand_name").notNull(),
      processed: boolean("processed").default(false),
      createdAt: timestamp("created_at").defaultNow(),
    })
  : sqliteTable("brand_scan_tickets", {
      id: sqliteInt("id").primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      email: sqliteText("email").notNull(),
      company: sqliteText("company").notNull(),
      brandName: sqliteText("brand_name").notNull(),
      processed: sqliteInt("processed").default(0),
      createdAt: sqliteInt("created_at"),
    });

export const insertAuditRequestSchema = createInsertSchema(auditRequests).omit({
  id: true,
  processed: true,
  createdAt: true,
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  processed: true,
  createdAt: true,
});

export const insertBrandScanTicketSchema = createInsertSchema(brandScanTickets).omit({
  id: true,
  processed: true,
  createdAt: true,
});

export type InsertAuditRequest = z.infer<typeof insertAuditRequestSchema>;
export type AuditRequest = typeof auditRequests.$inferSelect;

export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type QuoteRequest = typeof quoteRequests.$inferSelect;

export type InsertBrandScanTicket = z.infer<typeof insertBrandScanTicketSchema>;
export type BrandScanTicket = typeof brandScanTickets.$inferSelect;

// Relations
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

// New schemas for authentication and tickets
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// Blog CMS tables for content strategy
export const blogPosts = isPostgres 
  ? pgTable("blog_posts", {
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
    })
  : sqliteTable("blog_posts", {
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
      tags: sqliteText("tags"), // Store array as JSON text
      readingTime: sqliteInt("reading_time"),
      publishedAt: sqliteInt("published_at"),
      createdAt: sqliteInt("created_at"),
      updatedAt: sqliteInt("updated_at"),
    });

export const blogCategories = isPostgres 
  ? pgTable("blog_categories", {
      id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
      name: varchar("name", { length: 100 }).notNull(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      description: text("description"),
      metaTitle: varchar("meta_title", { length: 60 }),
      metaDescription: varchar("meta_description", { length: 160 }),
      createdAt: timestamp("created_at").defaultNow(),
    })
  : sqliteTable("blog_categories", {
      id: sqliteInt("id").primaryKey({ autoIncrement: true }),
      name: sqliteText("name").notNull(),
      slug: sqliteText("slug").notNull().unique(),
      description: sqliteText("description"),
      metaTitle: sqliteText("meta_title"),
      metaDescription: sqliteText("meta_description"),
      createdAt: sqliteInt("created_at"),
    });

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;
