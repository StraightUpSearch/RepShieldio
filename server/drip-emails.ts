import { storage } from './storage';

const BRAND_ORANGE = '#f97316';
const BRAND_DARK = '#111827';

const FROM_EMAIL = process.env.FROM_EMAIL || 'support@removefromreddit.com';
const BASE_URL = process.env.RESET_URL_BASE ||
  (process.env.NODE_ENV === 'production' ? 'https://removefromreddit.com' : 'http://localhost:3000');

// Drip email templates
const DRIP_TEMPLATES = [
  // Step 2: 24 hours later
  {
    step: 2,
    subject: 'Still thinking it over?',
    html: (email: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="margin-bottom: 24px;"><span style="font-size: 22px; font-weight: 900; color: ${BRAND_DARK}; letter-spacing: -0.03em;">RepShield</span></div>
        <h2 style="color: ${BRAND_DARK}; margin-bottom: 20px;">Still thinking it over?</h2>
        <p>We wanted to follow up on the Reddit content you flagged yesterday.</p>
        <p>Here's the thing — <strong>93% of people who Google a brand click on the first page of results.</strong> If that Reddit post is ranking, it's shaping how people see you right now.</p>
        <p>One of our recent clients had a defamatory post removed in under 28 hours. Within a week, Google had de-indexed it entirely. Their words: <em>"I can finally Google myself again."</em></p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/scan"
             style="background-color: ${BRAND_ORANGE}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Run a Free Brand Scan →
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Or reply to this email with any questions — we respond within 4 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">The RepShield Team<br><a href="${BASE_URL}" style="color: ${BRAND_ORANGE};">removefromreddit.com</a></p>
      </div>
    `,
  },
  // Step 3: 7 days later
  {
    step: 3,
    subject: 'Last chance — your Reddit post is still there',
    html: (email: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="margin-bottom: 24px;"><span style="font-size: 22px; font-weight: 900; color: ${BRAND_DARK}; letter-spacing: -0.03em;">RepShield</span></div>
        <h2 style="color: ${BRAND_DARK}; margin-bottom: 20px;">Your Reddit post is still live</h2>
        <p>It's been a week since you submitted a removal request, and the content you flagged is still publicly visible.</p>
        <p>Every day it stays up:</p>
        <ul>
          <li>Google continues to index and rank it</li>
          <li>More people see it in search results</li>
          <li>It gets harder to push down organically</li>
        </ul>
        <p>We remove Reddit posts and comments with a <strong>95%+ success rate</strong>, and you only pay if it works. No risk, no upfront cost.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${BASE_URL}/contact"
             style="background-color: ${BRAND_DARK}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Get It Removed Now →
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This is our last follow-up. If you need help in the future, we're always at <a href="${BASE_URL}" style="color: ${BRAND_ORANGE};">removefromreddit.com</a>.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">The RepShield Team</p>
      </div>
    `,
  },
];

// Schedule drip emails for a new quote request
export async function scheduleDripEmails(email: string, ticketId: number) {
  const now = Date.now();
  const ONE_HOUR = 3600_000;
  const ONE_DAY = 24 * ONE_HOUR;

  const drips = [
    { step: 2, sendAt: now + ONE_DAY },        // 24 hours
    { step: 3, sendAt: now + 7 * ONE_DAY },    // 7 days
  ];

  for (const drip of drips) {
    await storage.createDripEmail({
      email,
      ticketId,
      dripStep: drip.step,
      sendAt: drip.sendAt,
    });
  }

  console.log(`📧 Scheduled ${drips.length} drip emails for ${email}`);
}

// Process due drip emails — called periodically
export async function processDripEmails() {
  const dueEmails = await storage.getDueDripEmails();
  if (dueEmails.length === 0) return;

  // Lazy import to avoid circular dependency
  const { sendDripEmail } = await import('./email');

  for (const drip of dueEmails) {
    const template = DRIP_TEMPLATES.find(t => t.step === drip.dripStep);
    if (!template) continue;

    // Check if ticket has progressed past pending — if so, skip the drip
    if (drip.ticketId) {
      const ticket = await storage.getTicket(drip.ticketId);
      if (ticket && ticket.status !== 'pending') {
        await storage.markDripEmailSent(drip.id);
        continue;
      }
    }

    try {
      await sendDripEmail({
        to: drip.email,
        subject: template.subject,
        html: template.html(drip.email),
      });
      await storage.markDripEmailSent(drip.id);
      console.log(`📧 Drip step ${drip.dripStep} sent to ${drip.email}`);
    } catch (err) {
      console.error(`📧 Drip email failed for ${drip.email} step ${drip.dripStep}:`, err);
    }
  }
}

// Start the drip email processor (runs every hour)
export function startDripProcessor() {
  const ONE_HOUR = 3600_000;
  setInterval(() => {
    processDripEmails().catch(err => console.error('Drip processor error:', err));
  }, ONE_HOUR);
  console.log('📧 Drip email processor started (checks every hour)');
}
