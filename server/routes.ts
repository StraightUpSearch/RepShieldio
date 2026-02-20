import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { isStripeConfigured, createTicketCheckoutSession, createCreditPurchaseSession, createSubscriptionCheckoutSession, cancelStripeSubscription, constructWebhookEvent, CREDIT_PACKAGES } from './stripe';
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simple-auth";
import { insertAuditRequestSchema, insertQuoteRequestSchema, insertBrandScanTicketSchema } from "@shared/schema";
import { globalErrorHandler, handleAsyncErrors, AppError } from "./error-handler";
import { validateInput, brandScanSchema, contactSchema, chatbotSchema, emergencyTicketSchema, dataAdminUserSchema, dataAdminOrderSchema, scanBrandRequestSchema, ticketSchema } from "./validation";
import { strictLimiter, moderateLimiter, generalLimiter } from "./rate-limiter";
import { ticketLifecycle } from './ticket-lifecycle';
import { trackEvent, FUNNEL_EVENTS } from './analytics';
import { isOpenAIConfigured, generateSpecialistReport, getChatbotResponse } from './openai';
import { sendWelcomeEmail } from './email';
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

// Admin middleware
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await storage.getUser(req.user.id);
    if (user?.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    next(err);
  }
};

// Brand scanning with real Reddit data
async function sendBrandScanNotification(data: any) {
  // Placeholder for email notification
  console.log('Brand scan notification:', data);
}

// Auto-wrap async route handlers to forward errors to Express error handler.
// This ensures that any unhandled promise rejections inside async route handlers
// or middleware are caught and forwarded to Express's error-handling pipeline
// via next(err), rather than causing an unhandled rejection crash.
function wrapAsync(app: Express): Express {
  const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
  for (const method of methods) {
    const original = app[method].bind(app);
    (app as any)[method] = (path: string, ...handlers: any[]) => {
      const wrapped = handlers.map((handler: any) => {
        // Only wrap functions with <= 3 params (req, res, next).
        // Express error handlers have 4 params (err, req, res, next) and must not be wrapped.
        if (typeof handler === 'function' && handler.length <= 3) {
          return (req: any, res: any, next: any) => {
            try {
              const result = handler(req, res, next);
              if (result && typeof result.catch === 'function') {
                result.catch((err: any) => {
                  // Only forward if headers haven't been sent (avoids double-response)
                  if (!res.headersSent) {
                    next(err);
                  } else {
                    console.error('[wrapAsync] Error after headers sent:', err.message || err);
                  }
                });
              }
            } catch (err) {
              // Catch synchronous throws as well
              if (!res.headersSent) {
                next(err);
              } else {
                console.error('[wrapAsync] Sync error after headers sent:', (err as Error).message || err);
              }
            }
          };
        }
        return handler;
      });
      return original(path, ...wrapped);
    };
  }
  return app;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auto-wrap all async route handlers for proper error forwarding
  wrapAsync(app);

  // Initialize database tables on startup
  await initializeDatabase();

  // Setup authentication middleware
  await setupSimpleAuth(app);

  // Authentication endpoints - Allow checking auth status without requiring login
  app.get('/api/auth/user', async (req: any, res) => {
    try {
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

      if (!subject || !description) {
        return res.status(400).json({ success: false, message: "Subject and description are required" });
      }
      
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

      // If status changed, fire lifecycle events
      if (status) {
        try {
          await ticketLifecycle.transitionTicket({
            ticketId: orderId,
            newStatus: status,
            assignedTo,
            notes,
          });
        } catch (lifecycleErr) {
          console.error('Lifecycle transition error:', lifecycleErr);
        }
      }

      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ success: false, message: "Failed to update order" });
    }
  });

  // Data administration endpoints (fallback access)
  app.get('/api/data-admin/users', isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("Error fetching users for data admin:", error);
      res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
  });

  app.get('/api/data-admin/orders', isAdmin, async (req: any, res) => {
    try {
      const orders = await storage.getTicketsWithUsers();
      res.json({ success: true, data: orders });
    } catch (error) {
      console.error("Error fetching orders for data admin:", error);
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  });

  app.post('/api/data-admin/users', isAdmin, async (req: any, res) => {
    try {
      const validated = validateInput(dataAdminUserSchema, req.body);

      const userData = {
        id: `manual_${Date.now()}`,
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        role: validated.role,
        accountBalance: validated.accountBalance,
        creditsRemaining: validated.creditsRemaining,
      };

      const user = await storage.upsertUser(userData);
      res.json({ success: true, data: user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ success: false, message: "Failed to create user" });
    }
  });

  app.post('/api/data-admin/orders', isAdmin, async (req: any, res) => {
    try {
      const validated = validateInput(dataAdminOrderSchema, req.body);

      const orderData = {
        userId: validated.userId,
        type: validated.type,
        status: validated.status,
        priority: 'medium',
        title: validated.title,
        description: `Manual order created via data admin`,
        redditUrl: validated.redditUrl,
        amount: validated.amount,
        progress: validated.progress || 0,
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
  app.get('/api/admin/tickets', isAdmin, async (req: any, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching admin tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.patch('/api/admin/tickets/:id', isAdmin, async (req: any, res) => {
    try {
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
    } catch (error) {
      console.error("Error updating admin ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  // Monitoring subscription endpoint
  app.post('/api/monitoring/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const { planId } = req.body;
      const userId = req.user.id;

      const existing = await storage.getUserSubscription(userId);
      if (existing && existing.status === 'active') {
        return res.status(400).json({ message: 'You already have an active subscription' });
      }

      if (isStripeConfigured()) {
        try {
          const base = process.env.RESET_URL_BASE || 'http://localhost:3000';
          const session = await createSubscriptionCheckoutSession({
            userId,
            planId,
            customerEmail: req.user.email,
            successUrl: `${base}/monitoring?subscribed=true`,
            cancelUrl: `${base}/monitoring?cancelled=true`,
          });
          return res.json({ success: true, checkoutUrl: session.url });
        } catch (stripeError) {
          console.error('Stripe subscription error:', stripeError);
          // Fall through to manual flow
        }
      }

      // Manual flow when Stripe not available
      const subscription = await storage.createSubscription({
        userId,
        planId,
        status: 'pending',
      });

      await trackEvent(FUNNEL_EVENTS.SUBSCRIPTION_CREATED, userId, undefined, { planId });

      try {
        await telegramBot.sendNewLeadNotification({
          type: 'Monitoring Subscription Request',
          name: req.user.firstName || req.user.email,
          email: req.user.email,
          planId,
        });
      } catch {}

      res.json({ success: true, subscription, message: 'Subscription request submitted. We will contact you to set up billing.' });
    } catch (error) {
      console.error("Monitoring subscription error:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  // AI Chatbot endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const validated = validateInput(chatbotSchema, req.body);
      const { message, conversationHistory } = validated;

      const response = await getChatbotResponse(message, conversationHistory as any);
      
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

    await trackEvent(FUNNEL_EVENTS.SCAN_STARTED, req.user?.id, undefined, { brandName });

    console.log(`🔍 Live Scanner: Quick scan for ${brandName}`);
    
    const scanRequest = {
      brandName: brandName.trim(),
      userEmail,
      priority: 'quick' as const,
      platforms
    };
    
    const results = await liveScannerService.quickScan(scanRequest);

    await trackEvent(FUNNEL_EVENTS.SCAN_COMPLETED, req.user?.id, undefined, { brandName, totalMentions: results.totalMentions });

    // Persist scan result to database
    try {
      await storage.saveScanResult({
        scanId: results.scanId,
        userId: req.user?.id || null,
        brandName,
        scanType: 'quick',
        totalMentions: results.totalMentions,
        riskLevel: results.riskLevel,
        riskScore: results.riskScore,
        platformData: results.platforms,
        processingTime: results.processingTime,
      });
    } catch (err) {
      console.error('Failed to persist scan result:', err);
    }

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
        userEmail: userEmail || 'unregistered@repshield.io',
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
      const validated = validateInput(scanBrandRequestSchema, req.body);
      const { brandName, includePlatforms } = validated;

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
      const validatedData: any = insertAuditRequestSchema.parse(req.body);

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
      
      await trackEvent(FUNNEL_EVENTS.TICKET_CREATED, userId, undefined, { redditUrl });

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

      // Auto-generate AI draft report if OpenAI is configured
      if (isOpenAIConfigured()) {
        try {
          const draftReport = await generateSpecialistReport({ redditUrl, contentType: 'removal_request' });
          if (draftReport) {
            await storage.updateTicketNotes(ticket.id, `AI DRAFT REPORT:\n${draftReport}`);
          }
        } catch (err) {
          console.error('Failed to auto-generate report:', err);
        }
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
  app.post("/api/tickets/:ticketId/reply", isAuthenticated, async (req: any, res) => {
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

      // Use ticket lifecycle to transition and send notifications
      await ticketLifecycle.transitionTicket({
        ticketId,
        newStatus: 'quoted',
        notes: specialistReply,
        amount: quote,
      });
      
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

  // Analyze URL and create account/case (used by dashboard)
  app.post("/api/analyze-and-create-account", isAuthenticated, async (req: any, res) => {
    try {
      const { redditUrl, email } = req.body;

      if (!redditUrl) {
        return res.status(400).json({ success: false, message: "Reddit URL is required" });
      }

      try {
        new URL(redditUrl);
        if (!redditUrl.includes('reddit.com')) throw new Error('Must be a Reddit URL');
      } catch {
        return res.status(400).json({ success: false, message: "Invalid Reddit URL" });
      }

      const userId = req.user.id;
      const isPost = /\/comments\//.test(redditUrl);
      const contentType = isPost ? 'reddit_post_removal' : 'reddit_comment_removal';
      const estimatedPrice = isPost ? '$899' : '$199';

      const ticket = await storage.createTicket({
        userId,
        type: contentType,
        title: `Reddit Removal - ${new URL(redditUrl).pathname.substring(0, 60)}`,
        description: `Client requesting removal of Reddit content:\n${redditUrl}\n\nClient Email: ${email || req.user.email}`,
        redditUrl,
        status: 'pending',
        priority: 'standard',
        amount: estimatedPrice.replace('$', ''),
        requestData: { email: email || req.user.email, redditUrl, submittedAt: new Date().toISOString() },
      });

      res.json({
        success: true,
        caseId: ticket.id,
        analysis: {
          contentType: isPost ? 'Reddit Post' : 'Reddit Comment',
          estimatedPrice,
          description: `Professional removal of Reddit content. Estimated cost: ${estimatedPrice}`,
        },
      });
    } catch (error) {
      console.error("Error in analyze-and-create-account:", error);
      res.status(500).json({ success: false, message: "Failed to analyze URL" });
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
      const validatedData: any = insertBrandScanTicketSchema.parse(ticketData);
      
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

      await trackEvent(FUNNEL_EVENTS.LEAD_FORM_SUBMITTED, userId, undefined, { brandName: validatedData.name || validatedData.company });

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
  app.get("/api/admin/blog/posts", isAdmin, async (req: any, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog/posts", isAdmin, async (req: any, res) => {
    try {
      const postData = req.body;
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.patch("/api/admin/blog/posts/:id", isAdmin, async (req: any, res) => {
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

  app.delete("/api/admin/blog/posts/:id", isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlogPost(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // ============ PAYMENT ROUTES ============

  // Check if Stripe is configured
  app.get('/api/payments/status', (req, res) => {
    res.json({
      stripeConfigured: isStripeConfigured(),
      creditPackages: CREDIT_PACKAGES,
    });
  });

  // Create checkout session for a quoted ticket
  app.post('/api/payments/create-checkout', isAuthenticated, async (req: any, res) => {
    if (!isStripeConfigured()) {
      return res.status(503).json({ message: 'Payment processing not available. Contact support.' });
    }
    try {
      const { ticketId } = req.body;
      const ticket = await storage.getTicket(ticketId);
      if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
      if (ticket.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      const amount = Math.round(parseFloat(ticket.amount || '899') * 100);
      const base = process.env.RESET_URL_BASE || 'http://localhost:3000';

      const session = await createTicketCheckoutSession({
        ticketId: ticket.id,
        amount,
        description: ticket.title || 'Content removal service',
        customerEmail: req.user.email,
        successUrl: `${base}/my-account?payment=success&ticket=${ticketId}`,
        cancelUrl: `${base}/dashboard?payment=cancelled`,
      });

      res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Checkout session error:', error);
      res.status(500).json({ message: 'Failed to create checkout session' });
    }
  });

  // Create checkout session for credit purchase
  app.post('/api/payments/create-credit-purchase', isAuthenticated, async (req: any, res) => {
    if (!isStripeConfigured()) {
      return res.status(503).json({ message: 'Payment processing not available. Contact support.' });
    }
    try {
      const { packageId } = req.body;
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      if (!pkg) return res.status(400).json({ message: 'Invalid credit package' });

      const base = process.env.RESET_URL_BASE || 'http://localhost:3000';

      const session = await createCreditPurchaseSession({
        userId: req.user.id,
        credits: pkg.credits,
        amount: pkg.price,
        customerEmail: req.user.email,
        successUrl: `${base}/my-account?tab=wallet&credits=purchased`,
        cancelUrl: `${base}/my-account?tab=wallet&credits=cancelled`,
      });

      res.json({ success: true, sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Credit purchase error:', error);
      res.status(500).json({ message: 'Failed to create credit purchase session' });
    }
  });

  // User transactions
  app.get('/api/user/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const txns = await storage.getUserTransactions(req.user.id);
      res.json({ success: true, data: txns });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  // User scan history
  app.get('/api/user/scan-history', isAuthenticated, async (req: any, res) => {
    try {
      const history = await storage.getUserScanHistory(req.user.id);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error fetching scan history:', error);
      res.status(500).json({ message: 'Failed to fetch scan history' });
    }
  });

  // User subscription
  app.get('/api/user/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const sub = await storage.getUserSubscription(req.user.id);
      res.json({ success: true, data: sub || null });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  // ============ MONITORING SUBSCRIPTION ROUTES ============

  // Cancel monitoring subscription
  app.post('/api/monitoring/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const sub = await storage.getUserSubscription(req.user.id);
      if (!sub) return res.status(404).json({ message: 'No active subscription' });

      if (sub.stripeSubscriptionId && isStripeConfigured()) {
        await cancelStripeSubscription(sub.stripeSubscriptionId);
      }
      await storage.cancelSubscription(sub.id);
      res.json({ success: true, message: 'Subscription cancelled' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // ============ STRIPE WEBHOOK ============

  // Stripe webhook - must use raw body (not JSON parsed)
  app.post('/api/webhooks/stripe', async (req, res) => {
    if (!isStripeConfigured()) {
      return res.status(503).send('Stripe not configured');
    }

    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      return res.status(400).send('Missing stripe-signature header');
    }

    try {
      // req.body is raw buffer when express.raw() middleware is applied for this route
      const rawBody = typeof req.body === 'string' || Buffer.isBuffer(req.body)
        ? req.body
        : JSON.stringify(req.body);

      const event = await constructWebhookEvent(rawBody, sig);

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const metadata = session.metadata || {};

          if (metadata.type === 'ticket_payment' && metadata.ticketId) {
            const ticketId = parseInt(metadata.ticketId);
            await storage.updateTicketStatus(ticketId, 'approved');
            await storage.createTransaction({
              userId: metadata.userId || session.customer_email || 'stripe',
              type: 'ticket_payment',
              amount: String((session.amount_total || 0) / 100),
              description: `Payment for ticket #${ticketId}`,
              ticketId,
              status: 'completed',
            });
            try {
              await ticketLifecycle.transitionTicket({ ticketId, newStatus: 'approved' });
            } catch {}
          }

          if (metadata.type === 'credit_purchase' && metadata.userId) {
            const credits = parseInt(metadata.credits || '0');
            await storage.addCredits(
              metadata.userId,
              credits,
              `Purchased ${credits} scan credits`,
            );
          }

          if (metadata.type === 'subscription' && metadata.userId) {
            await storage.createSubscription({
              userId: metadata.userId,
              planId: metadata.planId || 'unknown',
              status: 'active',
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const sub = event.data.object as any;
          if (sub.id) {
            try {
              await storage.cancelSubscription(sub.id);
            } catch {}
          }
          break;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(400).send('Webhook signature verification failed');
    }
  });

  // ============ ANALYTICS ROUTES ============

  // Track client-side funnel events
  app.post('/api/analytics/track', async (req: any, res) => {
    const { eventType, metadata, sessionId } = req.body;
    await trackEvent(eventType, req.user?.id, sessionId, metadata);
    res.json({ success: true });
  });

  // Admin analytics dashboard
  app.get('/api/admin/analytics', isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getFunnelStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
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
    const validated = validateInput(emergencyTicketSchema, req.body);
    const { name, email, phone, description, errorDetails } = validated;
    
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
      redditUrl: (errorDetails?.url as string) || null,
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
  app.get("/api/health", async (req, res) => {
    // Database connectivity check with timeout
    let dbStatus: "connected" | "disconnected" = "disconnected";
    try {
      await Promise.race([
        storage.getUser("__health_check__"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 2000)),
      ]);
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }

    // Read version from package.json (works with both CJS and ESM)
    let version = "unknown";
    try {
      const { readFileSync } = await import("fs");
      const { resolve } = await import("path");
      const pkg = JSON.parse(
        readFileSync(resolve(import.meta.dirname, "..", "package.json"), "utf-8"),
      );
      version = pkg.version;
    } catch {
      // Fallback if file read fails
    }

    res.json({
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version,
      database: dbStatus,
      services: {
        stripe: isStripeConfigured() ? "configured" : "not configured",
        openai: isOpenAIConfigured() ? "configured" : "not configured",
        email: process.env.SENDGRID_API_KEY ? "configured" : "not configured",
        scrapingBee: process.env.SCRAPINGBEE_API_KEY ? "configured" : "missing",
        authentication: "active",
      },
    });
  });

  // SEO endpoints
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://repshield.io';
    const pages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/scan', priority: '0.9', changefreq: 'weekly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/blog', priority: '0.8', changefreq: 'weekly' },
      { url: '/monitoring', priority: '0.8', changefreq: 'monthly' },
      { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
      { url: '/legal-compliance', priority: '0.3', changefreq: 'yearly' },
      { url: '/login', priority: '0.5', changefreq: 'monthly' },
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
      
      res.json({ message: "If an account with this email exists, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  }));

  app.post("/api/auth/reset-password", moderateLimiter, handleAsyncErrors(async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Find and validate the reset token
      const validToken = await storage.getValidPasswordResetToken(token);
      if (!validToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Get the user
      const targetUser = await storage.getUser(validToken.userId);
      if (!targetUser) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
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
      
      res.json({ message: "Password reset successful. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password. Please try again or contact support." });
    }
  }));

  // Catch-all for unknown /api/* routes — returns JSON 404 instead of the
  // SPA's index.html, so typo'd API URLs get a proper error response.
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Add global error handler
  app.use(globalErrorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
