import { test, expect } from '@playwright/test';

test.describe('Debug Registration Issue', () => {
  test('Capture all network activity during registration', async ({ page }) => {
    console.log('🐛 Starting detailed registration debug');
    
    // Capture all network activity
    const networkLog: Array<{
      url: string;
      method: string;
      status?: number;
      requestData?: any;
      responseData?: any;
      timestamp: number;
    }> = [];
    
    // Monitor all requests
    page.on('request', async (request) => {
      let requestData;
      try {
        requestData = request.postData() ? JSON.parse(request.postData()!) : null;
      } catch {
        requestData = request.postData();
      }
      
      networkLog.push({
        url: request.url(),
        method: request.method(),
        requestData,
        timestamp: Date.now()
      });
      
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      if (requestData) {
        console.log(`   Data: ${JSON.stringify(requestData)}`);
      }
    });
    
    // Monitor all responses
    page.on('response', async (response) => {
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        try {
          responseData = await response.text();
        } catch {
          responseData = null;
        }
      }
      
      const logEntry = networkLog.find(entry => 
        entry.url === response.url() && 
        entry.method === response.request().method() &&
        !entry.status
      );
      
      if (logEntry) {
        logEntry.status = response.status();
        logEntry.responseData = responseData;
      }
      
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      if (responseData && typeof responseData !== 'string') {
        console.log(`   Data: ${JSON.stringify(responseData).substring(0, 200)}...`);
      }
    });
    
    // Monitor console logs
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      } else if (msg.type() === 'log') {
        console.log(`📝 CONSOLE LOG: ${msg.text()}`);
      }
    });
    
    // Navigate to localhost registration
    console.log('🌐 Navigating to localhost registration page');
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Click login link
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Switch to registration tab
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    // Fill registration form
    const testEmail = `debug${Date.now()}@example.com`;
    console.log(`🧪 Testing registration with: ${testEmail}`);
    
    await page.fill('input[id="register-firstname"]', 'Debug');
    await page.fill('input[id="register-lastname"]', 'User');
    await page.fill('input[id="register-email"]', testEmail);
    await page.fill('input[id="register-password"]', 'debugpass123');
    
    console.log('📋 Form fields filled, submitting...');
    
    // Submit form and monitor what happens
    await page.click('button:has-text("Create Account")');
    
    // Wait for network activity to complete
    await page.waitForTimeout(5000);
    
    console.log('\n📊 Complete Network Activity Log:');
    networkLog.forEach((entry, index) => {
      console.log(`\n[${index + 1}] ${entry.method} ${entry.url}`);
      console.log(`    Status: ${entry.status || 'Pending'}`);
      if (entry.requestData) {
        console.log(`    Request: ${JSON.stringify(entry.requestData)}`);
      }
      if (entry.responseData) {
        console.log(`    Response: ${JSON.stringify(entry.responseData).substring(0, 200)}...`);
      }
    });
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`\n📍 Final URL: ${currentUrl}`);
    
    // Look for API calls to registration endpoint
    const registrationCalls = networkLog.filter(entry => 
      entry.url.includes('/api/register')
    );
    
    console.log(`\n🔍 Registration API calls found: ${registrationCalls.length}`);
    registrationCalls.forEach(call => {
      console.log(`   ${call.method} ${call.url} - Status: ${call.status}`);
      if (call.requestData) {
        console.log(`   Request: ${JSON.stringify(call.requestData)}`);
      }
      if (call.responseData) {
        console.log(`   Response: ${JSON.stringify(call.responseData)}`);
      }
    });
    
    // Check for any error messages on page
    const errorElements = await page.locator('[role="alert"], .error, .destructive').count();
    console.log(`\n⚠️ Error elements on page: ${errorElements}`);
    
    if (errorElements > 0) {
      const errorTexts = await page.locator('[role="alert"], .error, .destructive').allTextContents();
      console.log('Error messages:', errorTexts);
    }
    
    // Check if user is logged in
    try {
      await page.waitForSelector('text=Account', { timeout: 2000 });
      console.log('✅ User appears to be logged in');
    } catch {
      console.log('❌ User does not appear to be logged in');
    }
    
    expect(networkLog.length).toBeGreaterThan(0);
  });
}); 