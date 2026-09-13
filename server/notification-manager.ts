import { Response } from 'express';

interface NotificationClient {
  id: string;
  response: Response;
  timestamp: number;
}

interface NotificationData {
  type: 'chatbot' | 'lead' | 'scan';
  message: string;
  userInfo?: any;
  timestamp: number;
}

class NotificationManager {
  private clients: Map<string, NotificationClient> = new Map();

  addClient(id: string, response: Response): void {
    this.clients.set(id, {
      id,
      response,
      timestamp: Date.now()
    });

    // Remove client when connection closes
    response.on('close', () => {
      this.clients.delete(id);
    });

    // Clean up old connections periodically
    this.cleanupOldConnections();
  }

  broadcast(data: NotificationData): void {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach((client, id) => {
      try {
        client.response.write(message);
      } catch (error) {
        console.error(`Failed to send notification to client ${id}:`, error);
        this.clients.delete(id);
      }
    });
  }

  broadcastChatbotInteraction(userMessage: string, botResponse: string, userInfo?: any): void {
    this.broadcast({
      type: 'chatbot',
      message: `New visitor asked: "${userMessage}"`,
      userInfo,
      timestamp: Date.now()
    });
  }

  broadcastNewLead(leadData: any): void {
    this.broadcast({
      type: 'lead',
      message: `New lead: ${leadData.name} (${leadData.company})`,
      userInfo: leadData,
      timestamp: Date.now()
    });
  }

  broadcastBrandScan(brandName: string, results: any): void {
    this.broadcast({
      type: 'scan',
      message: `Brand scan completed for ${brandName}`,
      userInfo: results,
      timestamp: Date.now()
    });
  }

  private cleanupOldConnections(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    this.clients.forEach((client, id) => {
      if (now - client.timestamp > maxAge) {
        try {
          client.response.end();
        } catch (error) {
          // Ignore errors when closing old connections
        }
        this.clients.delete(id);
      }
    });
  }

  getActiveClientsCount(): number {
    return this.clients.size;
  }
}

export const notificationManager = new NotificationManager();