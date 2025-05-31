import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertAuditRequestSchema, insertQuoteRequestSchema } from "@shared/schema";
import { getChatbotResponse, analyzeRedditUrl } from "./openai";
import { sendQuoteNotification, sendContactNotification } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Audit request submission endpoint
  app.post("/api/audit-request", async (req, res) => {
    try {
      const validatedData = insertAuditRequestSchema.parse(req.body);
      
      const auditRequest = await storage.createAuditRequest(validatedData);
      
      // Send email notification
      try {
        await sendContactNotification({
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          website: validatedData.website,
          message: validatedData.message
        });
      } catch (error) {
        console.error("Failed to send email notification:", error);
        // Continue even if email fails
      }
      
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

  // Quote request submission endpoint
  app.post("/api/quote-request", async (req, res) => {
    try {
      const validatedData = insertQuoteRequestSchema.parse(req.body);
      
      // Get AI analysis of the Reddit URL
      let analysis = null;
      try {
        analysis = await analyzeRedditUrl(validatedData.redditUrl);
      } catch (error) {
        console.error("AI analysis failed:", error);
        // Continue without analysis if AI fails
      }
      
      const quoteRequest = await storage.createQuoteRequest(validatedData);
      
      // Send email notification
      try {
        await sendQuoteNotification({
          redditUrl: validatedData.redditUrl,
          email: validatedData.email,
          analysis
        });
      } catch (error) {
        console.error("Failed to send email notification:", error);
        // Continue even if email fails
      }
      
      res.status(201).json({
        success: true,
        message: "Quote request submitted successfully",
        id: quoteRequest.id,
        analysis
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: error.errors
        });
      } else {
        console.error("Error creating quote request:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });

  // Get all quote requests (for admin purposes)
  app.get("/api/quote-requests", async (req, res) => {
    try {
      const requests = await storage.getQuoteRequests();
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      console.error("Error fetching quote requests:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      const response = await getChatbotResponse(message, conversationHistory);
      
      res.json({
        success: true,
        response
      });
    } catch (error) {
      console.error("Error in chatbot:", error);
      res.status(500).json({
        success: false,
        message: "Chatbot service unavailable",
        response: "I'm experiencing technical difficulties. Please use our contact form for immediate assistance with Reddit content removal."
      });
    }
  });

  // URL analysis endpoint
  app.post("/api/analyze-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({
          success: false,
          message: "URL is required"
        });
      }

      const analysis = await analyzeRedditUrl(url);
      
      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      console.error("Error analyzing URL:", error);
      res.status(500).json({
        success: false,
        message: "URL analysis unavailable",
        analysis: {
          contentType: "Reddit content",
          estimatedPrice: "$780",
          description: "We can analyze and remove this content. Contact us for a detailed quote."
        }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
