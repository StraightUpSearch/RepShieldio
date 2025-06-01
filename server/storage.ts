import { 
  users,
  tickets,
  auditRequests, 
  quoteRequests,
  brandScanTickets,
  type User,
  type UpsertUser,
  type Ticket,
  type InsertTicket,
  type AuditRequest, 
  type InsertAuditRequest,
  type QuoteRequest,
  type InsertQuoteRequest,
  type BrandScanTicket,
  type InsertBrandScanTicket
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations for authentication
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTickets(): Promise<Ticket[]>;
  getUserTickets(userId: string): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined>;
  updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined>;
  
  // Legacy operations (keeping for backwards compatibility)
  createAuditRequest(request: InsertAuditRequest): Promise<AuditRequest>;
  getAuditRequests(): Promise<AuditRequest[]>;
  getAuditRequest(id: number): Promise<AuditRequest | undefined>;
  updateAuditRequestStatus(id: number, processed: boolean): Promise<AuditRequest | undefined>;
  
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  updateQuoteRequestStatus(id: number, processed: boolean): Promise<QuoteRequest | undefined>;

  createBrandScanTicket(request: InsertBrandScanTicket): Promise<BrandScanTicket>;
  getBrandScanTickets(): Promise<BrandScanTicket[]>;
  getBrandScanTicket(id: number): Promise<BrandScanTicket | undefined>;
  updateBrandScanTicketStatus(id: number, processed: boolean): Promise<BrandScanTicket | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ticket operations
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values(ticketData)
      .returning();
    return ticket;
  }

  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }
    
    const [ticket] = await db
      .update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined> {
    const [ticket] = await db
      .update(tickets)
      .set({ notes, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  // Legacy operations (keeping for backwards compatibility - using memory storage)
  private auditRequests: Map<number, AuditRequest> = new Map();
  private quoteRequests: Map<number, QuoteRequest> = new Map();
  private brandScanTickets: Map<number, BrandScanTicket> = new Map();
  private currentAuditId: number = 1;
  private currentQuoteId: number = 1;
  private currentBrandScanId: number = 1;

  async createAuditRequest(insertRequest: InsertAuditRequest): Promise<AuditRequest> {
    const id = this.currentAuditId++;
    const request: AuditRequest = {
      ...insertRequest,
      id,
      website: insertRequest.website || null,
      message: insertRequest.message || null,
      processed: false,
      createdAt: new Date(),
    };
    this.auditRequests.set(id, request);
    return request;
  }

  async getAuditRequests(): Promise<AuditRequest[]> {
    return Array.from(this.auditRequests.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getAuditRequest(id: number): Promise<AuditRequest | undefined> {
    return this.auditRequests.get(id);
  }

  async updateAuditRequestStatus(id: number, processed: boolean): Promise<AuditRequest | undefined> {
    const request = this.auditRequests.get(id);
    if (request) {
      const updatedRequest = { ...request, processed };
      this.auditRequests.set(id, updatedRequest);
      return updatedRequest;
    }
    return undefined;
  }

  async createQuoteRequest(insertRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = this.currentQuoteId++;
    const request: QuoteRequest = {
      ...insertRequest,
      id,
      processed: false,
      createdAt: new Date(),
    };
    this.quoteRequests.set(id, request);
    return request;
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }

  async updateQuoteRequestStatus(id: number, processed: boolean): Promise<QuoteRequest | undefined> {
    const request = this.quoteRequests.get(id);
    if (request) {
      const updatedRequest = { ...request, processed };
      this.quoteRequests.set(id, updatedRequest);
      return updatedRequest;
    }
    return undefined;
  }

  async createBrandScanTicket(insertRequest: InsertBrandScanTicket): Promise<BrandScanTicket> {
    const id = this.currentBrandScanId++;
    const request: BrandScanTicket = {
      id,
      ...insertRequest,
      processed: false,
      createdAt: new Date()
    };
    this.brandScanTickets.set(id, request);
    return request;
  }

  async getBrandScanTickets(): Promise<BrandScanTicket[]> {
    return Array.from(this.brandScanTickets.values());
  }

  async getBrandScanTicket(id: number): Promise<BrandScanTicket | undefined> {
    return this.brandScanTickets.get(id);
  }

  async updateBrandScanTicketStatus(id: number, processed: boolean): Promise<BrandScanTicket | undefined> {
    const request = this.brandScanTickets.get(id);
    if (request) {
      request.processed = processed;
      this.brandScanTickets.set(id, request);
      return request;
    }
    return undefined;
  }
}

export const storage = new DatabaseStorage();
