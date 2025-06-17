import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
// DEPRECATED: Stripe integration removed for simplified workflow
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simple-auth";
import { insertAuditRequestSchema, insertQuoteRequestSchema, insertBrandScanTicketSchema } from "@shared/schema";
import { globalErrorHandler, handleAsyncErrors, AppError } from "./error-handler";
import { validateInput, brandScanSchema, contactSchema } from "./validation";
import { strictLimiter, moderateLimiter, generalLimiter } from "./rate-limiter";
// DEPRECATED: OpenAI integration removed for simplified workflow
import { sendQuoteNotification, sendContactNotification, sendPasswordResetEmail } from "./email";
import { redditAPI } from "./reddit";
import { scrapingBeeAPI } from "./scrapingbee";
import { telegramBot } from "./telegram";
import { webScrapingService } from "./webscraping";
import { errorRecovery } from "./error-recovery";
import { notificationManager } from "./notification-manager";
import { liveScannerService } from "./live-scanner";
import { randomBytes } from "crypto";
import { initializeDatabase } from "./db-init";

// DEPRECATED: Stripe initialization removed for simplified workflow

// Brand scanning with real Reddit data
async function sendBrandScanNotification(data: any) {
  // Placeholder for email notification
  console.log('Brand scan notification:', data);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database tables on startup
  await initializeDatabase();
  
  // Setup authentication middleware
  await setupSimpleAuth(app);

  // Health check endpoint for monitoring
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown',
      database: 'connected'
    });
  });

  // Authentication endpoints - Allow checking auth status without requiring login
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log("Auth user check:", {
        isAuthenticated: req.isAuthenticated(),
        hasUser: !!req.user,
        sessionID: req.sessionID,
        session: Object.keys(req.session)
      });

      if (!req.user) {
        return res.status(401).json({ 
          authenticated: false, 
          message: "Unauthorized" 
        });
      }

      // Get user tickets with proper timezone formatting
      const userTickets = await storage.getUserTickets(req.user.id);
      
      // Format tickets for frontend display
      const formattedTickets = userTickets.map(ticket => ({
        id: ticket.id,
        ticketId: `REP-${ticket.id.toString().padStart(4, '0')}`,
        redditUrl: ticket.redditUrl,
        clientEmail: req.user.email,
        status: ticket.status,
        specialistReply: ticket.notes || 'Pending specialist review',
        timestamp: ticket.createdAt.toLocaleString('en-GB', {
          timeZone: 'Europe/London',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      }));

      res.json({ 
        authenticated: true, 
        user: {
          ...req.user,
          tickets: formattedTickets
        }
      });
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
      const tickets = await storage.getUserTickets(userId);
      
      const stats = {
        totalOrders: tickets.length,
        successfulRemovals: tickets.filter(t => t.status === 'completed').length,
        accountBalance: parseFloat(req.user.accountBalance || '0'),
        creditsRemaining: req.user.creditsRemaining || 0
      };
      
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
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

  // Simplified quote request submission endpoint - creates ticket directly
  app.post("/api/quote-request", generalLimiter, async (req, res) => {
    try {
      console.log("Quote request received:", JSON.stringify(req.body, null, 2));
      
      // Validate required fields
      if (!req.body.redditUrl || !req.body.email) {
        return res.status(400).json({
          success: false,
          message: "Reddit URL and email are required",
          received: Object.keys(req.body)
        });
      }

      const { redditUrl, email } = req.body;
      
      // Basic URL validation
      try {
        new URL(redditUrl);
        if (!redditUrl.includes('reddit.com')) {
          throw new Error('Must be a Reddit URL');
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid Reddit URL provided"
        });
      }
      
      // Create or find user based on email to satisfy foreign key constraint
      const userId = email.replace('@', '_').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const user = await storage.upsertUser({
        id: userId,
        email: email,
        role: 'user',
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        password: null,
        accountBalance: "0.00",
        creditsRemaining: 0
      });

      // Create ticket directly - no legacy quote request table needed
      const ticket = await storage.createTicket({
        userId: user.id,
        type: 'removal_request',
        title: `Reddit Removal Request - ${new URL(redditUrl).pathname}`,
        description: `Client requesting removal of Reddit content:\n${redditUrl}\n\nClient Email: ${email}`,
        redditUrl: redditUrl,
        status: 'pending',
        priority: 'standard',
        amount: null, // To be determined by specialist
        requestData: {
          email: email,
          redditUrl: redditUrl,
          submittedAt: new Date().toISOString()
        }
      });
      
      // Send notification to specialist team
      try {
        await sendQuoteNotification({
          redditUrl: redditUrl,
          email: email,
          ticketId: ticket.id
        });
        console.log(`✅ Specialist notification sent for ticket ${ticket.id}`);
      } catch (error) {
        console.error("Failed to send specialist notification:", error);
        // Continue even if email fails - ticket is still created
      }
      
      res.status(201).json({
        success: true,
        message: "Quote request submitted successfully. Our specialist will review and respond within 24 hours.",
        ticketId: ticket.id,
        ticketNumber: `REP-${ticket.id.toString().padStart(4, '0')}`
      });
    } catch (error) {
      console.error("Error creating quote request:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  // Specialist reply endpoint for adding report and quote to ticket
  app.post("/api/tickets/:ticketId/reply", isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const { report, quote, estimatedTime } = req.body;
      
      // Verify user is admin/specialist
      const user = await storage.getUser(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Access denied. Only specialists can reply to tickets."
        });
      }
      
      if (!report || !quote) {
        return res.status(400).json({
          success: false,
          message: "Report and quote are required"
        });
      }
      
      // Get the ticket to update
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Ticket not found"
        });
      }
      
      // Update ticket with specialist reply
      const specialistReply = `
SPECIALIST REPORT:
${report}

QUOTE: ${quote}
${estimatedTime ? `ESTIMATED TIME: ${estimatedTime}` : ''}

Replied by: ${user.email}
Date: ${new Date().toISOString()}
      `.trim();
      
      // Update ticket status and add notes
      await storage.updateTicketStatus(ticketId, 'quoted', user.email);
      await storage.updateTicketNotes(ticketId, specialistReply);
      
      // TODO: Send email notification to client about the quote
      const clientEmail = ticket.requestData?.email;
      if (clientEmail) {
        console.log(`📧 TODO: Send quote email to ${clientEmail} for ticket ${ticketId}`);
      }
      
      res.json({
        success: true,
        message: "Specialist reply added successfully",
        ticketId: ticketId
      });
    } catch (error) {
      console.error("Error adding specialist reply:", error);
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

  // DEPRECATED: OpenAI chatbot endpoint removed for simplified workflow
  app.post("/api/chatbot", async (req, res) => {
    res.json({
      success: true,
      response: "Hello! I'm here to help with Reddit content removal. For the fastest service, please submit your Reddit URL using our quote request form, and our specialist will respond within 24 hours with a custom analysis and quote."
    });
  });

  // DEPRECATED: OpenAI URL analysis endpoint removed for simplified workflow

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

  // DEPRECATED: OpenAI URL analysis endpoint removed for simplified workflow
  app.post("/api/analyze-url", async (req, res) => {
    res.json({
      success: true,
      analysis: {
        contentType: "Reddit content",
        estimatedPrice: "Contact specialist for quote",
        description: "Please submit a quote request for professional analysis and pricing."
      }
    });
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

  // DEPRECATED: Stripe payment endpoints removed for simplified workflow
  // Payment processing will be handled manually by specialists

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

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      console.log("User logged out successfully");
      res.json({ message: "Logout successful" });
    });
  });

  // Password reset endpoints
  app.post("/api/auth/forgot-password", moderateLimiter, handleAsyncErrors(async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with this email exists, you will receive a password reset link." });
      }
      
      // Generate cryptographically secure reset token
      const resetToken = randomBytes(32).toString('hex');
      const TOKEN_EXPIRATION_HOURS = 24; // Configurable expiration
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);
      
      // Store reset token
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);
      
      // Send reset email
      await sendPasswordResetEmail({
        email: user.email,
        resetToken,
        userName: user.firstName || undefined
      });
      
      console.log(`Password reset email sent to: ${email}`);
      res.json({ message: "If an account with this email exists, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  }));

  app.post("/api/auth/reset-password", moderateLimiter, handleAsyncErrors(async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      console.log(`Password reset attempt with token: ${token ? token.substring(0, 8) + '...' : 'missing'}`);
      
      if (!token || !newPassword) {
        console.log("Password reset failed: Missing token or password");
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      if (newPassword.length < 6) {
        console.log("Password reset failed: Password too short");
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Find and validate the reset token
      const validToken = await storage.getValidPasswordResetToken(token);
      if (!validToken) {
        console.log(`Password reset failed: Invalid or expired token for ${token.substring(0, 8)}...`);
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Get the user
      const targetUser = await storage.getUser(validToken.userId);
      if (!targetUser) {
        console.log(`Password reset failed: User not found for ID ${validToken.userId}`);
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      console.log(`Password reset proceeding for user: ${targetUser.email}`);
      
      // Hash new password (import required functions from simple-auth)
      const { hashPassword } = await import('./simple-auth');
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user password
      await storage.upsertUser({
        ...targetUser,
        password: hashedPassword,
        updatedAt: new Date()
      });
      
      // Delete the used reset token
      await storage.deletePasswordResetToken(targetUser.id, token);
      
      console.log(`Password reset successful for user: ${targetUser.email}`);
      res.json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password. Please try again or contact support." });
    }
  }));

  // Add global error handler
  app.use(globalErrorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
