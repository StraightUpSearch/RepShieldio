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

  // Blog CMS operations
  getBlogPosts(): Promise<any[]>;
  getBlogCategories(): Promise<any[]>;
  getBlogPostBySlug(slug: string): Promise<any | undefined>;
  createBlogPost(data: any): Promise<any>;
  updateBlogPost(id: number, data: any): Promise<any>;
  deleteBlogPost(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication  
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
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
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  // Ticket operations
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    try {
      const [ticket] = await db
        .insert(tickets)
        .values(ticketData)
        .returning();
      return ticket;
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  }

  async getTickets(): Promise<Ticket[]> {
    try {
      return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    } catch (error) {
      console.error("Error getting tickets:", error);
      return [];
    }
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    try {
      return await db
        .select()
        .from(tickets)
        .where(eq(tickets.userId, userId))
        .orderBy(desc(tickets.createdAt));
    } catch (error) {
      console.error("Error getting user tickets:", error);
      return [];
    }
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    try {
      const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
      return ticket;
    } catch (error) {
      console.error("Error getting ticket:", error);
      return undefined;
    }
  }

  async updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined> {
    try {
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
    } catch (error) {
      console.error("Error updating ticket status:", error);
      return undefined;
    }
  }

  async updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined> {
    try {
      const [ticket] = await db
        .update(tickets)
        .set({ notes, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning();
      return ticket;
    } catch (error) {
      console.error("Error updating ticket notes:", error);
      return undefined;
    }
  }

  // Legacy operations (in-memory for now)
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

// Temporary: Use memory storage for legacy operations until database is fully migrated
export class MemStorage implements IStorage {
  private auditRequests: Map<number, AuditRequest> = new Map();
  private quoteRequests: Map<number, QuoteRequest> = new Map();
  private brandScanTickets: Map<number, BrandScanTicket> = new Map();
  private currentAuditId: number = 1;
  private currentQuoteId: number = 1;
  private currentBrandScanId: number = 1;

  // User operations (temporary stubs)
  async getUser(id: string): Promise<User | undefined> {
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return {
      id: userData.id || "",
      email: userData.email || "",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Ticket operations (temporary stubs)
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    return {
      id: 1,
      userId: ticketData.userId,
      type: ticketData.type,
      status: ticketData.status || "pending",
      priority: ticketData.priority || "standard",
      assignedTo: ticketData.assignedTo || null,
      title: ticketData.title,
      description: ticketData.description || null,
      requestData: ticketData.requestData || null,
      notes: ticketData.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getTickets(): Promise<Ticket[]> {
    return [];
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return [];
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return undefined;
  }

  async updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined> {
    return undefined;
  }

  async updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined> {
    return undefined;
  }

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

  // Blog CMS methods
  async getBlogPosts(): Promise<any[]> {
    return [
      {
        id: 1,
        title: "Complete Guide to Reddit Content Removal in 2024",
        slug: "reddit-content-removal-guide-2024",
        excerpt: "Learn professional strategies for removing unwanted Reddit posts and comments with our comprehensive 2024 guide.",
        content: "Reddit content removal has become increasingly important for brand reputation management...",
        metaTitle: "Reddit Content Removal Guide 2024 - RepShield",
        metaDescription: "Professional Reddit removal strategies with 95% success rate. Complete guide to removing posts, comments, and protecting your brand reputation.",
        keywords: "reddit removal, content removal, reputation management",
        author: "RepShield Team",
        status: "published",
        category: "Reddit Removal",
        tags: ["reddit", "removal", "reputation"],
        readingTime: 8,
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ];
  }

  async getBlogCategories(): Promise<any[]> {
    return [
      { 
        id: 1,
        name: "Reddit Removal", 
        slug: "reddit-removal", 
        description: "Complete guides for Reddit content removal"
      },
      { 
        id: 2,
        name: "Brand Protection", 
        slug: "brand-protection", 
        description: "Strategies to protect your brand online"
      }
    ];
  }

  async getBlogPostBySlug(slug: string): Promise<any | undefined> {
    const posts = await this.getBlogPosts();
    return posts.find(post => post.slug === slug);
  }

  async createBlogPost(data: any): Promise<any> {
    return { 
      id: Date.now(), 
      ...data, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateBlogPost(id: number, data: any): Promise<any> {
    return { 
      id, 
      ...data, 
      updatedAt: new Date().toISOString() 
    };
  }

  async deleteBlogPost(id: number): Promise<void> {
    // Implementation for deleting blog post
  }
}

export const storage = new MemStorage();
