interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

class TelegramBot {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    if (!this.botToken) {
      console.warn('Telegram bot token not configured');
    }
  }

  async sendMessage(chatId: number, text: string): Promise<boolean> {
    if (!this.botToken) {
      console.error('Telegram bot token not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        console.error('Telegram API error:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  async processUpdate(update: TelegramUpdate): Promise<void> {
    if (!update.message || !update.message.text) {
      return;
    }

    const message = update.message;
    const chatId = message.chat.id;
    const userMessage = message.text;

    try {
      // Import chatbot response function
      const { getChatbotResponse } = await import('./openai');
      
      // Get AI response
      const botResponse = await getChatbotResponse(userMessage);
      
      // Send response back to Telegram
      await this.sendMessage(chatId, botResponse);
      
    } catch (error) {
      console.error('Error processing Telegram message:', error);
      await this.sendMessage(chatId, 'Sorry, I encountered an error. Please try again later.');
    }
  }

  async setWebhook(webhookUrl: string): Promise<boolean> {
    if (!this.botToken) {
      console.error('Telegram bot token not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
        }),
      });

      if (!response.ok) {
        console.error('Failed to set webhook:', await response.text());
        return false;
      }

      console.log('Telegram webhook set successfully');
      return true;
    } catch (error) {
      console.error('Error setting Telegram webhook:', error);
      return false;
    }
  }

  async sendNewLeadNotification(leadData: any): Promise<void> {
    if (!this.botToken) return;

    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!adminChatId) return;

    let message = `🚨 <b>NEW LEAD: ${leadData.type || 'Brand Scanner'}</b>\n\n`;
    message += `👤 <b>Name:</b> ${leadData.name}\n`;
    message += `📧 <b>Email:</b> ${leadData.email}\n`;
    message += `🏢 <b>Company:</b> ${leadData.company}\n`;
    
    if (leadData.phone) {
      message += `📱 <b>Phone:</b> ${leadData.phone}\n`;
    }
    
    if (leadData.brandName) {
      message += `🏷️ <b>Brand:</b> ${leadData.brandName}\n`;
    }
    
    if (leadData.leadType) {
      message += `💎 <b>Type:</b> ${leadData.leadType === 'premium' ? 'PREMIUM' : 'Standard'}\n`;
    }
    
    if (leadData.scanSummary) {
      message += `\n📊 <b>SCAN RESULTS:</b>\n`;
      message += `• Mentions Found: ${leadData.scanSummary.totalMentions}\n`;
      message += `• Risk Level: ${leadData.scanSummary.riskLevel.toUpperCase()}\n`;
      message += `• Overall Sentiment: ${leadData.scanSummary.sentiment}\n`;
    }
    
    if (leadData.ticketId) {
      message += `\n🎫 <b>Ticket:</b> #${leadData.ticketId}\n`;
    }
    
    message += `\n📅 ${new Date().toLocaleString()}\n`;
    message += `\n💼 <b>ACTION:</b> Contact within 2 hours for conversion`;

    try {
      await this.sendMessage(parseInt(adminChatId), message);
    } catch (error) {
      console.error('Failed to send lead notification to Jamie:', error);
    }
  }
}

export const telegramBot = new TelegramBot();