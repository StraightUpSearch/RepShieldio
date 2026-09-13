import { test, expect, Page } from '@playwright/test';

test.describe('Critical User Flow Testing - RepShield.io', () => {
  
  test('Complete user journey: Register → Login → Submit Reddit URL → Check Ticket', async ({ page }) => {
    console.log('🎯 Testing Complete Critical User Journey');
    
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testPassword = 'securetest123';
    
    // Step 1: Test Registration Flow
    console.log('📝 Step 1: Testing Registration');
    await page.goto('https://repshield.io');
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Click registration tab
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);
    
    // Fill registration form
    await page.fill('input[id="register-firstname"]', 'Test');
    await page.fill('input[id="register-lastname"]', 'User');
    await page.fill('input[id="register-email"]', testEmail);
    await page.fill('input[id="register-password"]', testPassword);
    
    // Monitor registration API call
    let registrationSuccess = false;
    page.on('response', async (response) => {
      if (response.url().includes('/api/register')) {
        console.log(`📡 Registration API: ${response.status()}`);
        if (response.status() === 201) {
          registrationSuccess = true;
          console.log('✅ Registration API returned success');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log('❌ Registration failed:', errorData);
        }
      }
    });
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);
    
    const postRegUrl = page.url();
    console.log(`Post-registration URL: ${postRegUrl}`);
    
    if (postRegUrl.includes('/my-account') || postRegUrl.includes('/account')) {
      console.log('✅ Registration succeeded - redirected to account');
    } else {
      console.log('⚠️ Registration may have failed - still on login page');
      
      // Try to login with the credentials we just registered
      console.log('🔄 Attempting login with registered credentials');
      await page.click('button:has-text("Sign In")');
      await page.fill('input[id="login-email"]', testEmail);
      await page.fill('input[id="login-password"]', testPassword);
      await page.click('button:has-text("Sign In")');
      await page.waitForTimeout(3000);
    }
    
    // Step 2: Test Access to Protected Areas
    console.log('🔐 Step 2: Testing Access to Protected Areas');
    
    // Try to access account page
    const accountLink = page.locator('a:has-text("My Account")');
    if (await accountLink.isVisible({ timeout: 2000 })) {
      await accountLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Successfully accessed My Account page');
    } else {
      console.log('❌ Cannot access My Account - user not logged in');
    }
    
    // Step 3: Test Reddit URL Submission (Core Business Function)
    console.log('🎯 Step 3: Testing Reddit URL Submission');
    
    // Navigate to scan page
    await page.goto('https://repshield.io/scan');
    await page.waitForLoadState('networkidle');
    
    // Look for Reddit URL input field
    const urlInputSelectors = [
      'input[placeholder*="reddit" i]',
      'input[placeholder*="url" i]',
      'input[type="url"]',
      'input[name*="url"]',
      'textarea[placeholder*="reddit" i]'
    ];
    
    let urlInput = null;
    for (const selector of urlInputSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        urlInput = element;
        console.log(`✅ Found URL input field: ${selector}`);
        break;
      }
    }
    
    if (urlInput) {
      // Test with a sample Reddit URL
      const testRedditUrl = 'https://www.reddit.com/r/test/comments/sample/test_post/';
      await urlInput.fill(testRedditUrl);
      console.log('✅ Filled Reddit URL input');
      
      // Look for submit button
      const submitSelectors = [
        'button:has-text("Scan")',
        'button:has-text("Submit")',
        'button:has-text("Analyze")',
        'button[type="submit"]'
      ];
      
      for (const selector of submitSelectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await button.click();
          console.log(`✅ Clicked submit button: ${selector}`);
          await page.waitForTimeout(3000);
          break;
        }
      }
    } else {
      console.log('❌ Could not find Reddit URL input field');
    }
    
    // Step 4: Test Ticket/Order Management
    console.log('📋 Step 4: Testing Ticket/Order Management');
    
    // Try to access tickets/orders page
    const ticketPageSelectors = [
      'a:has-text("Tickets")',
      'a:has-text("Orders")',
      'a:has-text("My Orders")',
      'a[href*="ticket"]',
      'a[href*="order"]'
    ];
    
    for (const selector of ticketPageSelectors) {
      const link = page.locator(selector).first();
      if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
        await link.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Found and clicked tickets link: ${selector}`);
        break;
      }
    }
    
    // Check if we can see any ticket/order data
    const hasTicketData = await page.isVisible('table', { timeout: 2000 }).catch(() => false) ||
                         await page.isVisible('.ticket', { timeout: 2000 }).catch(() => false) ||
                         await page.isVisible('.order', { timeout: 2000 }).catch(() => false);
    
    if (hasTicketData) {
      console.log('✅ Ticket/Order data is visible');
    } else {
      console.log('ℹ️ No ticket data visible (expected for new user)');
    }
    
    await page.screenshot({ path: 'test-results/critical-flow-final.png', fullPage: true });
  });

  test('Anonymous user flow: Reddit URL submission without registration', async ({ page }) => {
    console.log('👤 Testing Anonymous User Flow');
    
    await page.goto('https://repshield.io');
    
    // Look for anonymous scan option
    const scanButton = page.locator('a:has-text("Scan")').or(page.locator('button:has-text("Scan")'));
    if (await scanButton.isVisible({ timeout: 2000 })) {
      await scanButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Accessed scan page as anonymous user');
      
      // Try to submit a Reddit URL without logging in
      const urlInput = page.locator('input').first();
      if (await urlInput.isVisible({ timeout: 2000 })) {
        await urlInput.fill('https://www.reddit.com/r/test/comments/sample/');
        console.log('✅ Filled URL as anonymous user');
        
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(3000);
          console.log('✅ Submitted URL as anonymous user');
        }
      }
    } else {
      console.log('ℹ️ No anonymous scan option found - registration required');
    }
    
    await page.screenshot({ path: 'test-results/anonymous-flow.png', fullPage: true });
  });

  test('Backend API health check', async ({ page }) => {
    console.log('🔍 Testing Backend API Health');
    
    const apiEndpoints = [
      '/api/auth/user',
      '/api/register', 
      '/api/login',
      '/api/tickets'
    ];
    
    const apiResults: Array<{endpoint: string, status: number, response?: any}> = [];
    
    // Monitor all API calls
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const responseData = await response.json().catch(() => null);
          apiResults.push({
            endpoint: response.url(),
            status: response.status(),
            response: responseData
          });
          console.log(`📡 ${response.request().method()} ${response.url()} → ${response.status()}`);
        } catch (e) {
          apiResults.push({
            endpoint: response.url(),
            status: response.status()
          });
        }
      }
    });
    
    await page.goto('https://repshield.io');
    await page.waitForTimeout(2000);
    
    // Trigger auth check
    await page.click('a:has-text("Login")');
    await page.waitForTimeout(2000);
    
    // Try a test registration to trigger API calls
    await page.click('button:has-text("Create Account")');
    await page.fill('input[id="register-email"]', 'healthcheck@test.com');
    await page.fill('input[id="register-password"]', 'testpassword123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);
    
    console.log('\n📊 API Health Summary:');
    apiResults.forEach(result => {
      const status = result.status < 400 ? '✅' : '❌';
      console.log(`${status} ${result.endpoint} → ${result.status}`);
      if (result.response && result.status >= 400) {
        console.log(`   Error: ${JSON.stringify(result.response)}`);
      }
    });
    
    // Check for critical failures
    const criticalFailures = apiResults.filter(r => r.status >= 500);
    if (criticalFailures.length > 0) {
      console.log('🚨 CRITICAL: Server errors detected!');
      criticalFailures.forEach(failure => {
        console.log(`💥 ${failure.endpoint} → ${failure.status}`);
      });
    }
    
    const authFailures = apiResults.filter(r => 
      (r.endpoint.includes('/register') || r.endpoint.includes('/login')) && 
      r.status >= 400
    );
    
    if (authFailures.length > 0) {
      console.log('⚠️ Authentication endpoints failing');
    }
  });
}); 