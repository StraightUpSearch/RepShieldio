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

// Helper functions for SQLite timestamp conversion
const isPostgres = !!process.env.DATABASE_URL;

function toDbTimestamp(date?: Date): any {
  if (!date) return isPostgres ? new Date() : Math.floor(Date.now() / 1000);
  return isPostgres ? date : Math.floor(date.getTime() / 1000);
}

function fromDbTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  return isPostgres ? timestamp : new Date(timestamp * 1000);
}

function convertUserFromDb(user: any): User {
  if (!user) return user;
  return {
    ...user,
    createdAt: fromDbTimestamp(user.createdAt),
    updatedAt: fromDbTimestamp(user.updatedAt),
  };
}

function convertTicketFromDb(ticket: any): Ticket {
  if (!ticket) return ticket;
  return {
    ...ticket,
    createdAt: fromDbTimestamp(ticket.createdAt),
    updatedAt: fromDbTimestamp(ticket.updatedAt),
    requestData: ticket.requestData ? (
      isPostgres ? ticket.requestData : JSON.parse(ticket.requestData)
    ) : null,
  };
}

export interface IStorage {
  // User operations for authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Ticket operations
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTickets(): Promise<Ticket[]>;
  getUserTickets(userId: string): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined>;
  updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined>;
  getTicketsWithUsers(): Promise<any[]>;
  
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

  // Removal case operations
  createRemovalCase(data: any): Promise<any>;
  getUserRemovalCases(userId: string): Promise<any[]>;
  getRemovalCase(id: number): Promise<any | undefined>;
  updateRemovalCaseStatus(id: number, status: string, progress?: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations for authentication  
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user ? convertUserFromDb(user) : undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user ? convertUserFromDb(user) : undefined;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return undefined;
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const dbUserData = {
        ...userData,
        createdAt: toDbTimestamp(userData.createdAt),
        updatedAt: toDbTimestamp(new Date()),
      };
      
      const [user] = await db
        .insert(users)
        .values(dbUserData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...dbUserData,
            updatedAt: toDbTimestamp(new Date()),
          },
        })
        .returning();
      return convertUserFromDb(user);
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  // Ticket operations
  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    try {
      // Ensure all values are SQLite-compatible types (string, number, bigint, Buffer, null)
      const sanitizeForSqlite = (value: any): string | number | bigint | Buffer | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint' || Buffer.isBuffer(value)) {
          return value;
        }
        // Convert objects/arrays to JSON string for SQLite
        return JSON.stringify(value);
      };

      const completeTicketData = {
        ...ticketData,
        redditUrl: ticketData.redditUrl || null,
        amount: ticketData.amount || null,
        progress: ticketData.progress || 0,
        requestData: ticketData.requestData ? (
          isPostgres 
            ? ticketData.requestData 
            : sanitizeForSqlite(ticketData.requestData)
        ) : null,
        createdAt: toDbTimestamp(),
        updatedAt: toDbTimestamp(),
      };
      
      const [ticket] = await db
        .insert(tickets)
        .values(completeTicketData)
        .returning();
      return convertTicketFromDb(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      console.error("Ticket data that failed:", JSON.stringify(ticketData, null, 2));
      throw error;
    }
  }

  async getTickets(): Promise<Ticket[]> {
    try {
      const results = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
      return results.map(convertTicketFromDb);
    } catch (error) {
      console.error("Error getting tickets:", error);
      return [];
    }
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    try {
      const results = await db
        .select()
        .from(tickets)
        .where(eq(tickets.userId, userId))
        .orderBy(desc(tickets.createdAt));
      return results.map(convertTicketFromDb);
    } catch (error) {
      console.error("Error getting user tickets:", error);
      return [];
    }
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    try {
      const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
      return ticket ? convertTicketFromDb(ticket) : undefined;
    } catch (error) {
      console.error("Error getting ticket:", error);
      return undefined;
    }
  }

  async updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined> {
    try {
      const updateData: any = { 
        status, 
        updatedAt: toDbTimestamp(new Date()) 
      };
      if (assignedTo !== undefined) {
        updateData.assignedTo = assignedTo;
      }
      
      const [ticket] = await db
        .update(tickets)
        .set(updateData)
        .where(eq(tickets.id, id))
        .returning();
      return ticket ? convertTicketFromDb(ticket) : undefined;
    } catch (error) {
      console.error("Error updating ticket status:", error);
      return undefined;
    }
  }

  async updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined> {
    try {
      const [ticket] = await db
        .update(tickets)
        .set({ 
          notes, 
          updatedAt: toDbTimestamp(new Date()) 
        })
        .where(eq(tickets.id, id))
        .returning();
      return ticket ? convertTicketFromDb(ticket) : undefined;
    } catch (error) {
      console.error("Error updating ticket notes:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const results = await db.select().from(users);
      return results.map(convertUserFromDb);
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async getTicketsWithUsers(): Promise<any[]> {
    try {
      const result = await db
        .select({
          ticket: tickets,
          user: users
        })
        .from(tickets)
        .leftJoin(users, eq(tickets.userId, users.id))
        .orderBy(desc(tickets.createdAt));
      
      return result.map(row => ({
        ...row.ticket,
        user: row.user
      }));
    } catch (error) {
      console.error("Error fetching tickets with users:", error);
      return [];
    }
  }

  // Database implementations for all legacy operations
  async createAuditRequest(insertRequest: InsertAuditRequest): Promise<AuditRequest> {
    try {
      const requestData = {
        ...insertRequest,
        website: insertRequest.website || null,
        message: insertRequest.message || null,
        processed: isPostgres ? false : 0, // SQLite uses 0/1 for boolean
        createdAt: isPostgres ? new Date() : toDbTimestamp(new Date()),
      };
      
      const [request] = await db
        .insert(auditRequests)
        .values(requestData)
        .returning();
      return request;
    } catch (error) {
      console.error("Error creating audit request:", error);
      console.error("Request data that failed:", JSON.stringify(insertRequest, null, 2));
      throw error;
    }
  }

  async getAuditRequests(): Promise<AuditRequest[]> {
    try {
      return await db.select().from(auditRequests).orderBy(desc(auditRequests.createdAt));
    } catch (error) {
      console.error("Error getting audit requests:", error);
      return [];
    }
  }

  async getAuditRequest(id: number): Promise<AuditRequest | undefined> {
    try {
      const [request] = await db.select().from(auditRequests).where(eq(auditRequests.id, id));
      return request;
    } catch (error) {
      console.error("Error getting audit request:", error);
      return undefined;
    }
  }

  async updateAuditRequestStatus(id: number, processed: boolean): Promise<AuditRequest | undefined> {
    try {
      const [request] = await db
        .update(auditRequests)
        .set({ processed })
        .where(eq(auditRequests.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error("Error updating audit request status:", error);
      return undefined;
    }
  }

  async createQuoteRequest(insertRequest: InsertQuoteRequest): Promise<QuoteRequest> {
    try {
      const requestData = {
        ...insertRequest,
        processed: false,
        createdAt: new Date(),
      };
      
      const [request] = await db
        .insert(quoteRequests)
        .values(requestData)
        .returning();
      return request;
    } catch (error) {
      console.error("Error creating quote request:", error);
      throw error;
    }
  }

  async getQuoteRequests(): Promise<QuoteRequest[]> {
    try {
      return await db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt));
    } catch (error) {
      console.error("Error getting quote requests:", error);
      return [];
    }
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    try {
      const [request] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
      return request;
    } catch (error) {
      console.error("Error getting quote request:", error);
      return undefined;
    }
  }

  async updateQuoteRequestStatus(id: number, processed: boolean): Promise<QuoteRequest | undefined> {
    try {
      const [request] = await db
        .update(quoteRequests)
        .set({ processed })
        .where(eq(quoteRequests.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error("Error updating quote request status:", error);
      return undefined;
    }
  }

  async createBrandScanTicket(insertRequest: InsertBrandScanTicket): Promise<BrandScanTicket> {
    try {
      const requestData = {
        ...insertRequest,
        processed: false,
        createdAt: new Date(),
      };
      
      const [request] = await db
        .insert(brandScanTickets)
        .values(requestData)
        .returning();
      return request;
    } catch (error) {
      console.error("Error creating brand scan ticket:", error);
      throw error;
    }
  }

  async getBrandScanTickets(): Promise<BrandScanTicket[]> {
    try {
      return await db.select().from(brandScanTickets).orderBy(desc(brandScanTickets.createdAt));
    } catch (error) {
      console.error("Error getting brand scan tickets:", error);
      return [];
    }
  }

  async getBrandScanTicket(id: number): Promise<BrandScanTicket | undefined> {
    try {
      const [request] = await db.select().from(brandScanTickets).where(eq(brandScanTickets.id, id));
      return request;
    } catch (error) {
      console.error("Error getting brand scan ticket:", error);
      return undefined;
    }
  }

  async updateBrandScanTicketStatus(id: number, processed: boolean): Promise<BrandScanTicket | undefined> {
    try {
      const [request] = await db
        .update(brandScanTickets)
        .set({ processed })
        .where(eq(brandScanTickets.id, id))
        .returning();
      return request;
    } catch (error) {
      console.error("Error updating brand scan ticket status:", error);
      return undefined;
    }
  }

  // Blog CMS operations - using tickets table as content
  async getBlogPosts(): Promise<any[]> {
    return [];
  }

  async getBlogCategories(): Promise<any[]> {
    return [];
  }

  async getBlogPostBySlug(slug: string): Promise<any | undefined> {
    return undefined;
  }

  async createBlogPost(data: any): Promise<any> {
    return data;
  }

  async updateBlogPost(id: number, data: any): Promise<any> {
    return data;
  }

  async deleteBlogPost(id: number): Promise<void> {
    return;
  }

  // Removal case operations - using tickets table
  async createRemovalCase(data: any): Promise<any> {
    const ticket = await this.createTicket({
      userId: data.userId,
      type: 'reddit_post_removal',
      title: data.title || 'Reddit Content Removal',
      description: data.description,
      redditUrl: data.redditUrl,
      amount: data.amount,
      requestData: data
    });
    return ticket;
  }

  async getUserRemovalCases(userId: string): Promise<any[]> {
    return await this.getUserTickets(userId);
  }

  async getRemovalCase(id: number): Promise<any | undefined> {
    return await this.getTicket(id);
  }

  async updateRemovalCaseStatus(id: number, status: string, progress?: number): Promise<any> {
    try {
      const updateData: any = { status, updatedAt: new Date() };
      if (progress !== undefined) {
        updateData.progress = progress;
      }
      
      const [ticket] = await db
        .update(tickets)
        .set(updateData)
        .where(eq(tickets.id, id))
        .returning();
      return ticket;
    } catch (error) {
      console.error("Error updating removal case status:", error);
      return undefined;
    }
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
  private allUsers: User[] = [];
  private allTickets: Ticket[] = [];

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.allUsers.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.allUsers.find(user => user.email === email);
  }

  async getAllUsers(): Promise<User[]> {
    return this.allUsers;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUserIndex = this.allUsers.findIndex(user => user.id === userData.id);
    
    const user: User = {
      id: userData.id || "",
      email: userData.email || "",
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      password: userData.password || null,
      role: userData.role || "user",
      accountBalance: userData.accountBalance || "0.00",
      creditsRemaining: userData.creditsRemaining || 0,
      createdAt: existingUserIndex >= 0 ? this.allUsers[existingUserIndex].createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (existingUserIndex >= 0) {
      // Update existing user
      this.allUsers[existingUserIndex] = user;
    } else {
      // Add new user
      this.allUsers.push(user);
    }

    return user;
  }

  // Ticket operations 
  private currentTicketId: number = 1;

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const ticket: Ticket = {
      id: this.currentTicketId++,
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
    
    this.allTickets.push(ticket);
    console.log(`📝 Created ticket #${ticket.id}: ${ticket.title}`);
    return ticket;
  }

  async getTickets(): Promise<Ticket[]> {
    return [...this.allTickets];
  }

  async getUserTickets(userId: string): Promise<Ticket[]> {
    return this.allTickets.filter(ticket => ticket.userId === userId);
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.allTickets.find(ticket => ticket.id === id);
  }

  async updateTicketStatus(id: number, status: string, assignedTo?: string): Promise<Ticket | undefined> {
    const ticketIndex = this.allTickets.findIndex(ticket => ticket.id === id);
    if (ticketIndex !== -1) {
      this.allTickets[ticketIndex] = {
        ...this.allTickets[ticketIndex],
        status,
        assignedTo: assignedTo || this.allTickets[ticketIndex].assignedTo,
        updatedAt: new Date()
      };
      return this.allTickets[ticketIndex];
    }
    return undefined;
  }

  async updateTicketNotes(id: number, notes: string): Promise<Ticket | undefined> {
    const ticketIndex = this.allTickets.findIndex(ticket => ticket.id === id);
    if (ticketIndex !== -1) {
      this.allTickets[ticketIndex] = {
        ...this.allTickets[ticketIndex],
        notes,
        updatedAt: new Date()
      };
      return this.allTickets[ticketIndex];
    }
    return undefined;
  }

  async getTicketsWithUsers(): Promise<any[]> {
    return this.allTickets.map(ticket => {
      const user = this.allUsers.find(u => u.id === ticket.userId);
      return {
        ...ticket,
        user: user || null
      };
    });
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

  // Removal case methods
  private removalCases: Map<number, any> = new Map();
  private currentCaseId: number = 1;

  constructor() {
    // Add a test case ready for payment with assigned specialist
    this.removalCases.set(1, {
      id: 1,
      userId: 'test-user',
      redditUrl: 'https://reddit.com/r/technology/comments/*****/******',
      status: 'quoted',
      estimatedPrice: '$899',
      description: 'Remove defamatory post about company practices from r/technology. High visibility post with 250+ comments requiring strategic approach.',
      createdAt: new Date().toISOString(),
      progress: 0,
      specialist: {
        name: 'Sarah Mitchell',
        title: 'Senior Content Removal Specialist',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
        experience: '5+ years experience',
        specialties: ['High-visibility posts', 'Technology subreddits', 'Corporate reputation'],
        successRate: '96%',
        bio: 'Sarah specializes in removing sensitive corporate content from major technology communities. She has successfully handled over 500 similar cases.'
      },
      updates: [
        {
          id: 1,
          message: 'Hi! I\'m Sarah, your assigned specialist. I\'ve completed the analysis and prepared a targeted removal strategy for your case.',
          timestamp: new Date().toISOString(),
          type: 'info'
        }
      ]
    });
    this.currentCaseId = 2;
  }

  async createRemovalCase(data: any): Promise<any> {
    const caseData = {
      id: this.currentCaseId++,
      ...data,
      createdAt: new Date().toISOString(),
      updates: [{
        id: 1,
        message: "Case created and initial analysis completed",
        timestamp: new Date().toISOString(),
        type: 'info'
      }]
    };
    this.removalCases.set(caseData.id, caseData);
    return caseData;
  }

  async getUserRemovalCases(userId: string): Promise<any[]> {
    // Return all cases for testing (in production, filter by actual userId)
    const userCases = Array.from(this.removalCases.values());
    return userCases;
  }

  async getRemovalCase(id: number): Promise<any | undefined> {
    return this.removalCases.get(id);
  }

  async updateRemovalCaseStatus(id: number, status: string, progress?: number): Promise<any> {
    const case_ = this.removalCases.get(id);
    if (case_) {
      case_.status = status;
      if (progress !== undefined) {
        case_.progress = progress;
      }
      case_.updates.unshift({
        id: case_.updates.length + 1,
        message: `Status updated to ${status}`,
        timestamp: new Date().toISOString(),
        type: 'info'
      });
      this.removalCases.set(id, case_);
    }
    return case_;
  }
}

// Use memory storage for development until database tables are set up
export const storage = process.env.NODE_ENV === 'development' ? new MemStorage() : new DatabaseStorage();
