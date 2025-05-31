import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const auditRequests = pgTable("audit_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  website: text("website"),
  message: text("message"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditRequestSchema = createInsertSchema(auditRequests).omit({
  id: true,
  processed: true,
  createdAt: true,
});

export type InsertAuditRequest = z.infer<typeof insertAuditRequestSchema>;
export type AuditRequest = typeof auditRequests.$inferSelect;
