// DEPRECATED: OpenAI integration removed for simplified workflow
// This module now provides simple fallback responses only

console.log('🤖 Using simplified workflow - OpenAI integration deprecated');

// DEPRECATED: All rate limiting and retry logic removed

export async function getChatbotResponse(userMessage: string, conversationHistory: string[] = []): Promise<string> {
  // DEPRECATED: Always use fallback responses in simplified workflow
  return getFallbackResponse(userMessage);
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
  // DEPRECATED: Simplified analysis - no OpenAI calls
  console.log("🔍 Using simplified URL analysis (OpenAI deprecated)");
  return {
    contentType: "Reddit content",
    estimatedPrice: "Contact specialist for quote",
    description: "Please submit a quote request for professional analysis and pricing from our specialist team."
  };
}