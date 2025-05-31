import { auditRequests, type AuditRequest, type InsertAuditRequest } from "@shared/schema";

export interface IStorage {
  createAuditRequest(request: InsertAuditRequest): Promise<AuditRequest>;
  getAuditRequests(): Promise<AuditRequest[]>;
  getAuditRequest(id: number): Promise<AuditRequest | undefined>;
  updateAuditRequestStatus(id: number, processed: boolean): Promise<AuditRequest | undefined>;
}

export class MemStorage implements IStorage {
  private auditRequests: Map<number, AuditRequest>;
  private currentId: number;

  constructor() {
    this.auditRequests = new Map();
    this.currentId = 1;
  }

  async createAuditRequest(insertRequest: InsertAuditRequest): Promise<AuditRequest> {
    const id = this.currentId++;
    const request: AuditRequest = {
      ...insertRequest,
      id,
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
}

export const storage = new MemStorage();
