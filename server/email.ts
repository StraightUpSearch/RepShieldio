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

// Use environment variable for sender email or fallback to verified default
const ADMIN_EMAIL = process.env.SENDER_EMAIL || 'jamie@straightupsearch.com';
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