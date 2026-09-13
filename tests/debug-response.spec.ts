import { test, expect } from '@playwright/test';

test.describe('Debug Registration Response', () => {
  test('Capture registration API response in detail', async ({ page }) => {
    console.log('🐛 Debugging registration API response');
    
    // Capture full network responses
    const networkActivity: Array<{
      url: string;
      method: string;
      status?: number;
      requestData?: any;
      responseData?: any;
      responseHeaders?: any;
      error?: string;
    }> = [];
    
    page.on('request', async (request) => {
      if (request.url().includes('/api/register')) {
        let requestData;
        try {
          requestData = request.postData() ? JSON.parse(request.postData()!) : null;
        } catch {
          requestData = request.postData();
        }
        
        const entry = {
          url: request.url(),
          method: request.method(),
          requestData
        };
        
        networkActivity.push(entry);
        console.log(`📤 REGISTRATION REQUEST: ${request.method()} ${request.url()}`);
        console.log(`   Data: ${JSON.stringify(requestData)}`);
      }
    });
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/register')) {
        let responseData;
        let error;
        
        try {
          responseData = await response.json();
        } catch (e) {
          try {
            responseData = await response.text();
          } catch (e2) {
            error = `Failed to read response: ${e2.message}`;
          }
        }
        
        const entry = networkActivity.find(e => 
          e.url === response.url() && 
          e.method === response.request().method() && 
          !e.status
        );
        
        if (entry) {
          entry.status = response.status();
          entry.responseData = responseData;
          entry.responseHeaders = await response.allHeaders();
          entry.error = error;
        }
        
        console.log(`📥 REGISTRATION RESPONSE: ${response.status()} ${response.url()}`);
        console.log(`   Status: ${response.status()}`);
        console.log(`   Headers: ${JSON.stringify(await response.allHeaders())}`);
        if (responseData) {
          console.log(`   Data: ${JSON.stringify(responseData)}`);
        }
        if (error) {
          console.log(`   Error: ${error}`);
        }
      }
    });
    
    // Monitor for any client-side errors
    page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('register')) {
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      }
    });
    
    // Navigate to registration
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');
    
    // Switch to registration tab
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    // Fill and submit registration form
    const testEmail = `fulltest${Date.now()}@example.com`;
    console.log(`🧪 Testing registration with: ${testEmail}`);
    
    await page.fill('#register-firstname', 'Full');
    await page.fill('#register-lastname', 'Test');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', 'fulltest123');
    
    console.log('📤 Submitting registration form...');
    await page.click('button:has-text("Create Account")');
    
    // Wait for response and any redirects
    await page.waitForTimeout(5000);
    
    // Check final state
    const currentUrl = page.url();
    console.log(`📍 Final URL: ${currentUrl}`);
    
    // Check if user appears logged in
    const isLoggedIn = await page.locator('text=Account, text=Dashboard, text=My Account').count() > 0;
    console.log(`👤 User appears logged in: ${isLoggedIn}`);
    
    // Check for any error messages
    const errorMessages = await page.locator('[role="alert"], .error, .destructive').allTextContents();
    if (errorMessages.length > 0) {
      console.log(`⚠️ Error messages: ${JSON.stringify(errorMessages)}`);
    }
    
    // Check for success messages
    const successMessages = await page.locator('.success, .toast, [role="status"]').allTextContents();
    if (successMessages.length > 0) {
      console.log(`✅ Success messages: ${JSON.stringify(successMessages)}`);
    }
    
    console.log('\n📊 DETAILED NETWORK ANALYSIS:');
    networkActivity.forEach((activity, index) => {
      console.log(`\n[${index + 1}] ${activity.method} ${activity.url}`);
      console.log(`    Status: ${activity.status || 'No response received'}`);
      
      if (activity.requestData) {
        console.log(`    Request: ${JSON.stringify(activity.requestData)}`);
      }
      
      if (activity.responseData) {
        console.log(`    Response: ${JSON.stringify(activity.responseData)}`);
      }
      
      if (activity.responseHeaders) {
        console.log(`    Headers: ${JSON.stringify(activity.responseHeaders)}`);
      }
      
      if (activity.error) {
        console.log(`    Error: ${activity.error}`);
      }
    });
    
    // Analyze what went wrong
    if (networkActivity.length === 0) {
      console.log('\n❌ CRITICAL: No registration API calls detected!');
    } else {
      const registration = networkActivity[0];
      
      if (!registration.status) {
        console.log('\n❌ CRITICAL: Registration request sent but no response received!');
      } else if (registration.status >= 400) {
        console.log(`\n❌ CRITICAL: Registration failed with status ${registration.status}`);
        console.log(`   Response: ${JSON.stringify(registration.responseData)}`);
      } else if (registration.status >= 200 && registration.status < 300) {
        console.log('\n✅ Registration API call successful!');
        console.log(`   Status: ${registration.status}`);
        console.log(`   Response: ${JSON.stringify(registration.responseData)}`);
        
        if (currentUrl.includes('/login')) {
          console.log('❌ BUT: User was redirected back to login page despite successful API call!');
          console.log('   This suggests a frontend issue with handling the successful response.');
        } else {
          console.log('✅ User was properly redirected after registration');
        }
      }
    }
    
    expect(networkActivity.length).toBeGreaterThan(0);
  });
}); 