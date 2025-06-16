import { test, expect, Page } from '@playwright/test';

test.describe('Detailed RepShield.io Authentication Testing', () => {
  
  test('Test registration flow with validation', async ({ page }) => {
    console.log('🧪 Testing Registration Flow with Validation');
    
    // Navigate to the site
    await page.goto('https://repshield.io');
    
    // Click login/register link to get to auth page
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Switch to Registration tab
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(500);
    
    console.log('📝 Testing Registration Validation');
    
    // Test 1: Empty form submission
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    console.log('✅ Empty form test completed');
    
    // Test 2: Invalid email format
    await page.fill('input[id="register-email"]', 'invalid-email');
    await page.fill('input[id="register-password"]', 'test123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    console.log('✅ Invalid email test completed');
    
    // Test 3: Password too short (should require 8+ chars based on our fixes)
    await page.fill('input[id="register-email"]', 'test@example.com');
    await page.fill('input[id="register-password"]', '123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    console.log('✅ Short password test completed');
    
    // Test 4: Valid registration (but might fail due to existing user)
    const timestamp = Date.now();
    await page.fill('input[id="register-firstname"]', 'Test');
    await page.fill('input[id="register-lastname"]', 'User');
    await page.fill('input[id="register-email"]', `testuser${timestamp}@example.com`);
    await page.fill('input[id="register-password"]', 'validpassword123');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);
    
    // Check if we were redirected to account page (success) or stayed on login (error)
    const currentUrl = page.url();
    console.log(`Final URL after registration: ${currentUrl}`);
    
    if (currentUrl.includes('/my-account') || currentUrl.includes('/account')) {
      console.log('✅ Registration appeared to succeed - redirected to account page');
    } else {
      console.log('ℹ️ Registration may have failed - check for error messages');
      // Look for any error messages on the page
      const errorElements = await page.$$eval('[role="alert"], .error, .alert, [data-testid*="error"]', 
        elements => elements.map(el => el.textContent?.trim()).filter(Boolean)
      );
      if (errorElements.length > 0) {
        console.log('Found error messages:', errorElements);
      }
    }
    
    await page.screenshot({ path: 'test-results/registration-final-state.png', fullPage: true });
  });

  test('Test login error scenarios', async ({ page }) => {
    console.log('🧪 Testing Login Error Scenarios');
    
    await page.goto('https://repshield.io');
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Ensure we're on the Login tab (not Register)
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(500);
    
    console.log('🔐 Testing Login Validation');
    
    // Test 1: Empty login
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(1000);
    console.log('✅ Empty login test completed');
    
    // Test 2: Invalid credentials
    await page.fill('input[id="login-email"]', 'nonexistent@example.com');
    await page.fill('input[id="login-password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    
    // Look for error messages
    const errorFound = await page.isVisible('text=Invalid email or password', { timeout: 5000 }).catch(() => false);
    if (errorFound) {
      console.log('✅ Login error message displayed correctly');
    } else {
      console.log('ℹ️ No explicit error message found - checking for other indicators');
    }
    
    await page.screenshot({ path: 'test-results/login-error-state.png', fullPage: true });
    
    // Test 3: Valid login (if we have test credentials)
    // This would need real test credentials to work
    console.log('ℹ️ Skipping valid login test - requires real credentials');
  });

  test('Test auth state persistence', async ({ page }) => {
    console.log('🧪 Testing Authentication State Persistence');
    
    await page.goto('https://repshield.io');
    
    // Check if user is already logged in (from previous tests)
    const isLoggedIn = await page.isVisible('button:has-text("Logout")', { timeout: 2000 }).catch(() => false) ||
                      await page.isVisible('a:has-text("My Account")', { timeout: 2000 }).catch(() => false);
    
    if (isLoggedIn) {
      console.log('✅ User appears to be logged in from previous session');
      
      // Test navigation to protected pages
      await page.click('a:has-text("My Account")');
      await page.waitForLoadState('networkidle');
      
      const accountPageLoaded = page.url().includes('/my-account') || page.url().includes('/account');
      if (accountPageLoaded) {
        console.log('✅ Successfully accessed protected account page');
      }
    } else {
      console.log('ℹ️ User not logged in - this is expected for fresh sessions');
    }
    
    await page.screenshot({ path: 'test-results/auth-state.png', fullPage: true });
  });

  test('Test API endpoint responses', async ({ page }) => {
    console.log('🧪 Testing API Endpoint Responses');
    
    // Set up request/response monitoring
    const apiRequests: Array<{url: string, method: string, status: number, response?: any}> = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const responseData = await response.json().catch(() => null);
          apiRequests.push({
            url: response.url(),
            method: response.request().method(),
            status: response.status(),
            response: responseData
          });
          console.log(`📡 API Call: ${response.request().method()} ${response.url()} - ${response.status()}`);
        } catch (e) {
          // Non-JSON response
          apiRequests.push({
            url: response.url(),
            method: response.request().method(),
            status: response.status()
          });
        }
      }
    });
    
    await page.goto('https://repshield.io');
    await page.click('a:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Test registration API
    await page.click('button:has-text("Create Account")');
    await page.fill('input[id="register-firstname"]', 'API');
    await page.fill('input[id="register-lastname"]', 'Test');
    await page.fill('input[id="register-email"]', `apitest${Date.now()}@example.com`);
    await page.fill('input[id="register-password"]', 'apitest123');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(3000);
    
    // Test login API  
    await page.click('button:has-text("Sign In")');
    await page.fill('input[id="login-email"]', 'test@example.com');
    await page.fill('input[id="login-password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    
    console.log('\n📊 API Request Summary:');
    apiRequests.forEach(req => {
      console.log(`${req.method} ${req.url} - Status: ${req.status}`);
      if (req.response) {
        console.log(`   Response: ${JSON.stringify(req.response).substring(0, 100)}...`);
      }
    });
    
    // Verify we captured auth-related API calls
    const authCalls = apiRequests.filter(req => 
      req.url.includes('/login') || 
      req.url.includes('/register') || 
      req.url.includes('/auth')
    );
    
    expect(authCalls.length).toBeGreaterThan(0);
    console.log(`✅ Captured ${authCalls.length} authentication API calls`);
  });
}); 