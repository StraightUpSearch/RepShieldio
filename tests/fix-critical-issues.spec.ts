import { test, expect, Page } from '@playwright/test';

test.describe('Fix Critical Issues - RepShield.io', () => {

  test('Test local development authentication with proper environment', async ({ page }) => {
    console.log('🔧 Testing Local Development Authentication');
    
    await page.goto('http://localhost:5000');
    
    // Test if server is responding
    const title = await page.title();
    console.log(`✅ Server responding - Page title: ${title}`);
    
    // Navigate to registration
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Test registration with proper credentials
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);
    
    const timestamp = Date.now();
    const testEmail = `testfix${timestamp}@example.com`;
    const testPassword = 'validpassword123';
    
    console.log(`🧪 Testing registration with: ${testEmail}`);
    
    // Monitor API calls
    const apiCalls: any[] = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const data = await response.json().catch(() => null);
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            method: response.request().method(),
            data: data
          });
          console.log(`📡 ${response.request().method()} ${response.url()} → ${response.status()}`);
          if (data && response.status() >= 400) {
            console.log(`   Error Response: ${JSON.stringify(data)}`);
          }
        } catch (e) {
          console.log(`📡 ${response.request().method()} ${response.url()} → ${response.status()} (non-JSON)`);
        }
      }
    });
    
    // Fill registration form
    await page.fill('input[id="register-firstname"]', 'Test');
    await page.fill('input[id="register-lastname"]', 'User');
    await page.fill('input[id="register-email"]', testEmail);
    await page.fill('input[id="register-password"]', testPassword);
    
    // Submit registration
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(5000);
    
    const postRegUrl = page.url();
    console.log(`📍 Post-registration URL: ${postRegUrl}`);
    
    if (postRegUrl.includes('/my-account')) {
      console.log('✅ Registration succeeded - redirected to account page');
    } else {
      console.log('⚠️ Registration may have failed - checking error messages');
      
      // Look for any error messages
      const errorMessages = await page.$$eval('[role="alert"], .error, .alert', 
        elements => elements.map(el => el.textContent?.trim()).filter(Boolean)
      ).catch(() => []);
      
      if (errorMessages.length > 0) {
        console.log('❌ Error messages found:', errorMessages);
      }
      
      // Try logging in with the same credentials
      console.log('🔄 Attempting login with same credentials');
      await page.click('button:has-text("Sign In")');
      await page.fill('input[id="login-email"]', testEmail);
      await page.fill('input[id="login-password"]', testPassword);
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(3000);
      
      const postLoginUrl = page.url();
      console.log(`📍 Post-login URL: ${postLoginUrl}`);
    }
    
    // Print all API calls
    console.log('\n📊 API Call Summary:');
    apiCalls.forEach(call => {
      console.log(`${call.method} ${call.url} → ${call.status}`);
      if (call.data) {
        console.log(`   Response: ${JSON.stringify(call.data).substring(0, 200)}`);
      }
    });
    
    await page.screenshot({ path: 'test-results/local-auth-test.png', fullPage: true });
  });

  test('Test brand scanning functionality (corrected)', async ({ page }) => {
    console.log('🔍 Testing Brand Scanning (Corrected Understanding)');
    
    await page.goto('http://localhost:5000/scan');
    await page.waitForLoadState('networkidle');
    
    // Look for brand name input (not Reddit URL)
    const brandInput = page.locator('input[placeholder*="brand" i]').first();
    
    if (await brandInput.isVisible()) {
      console.log('✅ Found brand name input field');
      
      // Test brand scanning
      await brandInput.fill('Tesla');
      console.log('✅ Filled brand name: Tesla');
      
      // Find and click scan button
      const scanButton = page.locator('button:has-text("Scan Reddit")');
      if (await scanButton.isVisible()) {
        await scanButton.click();
        console.log('✅ Clicked Scan Reddit button');
        
        // Wait for results or loading state
        await page.waitForTimeout(5000);
        
        // Check if results are displayed
        const hasResults = await page.isVisible('.space-y-6', { timeout: 10000 }).catch(() => false);
        if (hasResults) {
          console.log('✅ Scan results displayed');
        } else {
          console.log('ℹ️ No results displayed yet (may take time)');
        }
      } else {
        console.log('❌ Scan button not found');
      }
    } else {
      console.log('❌ Brand input field not found');
    }
    
    await page.screenshot({ path: 'test-results/brand-scan-test.png', fullPage: true });
  });

  test('Test ticket management access', async ({ page }) => {
    console.log('📋 Testing Ticket Management Access');
    
    await page.goto('http://localhost:5000');
    
    // Try to access ticket status page
    await page.goto('http://localhost:5000/ticket-status');
    await page.waitForLoadState('networkidle');
    
    const pageTitle = await page.title();
    console.log(`📄 Ticket page title: ${pageTitle}`);
    
    // Check if page loaded successfully
    const hasContent = await page.isVisible('h1', { timeout: 2000 }).catch(() => false);
    if (hasContent) {
      const heading = await page.textContent('h1');
      console.log(`✅ Ticket page loaded: ${heading}`);
    } else {
      console.log('❌ Ticket page failed to load');
    }
    
    await page.screenshot({ path: 'test-results/ticket-page-test.png', fullPage: true });
  });

  test('Database and session health check', async ({ page }) => {
    console.log('🏥 Database and Session Health Check');
    
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5000');
    await page.waitForTimeout(2000);
    
    // Check for console errors
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors detected:');
      consoleErrors.forEach(error => console.log(`   ${error}`));
    } else {
      console.log('✅ No console errors detected');
    }
    
    // Test API health
    try {
      const response = await page.request.get('http://localhost:5000/api/auth/user');
      console.log(`📡 Auth endpoint health: ${response.status()}`);
      
      if (response.status() === 401) {
        console.log('✅ Auth endpoint responding correctly (401 for unauthorized)');
      } else {
        console.log(`⚠️ Unexpected auth response: ${response.status()}`);
      }
    } catch (error) {
      console.log('❌ Auth endpoint not responding:', error);
    }
    
    await page.screenshot({ path: 'test-results/health-check.png', fullPage: true });
  });
}); 