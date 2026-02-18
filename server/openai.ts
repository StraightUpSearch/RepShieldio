import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (openaiApiKey) {
  openai = new OpenAI({ apiKey: openaiApiKey });
  console.log('🤖 OpenAI configured for AI-assisted features');
} else {
  console.log('🤖 OpenAI not configured — using fallback responses');
}

export function isOpenAIConfigured(): boolean {
  return !!openai;
}

export async function getChatbotResponse(userMessage: string, conversationHistory: string[] = []): Promise<string> {
  if (!openai) return getFallbackResponse(userMessage);

  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are RepShield's AI assistant specializing in Reddit content removal.
Be helpful, professional, and direct. Key facts:
- Post removal: $899, Comment removal: $199
- Success rate: 95%+, Turnaround: 24-48 hours
- Only legal and ethical methods
- Free brand scan available on the website
- Monitoring plans starting at $49/mo
Keep responses concise (2-3 sentences max). Always guide toward action.`,
      },
      ...conversationHistory.map((msg, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: msg,
      })),
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || getFallbackResponse(userMessage);
  } catch (error) {
    console.error('OpenAI chatbot error, using fallback:', error);
    return getFallbackResponse(userMessage);
  }
}

export async function generateSpecialistReport(ticketData: {
  brandName?: string;
  redditUrl?: string;
  scanResults?: any;
  contentType?: string;
}): Promise<string | null> {
  if (!openai) return null;

  try {
    const prompt = `Generate a professional specialist report for a Reddit content removal request.

Brand/URL: ${ticketData.redditUrl || ticketData.brandName || 'Not specified'}
Content Type: ${ticketData.contentType || 'Unknown'}
${ticketData.scanResults ? `Scan Data: ${JSON.stringify(ticketData.scanResults).substring(0, 1000)}` : ''}

Provide a concise report with:
1. Content Assessment (what the content is and its likely impact)
2. Removal Strategy (recommended approach)
3. Estimated Timeline
4. Risk Factors

Keep it professional, direct, and actionable. No disclaimers.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI report generation error:', error);
    return null;
  }
}

export async function analyzeRedditUrl(url: string): Promise<{ contentType: string; estimatedPrice: string; description: string }> {
  if (!openai) {
    return {
      contentType: 'Reddit content',
      estimatedPrice: 'Contact specialist for quote',
      description: 'Submit a quote request for professional analysis and pricing.',
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Analyze this Reddit URL and determine: 1) Is it a post or comment? 2) Estimated removal price ($899 post, $199 comment). 3) Brief description. URL: ${url}. Return JSON: {"contentType":"post|comment","estimatedPrice":"$X","description":"brief desc"}`,
      }],
      max_tokens: 150,
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content || '';
    try {
      return JSON.parse(text);
    } catch {
      return { contentType: 'Reddit content', estimatedPrice: '$899', description: text.substring(0, 200) };
    }
  } catch (error) {
    console.error('OpenAI URL analysis error:', error);
    return {
      contentType: 'Reddit content',
      estimatedPrice: 'Contact specialist for quote',
      description: 'Submit a quote request for professional analysis.',
    };
  }
}

function getFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

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
    return "Our process is simple: 1) Analyze your Reddit content, 2) Provide instant quote, 3) Remove content within 24-48 hours using legal methods. What content do you need removed?";
  }

  if (message.includes('time') || message.includes('fast') || message.includes('quick')) {
    return "We remove Reddit posts in 24-48 hours and comments in 24 hours. Our legal removal methods have a 95%+ success rate. Need something removed urgently?";
  }

  if (message.includes('legal') || message.includes('safe') || message.includes('method')) {
    return "We only use legal and ethical removal methods with a 95%+ success rate. All removals comply with Reddit's terms and applicable laws.";
  }

  if (message.includes('guarantee') || message.includes('success')) {
    return "We guarantee a 95%+ success rate for all Reddit removals using legal methods. If content returns within 3 days, we'll remove it again for free.";
  }

  if (message.includes('reddit.com') || message.includes('r/')) {
    return "I can analyze that Reddit URL. Our removal service costs $899 for posts, $199 for comments, with 95%+ success rate in 24-48 hours. Want a detailed quote?";
  }

  if (message.includes('multiple') || message.includes('bulk') || message.includes('many')) {
    return "We handle bulk removals with volume discounts available. Posts: $899 each, Comments: $199 each. For 5+ items, we offer special pricing. What's the scope of your project?";
  }

  if (message.includes('monitor') || message.includes('alert') || message.includes('watch')) {
    return "We offer brand monitoring plans starting at $49/month. Get real-time alerts when your brand is mentioned on Reddit. Visit our monitoring page to learn more.";
  }

  if (message.includes('credit') || message.includes('scan')) {
    return "You can purchase scan credits to run unlimited brand scans. 10 credits for $49, 25 for $99, or 100 for $299. Credits never expire. Want to get started?";
  }

  return "Hi! I'm here to help you remove unwanted Reddit content. I can get you a quote in under 60 seconds. What type of content do you need removed — posts ($899) or comments ($199)?";
}
