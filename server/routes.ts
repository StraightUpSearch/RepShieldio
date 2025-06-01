import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertAuditRequestSchema, insertQuoteRequestSchema, insertBrandScanTicketSchema } from "@shared/schema";
import { getChatbotResponse, analyzeRedditUrl } from "./openai";
import { sendQuoteNotification, sendContactNotification } from "./email";
import { redditAPI } from "./reddit";
import { telegramBot } from "./telegram";
import { webScrapingService } from "./webscraping";

// Brand scanning with real Reddit data
async function sendBrandScanNotification(data: any) {
  // Placeholder for email notification
  console.log('Brand scan notification:', data);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple authentication endpoints
  app.get('/api/auth/user', async (req, res) => {
    // For now, return mock authenticated user - will integrate with Replit auth later
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  // Get user tickets
  app.get('/api/user/tickets', async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const tickets = await storage.getUserTickets(userId);
    res.json(tickets);
  });

  // Admin endpoints for ticket management
  app.get('/api/admin/tickets', async (req, res) => {
    // Basic admin check - in production you'd verify admin role
    const tickets = await storage.getTickets();
    res.json(tickets);
  });

  app.patch('/api/admin/tickets/:id', async (req, res) => {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;
    
    let ticket;
    if (status || assignedTo) {
      ticket = await storage.updateTicketStatus(parseInt(id), status, assignedTo);
    }
    
    if (notes) {
      ticket = await storage.updateTicketNotes(parseInt(id), notes);
    }
    
    res.json(ticket);
  });

  // Monitoring subscription endpoint
  app.post('/api/monitoring/subscribe', async (req, res) => {
    try {
      const { planId, paymentMethod, price } = req.body;
      
      // Create monitoring subscription
      const subscription = {
        id: Date.now(),
        planId,
        paymentMethod,
        price,
        status: 'active',
        createdAt: new Date(),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      // Send notification to admin
      await telegramBot.sendNewLeadNotification({
        type: 'Monitoring Subscription',
        planId,
        paymentMethod,
        price,
        id: subscription.id
      });

      res.json(subscription);
    } catch (error) {
      console.error("Monitoring subscription error:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  // AI Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message, conversationHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
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

  // Comprehensive brand scanning with multi-platform web scraping
  app.post("/api/scan-brand", async (req, res) => {
    try {
      const { brandName, includePlatforms = ['reddit', 'reviews', 'social', 'news'] } = req.body;
      if (!brandName) {
        return res.status(400).json({ message: "Brand name is required" });
      }

      const allResults = {
        totalMentions: 0,
        posts: 0,
        comments: 0,
        webMentions: 0,
        platforms: {} as any,
        riskLevel: 'low' as 'low' | 'medium' | 'high',
        previewMentions: [] as any[]
      };

      // Helper to format timestamps
      const formatTimeAgo = (timestamp: number) => {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
      };

      // Scan Reddit with authentic data
      console.log(`Scanning Reddit for brand: ${brandName}`);
      const redditResults = await redditAPI.searchBrand(brandName);
      
      allResults.totalMentions += redditResults.totalFound;
      allResults.posts = redditResults.posts.length;
      allResults.comments = redditResults.comments.length;
      
      // Add Reddit preview mentions with real data
      const redditPreviews = [
        ...redditResults.posts.slice(0, 2).map(post => ({
          subreddit: post.subreddit,
          timeAgo: formatTimeAgo(post.created_utc),
          sentiment: redditResults.sentiment,
          previewText: post.title.substring(0, 120) + (post.title.length > 120 ? '...' : ''),
          url: `https://reddit.com${post.permalink}`,
          score: post.score,
          platform: 'Reddit'
        })),
        ...redditResults.comments.slice(0, 1).map(comment => ({
          subreddit: comment.subreddit,
          timeAgo: formatTimeAgo(comment.created_utc),
          sentiment: redditResults.sentiment,
          previewText: comment.body.substring(0, 120) + (comment.body.length > 120 ? '...' : ''),
          url: `https://reddit.com${comment.permalink}`,
          score: comment.score,
          platform: 'Reddit'
        }))
      ];
      allResults.previewMentions.push(...redditPreviews);

      // Scan web platforms using ScrapingBee for additional authentic data
      if (includePlatforms.includes('reviews') || includePlatforms.includes('social') || includePlatforms.includes('news')) {
        try {
          console.log(`Scanning web platforms for brand: ${brandName} using ScrapingBee`);
          const webResults = await webScrapingService.searchBrandMentions(brandName);
          
          webResults.forEach(result => {
            allResults.totalMentions += result.totalFound;
            allResults.webMentions += result.totalFound;
            
            // Add web platform previews
            const webPreviews = result.mentions.slice(0, 1).map(mention => ({
              subreddit: result.source.toLowerCase(),
              timeAgo: mention.publishedAt ? formatTimeAgo(new Date(mention.publishedAt).getTime() / 1000) : 'Recently',
              sentiment: mention.sentiment,
              previewText: mention.content.substring(0, 120) + (mention.content.length > 120 ? '...' : ''),
              url: mention.url,
              score: mention.score || 0,
              platform: result.source
            }));
            allResults.previewMentions.push(...webPreviews);
          });
        } catch (error) {
          console.error("Web scraping failed:", error);
          // Continue with Reddit data only if web scraping fails
        }
      }

      // Calculate overall risk from authentic data
      const negativeCount = allResults.previewMentions.filter(m => m.sentiment === 'negative').length;
      const totalCount = allResults.previewMentions.length;
      
      if (negativeCount > totalCount * 0.6 || redditResults.riskScore > 7) {
        allResults.riskLevel = 'high';
      } else if (negativeCount > totalCount * 0.3 || redditResults.riskScore > 4) {
        allResults.riskLevel = 'medium';
      }

      res.json({
        totalMentions: allResults.totalMentions,
        posts: allResults.posts,
        comments: allResults.comments,
        riskLevel: allResults.riskLevel,
        previewMentions: allResults.previewMentions.slice(0, 3),
        platformsCovered: includePlatforms.length,
        redditRiskScore: redditResults.riskScore
      });
    } catch (error) {
      console.error("Reddit scan error:", error);
      res.status(500).json({ message: "Failed to scan Reddit data" });
    }
  });

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
          company: validatedData.company || '',
          website: validatedData.website || 'Not provided',
          message: validatedData.message || 'No message provided'
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

  // Reddit brand scanning endpoint
  app.post("/api/scan-brand", async (req, res) => {
    try {
      const { brandName } = req.body;
      
      if (!brandName || typeof brandName !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: "Brand name is required" 
        });
      }
      
      const results = await redditAPI.searchBrand(brandName.trim());
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error("Reddit API error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to scan Reddit for brand mentions" 
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

  // Brand scan ticket submission endpoint with lead capture
  app.post("/api/brand-scan-ticket", async (req, res) => {
    try {
      const { scanResults, recaptchaToken, ...ticketData } = req.body;
      const validatedData = insertBrandScanTicketSchema.parse(ticketData);
      
      // Create user account from lead data
      const userId = validatedData.email.replace('@', '_').replace(/\./g, '_');
      const user = await storage.upsertUser({
        id: userId,
        email: validatedData.email,
        firstName: validatedData.name.split(' ')[0],
        lastName: validatedData.name.split(' ').slice(1).join(' ') || '',
        profileImageUrl: null
      });

      // Create ticket with enhanced data
      const ticket = await storage.createTicket({
        type: 'brand_scan',
        status: 'pending',
        priority: validatedData.leadType || 'standard',
        title: `Brand Scan: ${validatedData.brandName}`,
        description: `New lead from brand scanner for ${validatedData.brandName}. User: ${validatedData.name} (${validatedData.email}), Company: ${validatedData.company}`,
        userId: userId,
        requestData: {
          ...validatedData,
          scanResults: scanResults,
          submissionTime: new Date().toISOString(),
          source: 'brand_scanner'
        }
      });

      // Send Telegram notification to Jamie
      try {
        await telegramBot.sendNewLeadNotification({
          type: 'Brand Scanner Lead',
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          brandName: validatedData.brandName,
          leadType: validatedData.leadType,
          ticketId: ticket.id,
          scanSummary: scanResults ? {
            totalMentions: scanResults.totalMentions || 0,
            riskLevel: scanResults.riskLevel || 'unknown',
            sentiment: scanResults.overallSentiment || 'neutral'
          } : null
        });
      } catch (error) {
        console.error("Failed to send Telegram notification:", error);
      }

      // Send email notification
      try {
        await sendContactNotification({
          name: validatedData.name,
          email: validatedData.email,
          company: validatedData.company,
          website: 'RepShield Brand Scanner',
          message: `New lead from brand scanner: ${validatedData.brandName}. Account created and ready for specialist analysis.`
        });
      } catch (error) {
        console.error("Failed to send email notification:", error);
      }
      
      res.status(201).json({
        success: true,
        message: "Account created and specialist assigned",
        ticketId: ticket.id,
        userId: userId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: error.errors
        });
      } else {
        console.error("Error creating brand scan ticket:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error"
        });
      }
    }
  });

  // Telegram webhook endpoint
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      await telegramBot.processUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error("Telegram webhook error:", error);
      res.status(500).send('Error');
    }
  });

  // Setup Telegram webhook (call this once after deployment)
  app.post("/api/telegram/setup-webhook", async (req, res) => {
    try {
      const webhookUrl = `${req.protocol}://${req.get('host')}/api/telegram/webhook`;
      const success = await telegramBot.setWebhook(webhookUrl);
      
      res.json({
        success,
        message: success ? 'Telegram webhook configured successfully' : 'Failed to configure webhook'
      });
    } catch (error) {
      console.error("Error setting up Telegram webhook:", error);
      res.status(500).json({
        success: false,
        message: "Failed to setup Telegram webhook"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
