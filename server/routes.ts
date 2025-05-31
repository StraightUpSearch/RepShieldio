import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertAuditRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Audit request submission endpoint
  app.post("/api/audit-request", async (req, res) => {
    try {
      const validatedData = insertAuditRequestSchema.parse(req.body);
      
      const auditRequest = await storage.createAuditRequest(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Audit request submitted successfully",
        id: auditRequest.id
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: error.errors
        });
      } else {
        console.error("Error creating audit request:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });

  // Get all audit requests (for admin purposes)
  app.get("/api/audit-requests", async (req, res) => {
    try {
      const requests = await storage.getAuditRequests();
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error("Error fetching audit requests:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Get specific audit request
  app.get("/api/audit-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request ID"
        });
      }

      const request = await storage.getAuditRequest(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Audit request not found"
        });
      }

      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      console.error("Error fetching audit request:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Update audit request status
  app.patch("/api/audit-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request ID"
        });
      }

      const { processed } = req.body;
      if (typeof processed !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: "Invalid processed status"
        });
      }

      const updatedRequest = await storage.updateAuditRequestStatus(id, processed);
      if (!updatedRequest) {
        return res.status(404).json({
          success: false,
          message: "Audit request not found"
        });
      }

      res.json({
        success: true,
        data: updatedRequest
      });
    } catch (error) {
      console.error("Error updating audit request status:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
