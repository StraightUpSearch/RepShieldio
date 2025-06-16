import OpenAI from "openai";

// Make OpenAI optional for both development and production
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
}) : null;

if (!openai) {
  const envMsg = process.env.NODE_ENV === 'production' ? 'production (using fallback responses)' : 'development';
  console.log(`🤖 OpenAI not configured for ${envMsg} - using fallback chatbot responses`);
}

// Rate limiting and retry configuration
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second base delay
  maxDelay: 30000, // 30 seconds max delay
  backoffMultiplier: 2
};

// Simple in-memory rate limiter (replace with Redis in production)
const rateLimitState = {
  requestCount: 0,
  windowStart: Date.now(),
  windowSize: 60000, // 1 minute window
  maxRequests: 50 // Conservative limit
};

function checkRateLimit(): boolean {
  const now = Date.now();
  
  // Reset window if expired
  if (now - rateLimitState.windowStart > rateLimitState.windowSize) {
    rateLimitState.requestCount = 0;
    rateLimitState.windowStart = now;
  }
  
  // Check if under limit
  if (rateLimitState.requestCount >= rateLimitState.maxRequests) {
    console.warn('⚠️ OpenAI rate limit reached, using fallback');
    return false;
  }
  
  rateLimitState.requestCount++;
  return true;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt < RATE_LIMIT_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(
          RATE_LIMIT_CONFIG.baseDelay * Math.pow(RATE_LIMIT_CONFIG.backoffMultiplier, attempt - 1),
          RATE_LIMIT_CONFIG.maxDelay
        );
        console.log(`🔄 Retrying ${context} in ${delay}ms (attempt ${attempt + 1}/${RATE_LIMIT_CONFIG.maxRetries})`);
        await sleep(delay);
      }
      
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Handle specific OpenAI errors
      if (error?.status === 429) {
        console.warn(`⚠️ OpenAI rate limit hit during ${context}, attempt ${attempt + 1}`);
        
        // Respect Retry-After header if present
        const retryAfter = error?.headers?.['retry-after'];
        if (retryAfter && attempt < RATE_LIMIT_CONFIG.maxRetries - 1) {
          const retryDelay = parseInt(retryAfter) * 1000;
          console.log(`⏳ Waiting ${retryDelay}ms as requested by OpenAI`);
          await sleep(Math.min(retryDelay, RATE_LIMIT_CONFIG.maxDelay));
        }
        continue;
      }
      
      // Handle quota exceeded
      if (error?.status === 403 || (error?.message && error.message.includes('quota'))) {
        console.error(`❌ OpenAI quota exceeded during ${context}`);
        throw new Error('OpenAI quota exceeded - using fallback response');
      }
      
      // Handle timeout or network errors
      if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
        console.warn(`⚠️ Network error during ${context}, attempt ${attempt + 1}`);
        continue;
      }
      
      // For other errors, don't retry
      console.error(`❌ Non-retryable error during ${context}:`, error?.message || error);
      break;
    }
  }
  
  console.error(`❌ All retries failed for ${context}, using fallback`);
  throw lastError;
}

export async function getChatbotResponse(userMessage: string, conversationHistory: string[] = []): Promise<string> {
  // Use fallback responses if OpenAI is not configured
  if (!openai) {
    console.log("🤖 Using fallback chatbot (OpenAI not configured)");
    return getFallbackResponse(userMessage);
  }

  // Check rate limit before making request
  if (!checkRateLimit()) {
    return getFallbackResponse(userMessage);
  }

  try {
    const response = await retryWithBackoff(async () => {
      const systemPrompt = `You are a helpful assistant for RepShield, a professional Reddit reputation management service. 

Key information about our services:
- Reddit post removal: $899 per post
- Reddit comment removal: $199 per comment
- 95%+ success rate guaranteed
- 24-48 hour completion time for posts
- 24 hour completion time for comments
- Legal and ethical removal methods only
- Free re-removal if content returns within 3 days
- 1,650+ successful removals completed

Your role:
- Help users understand our Reddit removal services
- Provide quick quotes and pricing information
- Explain our fast turnaround times
- Build confidence in our 95%+ success rate
- Guide users toward getting a custom quote
- Be conversational, helpful, and professional
- Keep responses concise (2-3 sentences max)
- Focus on speed, success rate, and legal compliance

Do not:
- Promise anything we can't deliver
- Discuss illegal methods
- Provide services outside Reddit removal
- Give legal advice`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: userMessage }
      ];

      return await openai!.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 150,
        temperature: 0.7,
        timeout: 10000, // 10 second timeout
      });
    }, 'chatbot response');

    return response.choices[0].message.content || "I'm here to help with Reddit content removal. What specific content do you need removed?";
  } catch (error) {
    console.error("OpenAI API error (using fallback):", error?.message || error);
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Check for complex queries that need human escalation FIRST
  if (message.includes('complex') || message.includes('difficult') || message.includes('urgent') || 
      message.includes('lawsuit') || message.includes('emergency') || message.includes('immediately')) {
    return "This sounds like a complex situation that needs immediate attention. Let me connect you with our specialist who can provide personalized assistance within minutes.";
  }
  
  if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
    return "Reddit post removal costs $899 and comments cost $199. We have a 95%+ success rate with 24-48 hour completion. Would you like a custom quote for your specific content?";
  }
  
  if (message.includes('remove') && message.includes('post')) {
    return "I can help you remove Reddit posts for $899 each. We complete most post removals within 24-48 hours with a 95%+ success rate using only legal methods. Share your Reddit URL for a detailed quote.";
  }
  
  if (message.includes('remove') && message.includes('comment')) {
    return "Reddit comment removal costs $199 per comment with 24-hour completion time. We use only legal and ethical methods with a 95%+ success rate. What Reddit comments need removing?";
  }
  
  if (message.includes('how') || message.includes('process')) {
    return "Our process is simple: 1) Analyze your Reddit content, 2) Provide instant quote, 3) Remove content within 24-48 hours using legal methods. We've completed 1,650+ successful removals. What content do you need removed?";
  }
  
  if (message.includes('time') || message.includes('fast') || message.includes('quick')) {
    return "We remove Reddit posts in 24-48 hours and comments in 24 hours. Our legal removal methods have a 95%+ success rate. Need something removed urgently?";
  }
  
  if (message.includes('legal') || message.includes('safe') || message.includes('method')) {
    return "We only use legal and ethical removal methods with a 95%+ success rate. All removals comply with Reddit's terms and applicable laws. Plus, we offer free re-removal if content returns within 3 days.";
  }
  
  if (message.includes('guarantee') || message.includes('success')) {
    return "We guarantee a 95%+ success rate for all Reddit removals using legal methods. If content returns within 3 days, we'll remove it again for free. Ready to get started?";
  }
  
  // URL analysis requests
  if (message.includes('reddit.com') || message.includes('r/')) {
    return "Perfect! I can analyze that Reddit URL. Our removal service costs $899 for posts, $199 for comments, with 95%+ success rate in 24-48 hours. Would you like me to provide a detailed analysis and quote?";
  }
  
  // Multiple items/bulk
  if (message.includes('multiple') || message.includes('bulk') || message.includes('many') || message.includes('several')) {
    return "We handle bulk removals with volume discounts available. Posts: $899 each, Comments: $199 each. For 5+ items, we offer special pricing. What's the scope of your removal project?";
  }
  
  // Contact/help requests
  if (message.includes('contact') || message.includes('speak') || message.includes('talk') || message.includes('call')) {
    return "I'm here to help with Reddit content removal right now. We remove posts ($899) and comments ($199) with 95%+ success in 24-48 hours. What specific content needs removing?";
  }
  
  return "Hi! I'm here to help you remove unwanted Reddit content. I can get you a quote in under 60 seconds. What type of content do you need removed - posts ($899) or comments ($199)?";
}

export async function analyzeRedditUrl(url: string): Promise<{ contentType: string; estimatedPrice: string; description: string }> {
  // Use basic analysis if OpenAI is not configured
  if (!openai) {
    console.log("🔍 Using basic URL analysis (OpenAI not configured)");
    
    // Basic URL pattern matching
    if (url.includes('/comments/')) {
      return {
        contentType: "Reddit post",
        estimatedPrice: "$899",
        description: "We can remove this Reddit post with our 95%+ success rate in 24-48 hours."
      };
    } else if (url.includes('/r/') && url.includes('/#')) {
      return {
        contentType: "Reddit comment",
        estimatedPrice: "$199",
        description: "We can remove this Reddit comment with our 95%+ success rate in 24 hours."
      };
    } else {
      return {
        contentType: "Reddit content",
        estimatedPrice: "$899",
        description: "We can analyze and remove this Reddit content. Contact us for a detailed quote."
      };
    }
  }

  // Check rate limit before making request
  if (!checkRateLimit()) {
    return {
      contentType: "Reddit content",
      estimatedPrice: "$899",
      description: "We can analyze and remove this content. Contact us for a detailed quote."
    };
  }

  try {
    const response = await retryWithBackoff(async () => {
      return await openai!.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze this Reddit URL and determine:
1. Content type (post, comment, thread, profile, subreddit)
2. Estimated removal price based on our rates:
   - Posts/threads: $780
   - Comments: $186 each
   - Multiple items: Calculate total
3. Brief description of what we can remove

Respond in JSON format: {"contentType": "...", "estimatedPrice": "...", "description": "..."}`
          },
          {
            role: "user",
            content: `Please analyze this Reddit URL: ${url}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
        timeout: 10000,
      });
    }, 'URL analysis');

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      contentType: result.contentType || "Reddit content",
      estimatedPrice: result.estimatedPrice || "$780",
      description: result.description || "We can remove this content with our 95%+ success rate."
    };
  } catch (error) {
    console.error("URL analysis error (using fallback):", error?.message || error);
    return {
      contentType: "Reddit content",
      estimatedPrice: "$780",
      description: "We can analyze and remove this content. Contact us for a detailed quote."
    };
  }
}