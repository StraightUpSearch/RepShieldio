// DEPRECATED FILE - OpenAI integration removed for simplified workflow
// This file contains the original OpenAI chatbot and analysis functions
// Keep for reference but not imported by active code

// Fallback responses for simplified workflow
export function getSimpleFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
    return "Please submit your Reddit URL using our quote request form for a custom analysis and quote from our specialist team.";
  }
  
  if (message.includes('remove') && (message.includes('post') || message.includes('comment'))) {
    return "I can help you with Reddit content removal. Please use our quote request form to submit your Reddit URL and our specialist will respond within 24 hours.";
  }
  
  if (message.includes('how') || message.includes('process')) {
    return "Our simplified process: 1) Submit Reddit URL, 2) Specialist reviews and provides quote, 3) Removal work begins after approval. Submit a quote request to get started.";
  }
  
  return "Hello! For Reddit content removal, please submit your Reddit URL using our quote request form and our specialist will respond within 24 hours with a custom analysis and quote.";
}

export function getBasicUrlAnalysis(url: string) {
  return {
    contentType: "Reddit content",
    estimatedPrice: "Contact specialist for quote",
    description: "Please submit a quote request for professional analysis and pricing."
  };
} 