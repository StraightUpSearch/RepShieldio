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

const ADMIN_EMAIL = 'jamie@straightupsearch.com';

export async function sendQuoteNotification(data: {
  redditUrl: string;
  email?: string;
  analysis?: any;
}) {
  const msg = {
    to: ADMIN_EMAIL,
    from: ADMIN_EMAIL, // SendGrid requires verified sender
    subject: 'New Reddit Removal Quote Request',
    html: `
      <h2>New Quote Request Received</h2>
      <p><strong>Reddit URL:</strong> ${data.redditUrl}</p>
      <p><strong>Client Email:</strong> ${data.email || 'Not provided'}</p>
      
      ${data.analysis ? `
        <h3>AI Analysis:</h3>
        <p><strong>Content Type:</strong> ${data.analysis.contentType}</p>
        <p><strong>Estimated Price:</strong> ${data.analysis.estimatedPrice}</p>
        <p><strong>Description:</strong> ${data.analysis.description}</p>
      ` : ''}
      
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        RepShield Quote Request System
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
    from: ADMIN_EMAIL,
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