import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageCircle, Send, Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  // Show chatbot after user engagement (scrolling or time on page)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let hasScrolled = false;

    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 100) {
        hasScrolled = true;
        timeoutId = setTimeout(() => {
          setShowWidget(true);
        }, 3000); // Show after 3 seconds of scrolling
      }
    };

    // Also show after 15 seconds regardless
    const fallbackTimeout = setTimeout(() => {
      setShowWidget(true);
    }, 15000);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Initialize bot conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 1,
        text: "Hi! I'm here to help you remove unwanted Reddit content. I can get you a quote in under 60 seconds. What type of content do you need removed?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const [isTyping, setIsTyping] = useState(false);

  const sendChatMessage = useMutation({
    mutationFn: async ({ message, history }: { message: string; history: string[] }) => {
      return await apiRequest("POST", "/api/chatbot", { message, conversationHistory: history });
    },
    onSuccess: (response: any) => {
      setMessages(prev => {
        const botMessage: Message = {
          id: Date.now(), // Use timestamp for unique ID
          text: response.response,
          isBot: true,
          timestamp: new Date()
        };
        return [...prev, botMessage];
      });
      setIsTyping(false);
    },
    onError: (error) => {
      console.error("Chatbot error:", error);
      setMessages(prev => {
        const errorMessage: Message = {
          id: Date.now(), // Use timestamp for unique ID
          text: "I'm experiencing technical difficulties. Please use our contact form for immediate assistance with Reddit content removal.",
          isBot: true,
          timestamp: new Date()
        };
        return [...prev, errorMessage];
      });
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!input.trim() || sendChatMessage.isPending) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Create conversation history for context
    const conversationHistory = messages.map(msg => msg.text);

    // Send to AI chatbot
    sendChatMessage.mutate({ 
      message: input, 
      history: conversationHistory 
    });

    setInput("");
    setCurrentStep(prev => prev + 1);
  };

  const handleQuickAction = (action: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: action,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Create conversation history for context
    const conversationHistory = messages.map(msg => msg.text);

    // Send to AI chatbot
    sendChatMessage.mutate({ 
      message: action, 
      history: conversationHistory 
    });

    setCurrentStep(prev => prev + 1);
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsOpen(false);
  };

  if (!showWidget) return null;

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full bg-reddit-orange hover:bg-red-600 shadow-2xl transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="h-8 w-8 text-white" />
            </Button>
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-success-green text-white text-xs px-2 py-1 animate-pulse">
                New
              </Badge>
            </div>
            <div className="absolute -top-12 right-0 bg-white shadow-lg rounded-lg p-3 border border-gray-200 max-w-xs hidden md:block animate-bounce">
              <p className="text-sm text-gray-700">Quick quote in 60 seconds!</p>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-reddit-orange text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">RedditShield Assistant</h3>
                <p className="text-sm opacity-90">Usually replies instantly</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isBot ? 'bg-gray-100' : 'bg-reddit-orange'}`}>
                    {message.isBot ? (
                      <Bot className="h-4 w-4 text-gray-600" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-reddit-orange text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {currentStep === 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("Remove Reddit post")}
                  className="text-xs"
                >
                  Remove Post
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("Remove Reddit comments")}
                  className="text-xs"
                >
                  Remove Comments
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction("How fast can you work?")}
                  className="text-xs"
                >
                  How Fast?
                </Button>
              </div>
            )}

            {currentStep > 1 && (
              <div className="text-center mt-4">
                <Button
                  onClick={scrollToContact}
                  className="bg-success-green hover:bg-green-600 text-white"
                >
                  Get Custom Quote
                </Button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-reddit-orange hover:bg-red-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}