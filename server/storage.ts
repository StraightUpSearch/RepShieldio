import { 
  auditRequests, 
  quoteRequests,
  type AuditRequest, 
  type InsertAuditRequest,
  type QuoteRequest,
  type InsertQuoteRequest 
} from "@shared/schema";

export interface IStorage {
  createAuditRequest(request: InsertAuditRequest): Promise<AuditRequest>;
  getAuditRequests(): Promise<AuditRequest[]>;
  getAuditRequest(id: number): Promise<AuditRequest | undefined>;
  updateAuditRequestStatus(id: number, processed: boolean): Promise<AuditRequest | undefined>;
  
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  updateQuoteRequestStatus(id: number, processed: boolean): Promise<QuoteRequest | undefined>;
}

export class MemStorage implements IStorage {
  private auditRequests: Map<number, AuditRequest>;
  private quoteRequests: Map<number, QuoteRequest>;
  private currentAuditId: number;
  private currentQuoteId: number;

  constructor() {
    this.auditRequests = new Map();
    this.quoteRequests = new Map();
    this.currentAuditId = 1;
    this.currentQuoteId = 1;
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
}

export const storage = new MemStorage();
