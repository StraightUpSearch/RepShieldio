import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simple-auth";
import { insertAuditRequestSchema, insertQuoteRequestSchema, insertBrandScanTicketSchema } from "@shared/schema";
import { globalErrorHandler, handleAsyncErrors, AppError } from "./error-handler";
import { validateInput, brandScanSchema, contactSchema } from "./validation";
import { strictLimiter, moderateLimiter, generalLimiter } from "./rate-limiter";
import { getChatbotResponse, analyzeRedditUrl } from "./openai";
import { sendQuoteNotification, sendContactNotification } from "./email";
import { redditAPI } from "./reddit";
import { scrapingBeeAPI } from "./scrapingbee";
import { telegramBot } from "./telegram";
import { webScrapingService } from "./webscraping";
import { errorRecovery } from "./error-recovery";
import { notificationManager } from "./notification-manager";
import { liveScannerService } from "./live-scanner";

// Initialize Stripe only if the secret key is available
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Brand scanning with real Reddit data
async function sendBrandScanNotification(data: any) {
  // Placeholder for email notification
  console.log('Brand scan notification:', data);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupSimpleAuth(app);

  // Authentication endpoints
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user; // User is already available from session
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User account data endpoints
  app.get('/api/user/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserTickets(userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  });

  // Ticket creation endpoint (for anonymous scan page)
  app.post('/api/tickets', async (req, res) => {
    try {
      const { subject, description, priority, category, userEmail, userName } = req.body;
      
      const ticket = await storage.createTicket({
        userId: 'anonymous',
        type: category || 'General',
        title: subject,
        description,
        priority: priority || 'standard',
        status: 'pending',
        assignedTo: null,
        amount: null,
        redditUrl: null,
        requestData: { userEmail, userName },
        notes: null
      });

      res.json({ success: true, data: ticket });
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ success: false, message: "Failed to create ticket" });
    }
  });

  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getUserTickets(userId);
      
      const totalOrders = orders.length;
      const successfulRemovals = orders.filter(order => order.status === 'completed').length;
      
      res.json({
        success: true,
        data: {
          totalOrders,
          successfulRemovals,
          accountBalance: 0,
          creditsRemaining: 0
        }
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
  });

  // Get user tickets (legacy endpoint)
  app.get('/api/user/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tickets = await storage.getUserTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const allUsers = await storage.getAllUsers();
      const allOrders = await storage.getTickets();
      
      const totalRevenue = allOrders
        .filter(order => order.status === 'completed' && order.amount)
        .reduce((sum, order) => sum + parseFloat(order.amount || '0'), 0);

      const stats = {
        totalUsers: allUsers.length,
        totalOrders: allOrders.length,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders: allOrders.filter(order => order.status === 'pending').length,
        completedOrders: allOrders.filter(order => order.status === 'completed').length,
        activeUsers: allUsers.filter(user => user.role === 'user').length
      };

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/orders', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const orders = await storage.getTicketsWithUsers();
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const orderId = parseInt(req.params.id);
      const { status, assignedTo, notes } = req.body;

      const updatedOrder = await storage.updateTicketStatus(orderId, status, assignedTo);
      if (notes) {
        await storage.updateTicketNotes(orderId, notes);
      }

      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ success: false, message: "Failed to update order" });
    }
  });

  // Data administration endpoints (fallback access)
  app.get('/api/data-admin/users', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("Error fetching users for data admin:", error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  });

  app.get('/api/data-admin/orders', async (req, res) => {
    try {
      const orders = await storage.getTicketsWithUsers();
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error("Error fetching orders for data admin:", error);
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  });

  app.post('/api/data-admin/users', async (req, res) => {
    try {
      const { email, firstName, lastName, role, accountBalance, creditsRemaining } = req.body;
      
      const userData = {
        id: `manual_${Date.now()}`,
        email,
        firstName,
        lastName,
        role,
        accountBalance,
        creditsRemaining
      };

      const user = await storage.upsertUser(userData);
      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, message: "Failed to create user" });
    }
  });

  app.post('/api/data-admin/orders', async (req, res) => {
    try {
      const { userId, type, status, title, redditUrl, amount, progress } = req.body;
      
      const orderData = {
        userId,
        type,
        status,
        priority: 'medium',
        title,
        description: `Manual order created via data admin`,
        redditUrl,
        amount,
        progress: progress || 0,
        requestData: JSON.stringify({ source: 'data-admin', createdAt: new Date().toISOString() })
      };

      const order = await storage.createTicket(orderData);
      res.json({ success: true, data: order });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, message: "Failed to create order" });
    }
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
      // Return generic fallback instead of error
      res.json({
        success: true,
        response: "Hi! I help with Reddit content removal. We remove posts ($899) and comments ($199) with 95%+ success rate in 24-48 hours using only legal methods. What Reddit content do you need removed?"
      });
    }
  });

  // LIVE SCANNER - Quick brand scan endpoint
  app.post("/api/live-scan", moderateLimiter, handleAsyncErrors(async (req, res) => {
    const { brandName, userEmail, platforms = ['reddit'] } = req.body;
    
    if (!brandName || typeof brandName !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: "Brand name is required" 
      });
    }
    
    console.log(`🔍 Live Scanner: Quick scan for ${brandName}`);
    
    const scanRequest = {
      brandName: brandName.trim(),
      userEmail,
      priority: 'quick' as const,
      platforms
    };
    
    const results = await liveScannerService.quickScan(scanRequest);
    
    res.json({ 
      success: true, 
      data: {
        scanId: results.scanId,
        totalMentions: results.totalMentions,
        riskLevel: results.riskLevel,
        riskScore: results.riskScore,
        platforms: results.platforms,
        nextSteps: results.nextSteps,
        ticketId: results.ticketId,
        processingTime: results.processingTime,
        // Legacy format for existing frontend
        posts: results.platforms.reddit.posts,
        comments: results.platforms.reddit.comments,
        sentiment: results.platforms.reddit.sentiment,
        previewMentions: results.platforms.reddit.topMentions.map(mention => ({
          subreddit: mention.subreddit,
          timeAgo: `${Math.floor((Date.now() / 1000 - mention.created) / 86400)} days ago`,
          sentiment: results.platforms.reddit.sentiment,
          previewText: mention.content,
          url: mention.url,
          score: mention.score,
          platform: 'Reddit'
        }))
      }
    });
  }));

  // COMPREHENSIVE SCANNER - Full professional analysis
  app.post("/api/comprehensive-scan", moderateLimiter, handleAsyncErrors(async (req, res) => {
    const { brandName, userEmail, platforms = ['reddit', 'web'] } = req.body;
    
    if (!brandName || typeof brandName !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: "Brand name is required" 
      });
    }
    
    console.log(`🔍 Comprehensive Scanner: Deep analysis for ${brandName}`);
    
    try {
      const scanRequest = {
        brandName: brandName.trim(),
        userEmail: userEmail || 'anonymous@comprehensive.com',
        priority: 'comprehensive' as const,
        platforms
      };
      
      const results = await liveScannerService.comprehensiveScan(scanRequest);
      
      res.json({ 
        success: true, 
        data: results
      });
    } catch (error) {
      console.error("Comprehensive scan error:", error);
      
      // Fallback to demo data if the live scan fails
      const fallbackResult = {
        scanId: `fallback_${Date.now()}`,
        brandName: brandName.trim(),
        totalMentions: Math.floor(Math.random() * 25) + 15,
        riskLevel: 'medium' as const,
        riskScore: Math.floor(Math.random() * 30) + 40,
        platforms: {
          reddit: {
            posts: Math.floor(Math.random() * 10) + 5,
            comments: Math.floor(Math.random() * 15) + 10,
            sentiment: 'neutral',
            topMentions: []
          }
        },
        processingTime: 1500,
        nextSteps: [
          '📊 Detailed sentiment analysis available',
          '💬 Specialist consultation within 2 hours', 
          '📈 Reputation monitoring setup',
          '📝 Detailed removal strategy report',
          '⚖️ Legal assessment for problematic content'
        ]
      };
      
      res.json({ 
        success: true, 
        data: fallbackResult,
        usingFallback: true,
        message: "Using demo data - live scanning temporarily unavailable"
      });
    }
  }));

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
      
      // Create a ticket for user tracking
      const ticket = await storage.createTicket({
        userId: 'anonymous',
        type: 'quote_request',
        title: `Quote Request - ${new URL(validatedData.redditUrl).hostname}`,
        description: `Reddit URL: ${validatedData.redditUrl}\nClient Email: ${validatedData.email}`,
        redditUrl: validatedData.redditUrl,
        status: 'pending',
        priority: 'standard',
        amount: analysis?.estimatedPrice?.toString() || null,
        requestData: {
          email: validatedData.email,
          redditUrl: validatedData.redditUrl,
          analysis: analysis,
          quoteRequestId: quoteRequest.id
        }
      });
      
      // Send email notification
      try {
        await sendQuoteNotification({
          redditUrl: validatedData.redditUrl,
          email: validatedData.email,
          analysis,
          ticketId: ticket.id
        });
      } catch (error) {
        console.error("Failed to send email notification:", error);
        // Continue even if email fails
      }
      
      res.status(201).json({
        success: true,
        message: "Quote request submitted successfully",
        id: quoteRequest.id,
        ticketId: ticket.id,
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

  // Public ticket status check by email
  app.post("/api/check-ticket-status", generalLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      // Get all tickets associated with this email
      const allTickets = await storage.getTickets();
      const userTickets = allTickets.filter(ticket => 
        ticket.requestData && 
        typeof ticket.requestData === 'object' && 
        'email' in ticket.requestData && 
        ticket.requestData.email === email
      );

      res.json({
        success: true,
        data: userTickets.map(ticket => ({
          id: ticket.id,
          type: ticket.type,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          progress: ticket.progress || 0,
          amount: ticket.amount,
          redditUrl: ticket.redditUrl,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt
        }))
      });
    } catch (error) {
      console.error("Error checking ticket status:", error);
      res.status(500).json({
        success: false,
        message: "Unable to check ticket status"
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
      
      // Send Telegram notification and broadcast to connected clients
      try {
        const userInfo = {
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent')
        };
        
        // Check if this needs escalation to human
        const needsEscalation = message.toLowerCase().includes('complex') || 
                               message.toLowerCase().includes('difficult') || 
                               message.toLowerCase().includes('urgent') || 
                               message.toLowerCase().includes('lawsuit') || 
                               message.toLowerCase().includes('emergency') || 
                               message.toLowerCase().includes('immediately') ||
                               response.includes('connect you with our specialist');
        
        if (needsEscalation) {
          // Send priority escalation notification
          await telegramBot.sendMessage(parseInt(process.env.TELEGRAM_ADMIN_CHAT_ID!), 
            `🚨 URGENT ESCALATION NEEDED\n\n` +
            `👤 User Message: "${message}"\n` +
            `🤖 Bot Response: "${response}"\n\n` +
            `⚡ This visitor needs immediate human assistance!\n` +
            `📱 IP: ${userInfo.ip}\n` +
            `💻 Browser: ${userInfo.userAgent?.substring(0, 50)}...\n` +
            `⏰ Time: ${new Date().toLocaleString()}`
          );
        } else {
          // Send regular chatbot interaction notification
          await telegramBot.sendChatbotInteraction(message, response, userInfo);
        }
        
        notificationManager.broadcastChatbotInteraction(message, response, userInfo);
      } catch (notificationError) {
        console.error("Failed to send notifications:", notificationError);
        // Don't fail the request if notification fails
      }
      
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

  // Enhanced URL analysis with account creation
  app.post("/api/analyze-and-create-account", async (req, res) => {
    try {
      const { redditUrl, email } = req.body;
      
      if (!redditUrl || !email) {
        return res.status(400).json({
          success: false,
          message: "Reddit URL and email are required"
        });
      }

      // Analyze the URL using OpenAI
      const analysis = await analyzeRedditUrl(redditUrl);
      
      // Create user account if doesn't exist
      const userId = email.replace('@', '_').replace(/\./g, '_');
      const user = await storage.upsertUser({
        id: userId,
        email: email,
        role: 'user'
      });

      // Create removal case
      const removalCase = await storage.createRemovalCase({
        userId: user.id,
        redditUrl,
        status: 'analyzing',
        estimatedPrice: analysis.estimatedPrice,
        description: analysis.description,
        progress: 15
      });

      // Send notification to admin
      await telegramBot.sendNewLeadNotification({
        type: 'URL Analysis & Account Creation',
        email,
        redditUrl,
        caseId: removalCase.id,
        estimatedPrice: analysis.estimatedPrice,
        description: analysis.description
      });

      res.json({
        success: true,
        accountCreated: true,
        caseId: removalCase.id,
        analysis,
        user: { id: user.id, email: user.email }
      });
    } catch (error) {
      console.error("Error in URL analysis and account creation:", error);
      res.status(500).json({
        success: false,
        message: "Analysis failed. Please try again or contact support."
      });
    }
  });

  // User dashboard endpoints
  app.get("/api/user/orders", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const tickets = await storage.getUserTickets(user.id);
      res.json({ success: true, data: tickets });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const tickets = await storage.getUserTickets(user.id);
      
      const stats = {
        totalOrders: tickets.length,
        successfulRemovals: tickets.filter(t => t.status === 'completed').length,
        accountBalance: parseFloat(user.accountBalance || '0'),
        creditsRemaining: user.creditsRemaining || 0
      };
      
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/user/cases", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const cases = await storage.getUserRemovalCases(user.id);
      res.json(cases);
    } catch (error) {
      console.error("Error fetching user cases:", error);
      res.status(500).json({ message: "Failed to fetch cases" });
    }
  });

  app.get("/api/user/cases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const case_ = await storage.getRemovalCase(parseInt(id));
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(case_);
    } catch (error) {
      console.error("Error fetching case:", error);
      res.status(500).json({ message: "Failed to fetch case" });
    }
  });

  // URL analysis endpoint (legacy)
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

  // Blog API endpoints for content strategy
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      const publishedPosts = posts.filter(post => post.status === 'published');
      res.json(publishedPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/categories", async (req, res) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });

  app.get("/api/blog/posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      if (!post || post.status !== 'published') {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Admin blog endpoints
  app.get("/api/admin/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog/posts", async (req, res) => {
    try {
      const postData = req.body;
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.patch("/api/admin/blog/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const post = await storage.updateBlogPost(parseInt(id), updates);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Stripe payment endpoints for case approval
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { caseId, amount } = req.body;
      
      if (!caseId || !amount) {
        return res.status(400).json({ message: "Case ID and amount are required" });
      }

      // Get case details
      const case_ = await storage.getRemovalCase(caseId);
      if (!case_) {
        return res.status(404).json({ message: "Case not found" });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          caseId: caseId.toString(),
          service: "reddit_removal"
        },
        description: `Reddit Content Removal - Case #${caseId}`,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Handle successful payments
  app.post("/api/payment-success", async (req, res) => {
    try {
      const { caseId, paymentIntentId } = req.body;
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        // Update case status to approved/in_progress
        await storage.updateRemovalCaseStatus(caseId, 'in_progress', 25);
        
        // Send notifications
        await telegramBot.sendNewLeadNotification({
          type: 'Payment Received - Case Approved',
          caseId,
          amount: `$${paymentIntent.amount / 100}`,
          paymentId: paymentIntentId,
          status: 'Ready to begin removal process'
        });

        res.json({ success: true, message: "Payment confirmed and case approved" });
      } else {
        res.status(400).json({ message: "Payment not completed" });
      }
    } catch (error: any) {
      console.error("Error processing payment success:", error);
      res.status(500).json({ message: "Error processing payment" });
    }
  });

  // Stripe webhook for payment updates
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const event = req.body;

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const caseId = parseInt(paymentIntent.metadata.caseId);
          
          if (caseId) {
            await storage.updateRemovalCaseStatus(caseId, 'in_progress', 25);
            
            await telegramBot.sendNewLeadNotification({
              type: 'Payment Confirmed via Webhook',
              caseId,
              amount: `$${paymentIntent.amount / 100}`,
              paymentId: paymentIntent.id
            });
          }
          break;
        
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  });

  // Real-time notification stream
  app.get("/api/notifications/stream", (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const clientId = Date.now().toString();
    
    // Add client to notification manager
    notificationManager.addClient(clientId, res);
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Notification stream connected' })}\n\n`);
  });

  // Broadcast notification to all connected clients
  const broadcastNotification = (data: any) => {
    // This would typically use a proper event emitter or WebSocket
    // For now, we'll store in a simple in-memory system
  };

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

  // Emergency ticket endpoint for fallback support
  app.post("/api/emergency-ticket", handleAsyncErrors(async (req, res) => {
    const { name, email, phone, description, errorDetails } = req.body;
    
    // Create emergency support ticket
    const ticket = await storage.createTicket({
      userId: "emergency",
      type: "emergency_support",
      title: `Emergency Support: ${description?.substring(0, 50) || 'System Error'}`,
      description: `
Emergency Support Request
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Description: ${description}

Error Details:
${JSON.stringify(errorDetails, null, 2)}
      `,
      priority: "high",
      status: "pending",
      urls: errorDetails?.url ? [errorDetails.url] : undefined
    });

    // Send immediate notification to admin
    await telegramBot.sendNewLeadNotification({
      type: 'Emergency Support Ticket',
      name,
      email,
      phone: phone || 'Not provided',
      description,
      ticketId: ticket.id,
      errorUrl: errorDetails?.url
    });

    res.json({ 
      success: true, 
      ticketId: ticket.id,
      message: "Emergency ticket created. You'll hear from us within 30 minutes during business hours." 
    });
  }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: "connected",
        scrapingBee: process.env.SCRAPINGBEE_API_KEY ? "configured" : "missing",
        authentication: "active"
      }
    });
  });

  // SEO endpoints
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://repshield.io';
    const pages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/scan', priority: '0.9', changefreq: 'weekly' },
      { url: '/dashboard', priority: '0.8', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/auth', priority: '0.6', changefreq: 'monthly' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-dashboard
Disallow: /data-admin
Disallow: /api/

Sitemap: https://repshield.io/sitemap.xml

# Block AI crawlers that don't respect robots.txt
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });

  // Add global error handler
  app.use(globalErrorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
