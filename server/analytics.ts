import { storage } from './storage';

export const FUNNEL_EVENTS = {
  SCAN_STARTED: 'scan_started',
  SCAN_COMPLETED: 'scan_completed',
  LEAD_FORM_VIEWED: 'lead_form_viewed',
  LEAD_FORM_SUBMITTED: 'lead_form_submitted',
  TICKET_CREATED: 'ticket_created',
  QUOTE_SENT: 'quote_sent',
  QUOTE_ACCEPTED: 'quote_accepted',
  PAYMENT_COMPLETED: 'payment_completed',
  REMOVAL_COMPLETED: 'removal_completed',
  CREDIT_PURCHASED: 'credit_purchased',
  SUBSCRIPTION_CREATED: 'subscription_created',
} as const;

export async function trackEvent(
  eventType: string,
  userId?: string,
  sessionId?: string,
  metadata?: any
): Promise<void> {
  try {
    await storage.trackFunnelEvent({ eventType, userId, sessionId, metadata });
  } catch (error) {
    console.error(`Failed to track event ${eventType}:`, error);
    // Non-fatal: never block the main flow for analytics
  }
}
