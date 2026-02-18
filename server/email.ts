import sgMail from '@sendgrid/mail';

// Make email optional for both development and production
const apiKey = process.env.SENDGRID_API_KEY;

if (apiKey) {
  sgMail.setApiKey(apiKey);
  console.log('📧 SendGrid configured for email notifications');
} else {
  const envMsg = process.env.NODE_ENV === 'production' ? 'production (logging only)' : 'development';
  console.log(`📧 SendGrid not configured for ${envMsg} - emails will be logged only`);
}

// Use environment variables for email addresses
const ADMIN_EMAIL = process.env.SENDER_EMAIL || process.env.ADMIN_EMAIL || 'contact@repshield.io';
const FROM_EMAIL = process.env.FROM_EMAIL || ADMIN_EMAIL;

export async function sendQuoteNotification(data: {
  redditUrl: string;
  email?: string;
  ticketId?: number;
}) {
  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL, // SendGrid requires verified sender
    subject: 'New Reddit Removal Quote Request',
    html: `
      <h2>New Quote Request Received</h2>
      <p><strong>Reddit URL:</strong> ${data.redditUrl}</p>
      <p><strong>Client Email:</strong> ${data.email || 'Not provided'}</p>
      ${data.ticketId ? `<p><strong>Ticket ID:</strong> REP-${data.ticketId.toString().padStart(4, '0')}</p>` : ''}
      
      <p><strong>Action Required:</strong> Specialist review and quote needed</p>
      <p>Please log into the admin panel to provide analysis, pricing, and timeline.</p>
      
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        RepShield Simplified Workflow - No AI Analysis
      </p>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Quote notification sent successfully');
    } else {
      console.log('📧 DEV MODE - Would send email:', msg.subject);
      console.log('📧 To:', msg.to);
      console.log('📧 Content:', data);
    }
  } catch (error) {
    console.error('Error sending quote notification:', error);
    throw error;
  }
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  company: string;
  website: string;
  message: string;
}) {
  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company || 'Not provided'}</p>
      <p><strong>Website:</strong> ${data.website || 'Not provided'}</p>
      
      <h3>Message:</h3>
      <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${data.message}
      </p>
      
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        RepShield Contact Form System
      </p>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Contact notification sent successfully');
    } else {
      console.log('📧 DEV MODE - Would send contact email:', msg.subject);
      console.log('📧 From:', data.name, data.email);
      console.log('📧 Message:', data.message);
    }
  } catch (error) {
    console.error('Error sending contact notification:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(data: {
  email: string;
  resetToken: string;
  userName?: string;
}) {
  // Use environment variable for reset URL base or fallback to localhost for development
  const RESET_URL_BASE = process.env.RESET_URL_BASE || 
    (process.env.NODE_ENV === 'production' ? 'https://repshield.io' : 'http://localhost:3000');
  
  const resetUrl = `${RESET_URL_BASE}/reset-password?token=${data.resetToken}`;
  
  const msg = {
    to: data.email,
    from: FROM_EMAIL, // Use verified sender
    subject: 'RepShield - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p>Hello${data.userName ? ` ${data.userName}` : ''},</p>
        
        <p>We received a request to reset your RepShield account password. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; word-break: break-all;">
          ${resetUrl}
        </p>
        
        <p><strong>This link will expire in 24 hours</strong> for security reasons.</p>
        
        <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          The RepShield Team<br>
          <a href="${RESET_URL_BASE}" style="color: #2563eb;">repshield.io</a>
        </p>
        
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Password reset email sent successfully to:', data.email);
      console.log('Email sent from:', FROM_EMAIL, 'to:', data.email);
    } else {
      console.log('📧 DEV MODE - Would send password reset email:', msg.subject);
      console.log('📧 To:', data.email);
      console.log('📧 Reset URL:', resetUrl);
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
// ============ CLIENT-FACING LIFECYCLE EMAILS ============

export async function sendWelcomeEmail(data: { email: string; firstName?: string }) {
  const RESET_URL_BASE = process.env.RESET_URL_BASE || 
    (process.env.NODE_ENV === 'production' ? 'https://repshield.io' : 'http://localhost:3000');

  const msg = {
    to: data.email,
    from: FROM_EMAIL,
    subject: 'Welcome to RepShield — Your Brand Protection Starts Now',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Welcome to RepShield</h2>
        <p>Hello${data.firstName ? ` ${data.firstName}` : ''},</p>
        <p>Your RepShield account is now active. You can now:</p>
        <ul>
          <li>Run brand mention scans across Reddit</li>
          <li>Track removal requests in your dashboard</li>
          <li>Purchase scan credits for self-serve monitoring</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${RESET_URL_BASE}/my-account" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Go to Dashboard
          </a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; font-size: 14px;">The RepShield Team<br><a href="${RESET_URL_BASE}" style="color: #2563eb;">repshield.io</a></p>
      </div>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Welcome email sent to:', data.email);
    } else {
      console.log('📧 DEV MODE - Would send welcome email to:', data.email);
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

export async function sendTicketQuotedEmail(data: {
  email: string;
  ticketId: number;
  amount: string;
  report: string;
  paymentLink?: string;
}) {
  const ticketNumber = `REP-${data.ticketId.toString().padStart(4, '0')}`;
  const msg = {
    to: data.email,
    from: FROM_EMAIL,
    subject: `Your RepShield Quote is Ready — ${ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Your Specialist Quote is Ready</h2>
        <p>Our specialist has reviewed your case and prepared a quote:</p>
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Ticket:</strong> ${ticketNumber}</p>
          <p style="margin: 0 0 10px 0;"><strong>Quoted Amount:</strong> ${data.amount}</p>
          ${data.report ? `<p style="margin: 0;"><strong>Analysis:</strong> ${data.report.substring(0, 300)}${data.report.length > 300 ? '...' : ''}</p>` : ''}
        </div>
        ${data.paymentLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.paymentLink}" 
             style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
            Pay & Start Removal
          </a>
        </div>
        <p style="text-align: center; color: #666; font-size: 13px;">This quote is valid for 72 hours.</p>
        ` : ''}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; font-size: 14px;">The RepShield Team</p>
      </div>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Quote email sent to:', data.email);
    } else {
      console.log('📧 DEV MODE - Would send quote email:', ticketNumber, 'to:', data.email);
    }
  } catch (error) {
    console.error('Error sending quote email:', error);
  }
}

export async function sendTicketApprovedEmail(data: { email: string; ticketId: number }) {
  const ticketNumber = `REP-${data.ticketId.toString().padStart(4, '0')}`;
  const msg = {
    to: data.email,
    from: FROM_EMAIL,
    subject: `Payment Confirmed — Removal Starting for ${ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">Payment Confirmed</h2>
        <p>Thank you! Your payment for ticket <strong>${ticketNumber}</strong> has been confirmed.</p>
        <p>Our specialist team is now actively working on your content removal. You'll receive updates as we make progress.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Expected Timeline:</strong> 24-48 hours</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; font-size: 14px;">The RepShield Team</p>
      </div>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Approved email sent to:', data.email);
    } else {
      console.log('📧 DEV MODE - Would send approved email:', ticketNumber, 'to:', data.email);
    }
  } catch (error) {
    console.error('Error sending approved email:', error);
  }
}

export async function sendTicketInProgressEmail(data: { email: string; ticketId: number; progress: number }) {
  const ticketNumber = `REP-${data.ticketId.toString().padStart(4, '0')}`;
  const msg = {
    to: data.email,
    from: FROM_EMAIL,
    subject: `Removal In Progress — ${ticketNumber} (${data.progress}% Complete)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Removal Update</h2>
        <p>Progress update for ticket <strong>${ticketNumber}</strong>:</p>
        <div style="background: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <div style="background: #e5e7eb; border-radius: 999px; height: 24px; overflow: hidden;">
            <div style="background: #2563eb; height: 100%; width: ${data.progress}%; border-radius: 999px;"></div>
          </div>
          <p style="text-align: center; margin: 10px 0 0 0; font-weight: bold;">${data.progress}% Complete</p>
        </div>
        <p>Our specialist is actively working on your removal. We'll notify you when it's complete.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; font-size: 14px;">The RepShield Team</p>
      </div>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Progress email sent to:', data.email);
    } else {
      console.log('📧 DEV MODE - Would send progress email:', ticketNumber, `${data.progress}%`, 'to:', data.email);
    }
  } catch (error) {
    console.error('Error sending progress email:', error);
  }
}

export async function sendTicketCompletedEmail(data: { email: string; ticketId: number; completedAt: string }) {
  const RESET_URL_BASE = process.env.RESET_URL_BASE || 
    (process.env.NODE_ENV === 'production' ? 'https://repshield.io' : 'http://localhost:3000');
  const ticketNumber = `REP-${data.ticketId.toString().padStart(4, '0')}`;
  const msg = {
    to: data.email,
    from: FROM_EMAIL,
    subject: `Content Removed Successfully — ${ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #16a34a; margin-bottom: 20px;">Removal Complete</h2>
        <p>Great news! The content for ticket <strong>${ticketNumber}</strong> has been successfully removed.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0 0 5px 0;"><strong>Status:</strong> Completed</p>
          <p style="margin: 0;"><strong>Completed:</strong> ${new Date(data.completedAt).toLocaleDateString()}</p>
        </div>
        <p>If the content returns within 3 days, we'll remove it again for free.</p>
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">Protect against future posts</p>
          <p style="margin: 5px 0 0 0;">Set up automated monitoring to catch new mentions early.</p>
          <a href="${RESET_URL_BASE}/monitoring" style="color: #2563eb; font-weight: bold;">Explore Monitoring Plans →</a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #666; font-size: 14px;">The RepShield Team</p>
      </div>
    `,
  };

  try {
    if (apiKey) {
      await sgMail.send(msg);
      console.log('Completion email sent to:', data.email);
    } else {
      console.log('📧 DEV MODE - Would send completion email:', ticketNumber, 'to:', data.email);
    }
  } catch (error) {
    console.error('Error sending completion email:', error);
  }
}
