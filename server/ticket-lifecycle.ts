import { storage } from './storage';
import { telegramBot } from './telegram';
import { notificationManager } from './notification-manager';
import {
  sendTicketQuotedEmail,
  sendTicketApprovedEmail,
  sendTicketInProgressEmail,
  sendTicketCompletedEmail,
} from './email';
import { trackEvent, FUNNEL_EVENTS } from './analytics';

interface TransitionOptions {
  ticketId: number;
  newStatus: string;
  assignedTo?: string;
  notes?: string;
  amount?: string;
  triggeredBy?: string;
}

class TicketLifecycleService {
  async transitionTicket(options: TransitionOptions) {
    const oldTicket = await storage.getTicket(options.ticketId);
    if (!oldTicket) throw new Error(`Ticket ${options.ticketId} not found`);

    const oldStatus = oldTicket.status;

    // Update ticket in DB
    const updated = await storage.updateTicketStatus(
      options.ticketId,
      options.newStatus,
      options.assignedTo
    );

    if (options.notes) {
      await storage.updateTicketNotes(options.ticketId, options.notes);
    }

    // Fire side effects based on state transition
    await this.onTransition(oldStatus, options.newStatus, oldTicket, updated);

    return updated;
  }

  private getClientEmail(ticket: any): string | undefined {
    if (ticket.requestData?.email) return ticket.requestData.email;
    return undefined;
  }

  private generatePaymentLink(ticketId: number): string {
    const base = process.env.RESET_URL_BASE || 'http://localhost:3000';
    return `${base}/dashboard?case=${ticketId}&action=pay`;
  }

  private async onTransition(from: string, to: string, oldTicket: any, newTicket: any) {
    const clientEmail = this.getClientEmail(oldTicket);
    console.log(`📋 Ticket #${oldTicket.id}: ${from} → ${to}${clientEmail ? ` (client: ${clientEmail})` : ''}`);

    try {
      switch (to) {
        case 'quoted':
          await trackEvent(FUNNEL_EVENTS.QUOTE_SENT, oldTicket.userId, undefined, { ticketId: oldTicket.id });
          if (clientEmail) {
            await sendTicketQuotedEmail({
              email: clientEmail,
              ticketId: oldTicket.id,
              amount: newTicket?.amount || 'Contact specialist for pricing',
              report: newTicket?.notes || '',
              paymentLink: this.generatePaymentLink(oldTicket.id),
            });
          }
          break;

        case 'approved':
          await trackEvent(FUNNEL_EVENTS.QUOTE_ACCEPTED, oldTicket.userId, undefined, { ticketId: oldTicket.id });
          if (clientEmail) {
            await sendTicketApprovedEmail({ email: clientEmail, ticketId: oldTicket.id });
          }
          break;

        case 'in_progress':
          if (clientEmail) {
            await sendTicketInProgressEmail({
              email: clientEmail,
              ticketId: oldTicket.id,
              progress: newTicket?.progress || 0,
            });
          }
          break;

        case 'completed':
          await trackEvent(FUNNEL_EVENTS.REMOVAL_COMPLETED, oldTicket.userId, undefined, { ticketId: oldTicket.id });
          if (clientEmail) {
            await sendTicketCompletedEmail({
              email: clientEmail,
              ticketId: oldTicket.id,
              completedAt: new Date().toISOString(),
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to send lifecycle email for ticket #${oldTicket.id} (${to}):`, error);
      // Non-fatal: never block ticket transitions for email failures
    }

    // SSE broadcast to connected admin clients
    notificationManager.broadcast({
      type: 'lead',
      message: `Ticket #${oldTicket.id} moved to ${to}`,
      userInfo: { ticketId: oldTicket.id, status: to, from },
      timestamp: Date.now(),
    });
  }
}

export const ticketLifecycle = new TicketLifecycleService();
