// Test the lead capture system
const testLeadData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@techstartup.com", 
  company: "TechStartup Inc",
  brandName: "TechStartup",
  leadType: "premium",
  phone: "+1-555-0123",
  scanResults: {
    totalMentions: 23,
    riskLevel: "medium",
    overallSentiment: "neutral",
    platforms: {
      reddit: { totalMentions: 15, sentiment: "negative" },
      reviews: { totalMentions: 8, sentiment: "positive" }
    }
  }
};

async function testLeadCapture() {
  try {
    const response = await fetch('http://localhost:5000/api/brand-scan-ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testLeadData)
    });

    const result = await response.json();
    console.log('Lead capture test result:', result);
    
    if (result.success) {
      console.log('✓ User account created successfully');
      console.log('✓ Ticket created with ID:', result.ticketId);
      console.log('✓ Telegram notification should be sent to Jamie');
    }
  } catch (error) {
    console.error('Lead capture test failed:', error);
  }
}

testLeadCapture();