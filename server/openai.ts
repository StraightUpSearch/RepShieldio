import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function getChatbotResponse(userMessage: string, conversationHistory: string[] = []): Promise<string> {
  try {
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm here to help with Reddit content removal. What specific content do you need removed?";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm experiencing technical difficulties. Please try our contact form for immediate assistance with Reddit content removal.";
  }
}

export async function analyzeRedditUrl(url: string): Promise<{ contentType: string; estimatedPrice: string; description: string }> {
  try {
    const response = await openai.chat.completions.create({
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
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      contentType: result.contentType || "Reddit content",
      estimatedPrice: result.estimatedPrice || "$780",
      description: result.description || "We can remove this content with our 95%+ success rate."
    };
  } catch (error) {
    console.error("URL analysis error:", error);
    return {
      contentType: "Reddit content",
      estimatedPrice: "$780",
      description: "We can analyze and remove this content. Contact us for a detailed quote."
    };
  }
}