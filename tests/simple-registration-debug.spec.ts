import { test, expect } from '@playwright/test';

test.describe('Simple Registration Debug', () => {
  test('Step by step registration debug', async ({ page }) => {
    console.log('🐛 Simple registration debug starting...');
    
    // Track all requests
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requests.push(`${request.method()} ${request.url()}`);
        console.log(`📡 API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    // Go to local server
    console.log('📍 Step 1: Navigate to localhost:5000');
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Click on Create Account tab
    console.log('📍 Step 2: Click Create Account tab');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    // Fill form fields one by one
    console.log('📍 Step 3: Fill form fields');
    await page.fill('input[id="register-firstname"]', 'Simple');
    await page.fill('input[id="register-lastname"]', 'Debug');
    await page.fill('input[id="register-email"]', `simple${Date.now()}@test.com`);
    await page.fill('input[id="register-password"]', 'simplepass123');
    
    // Wait a moment to ensure form is ready
    await page.waitForTimeout(500);
    
    console.log('📍 Step 4: Submit form');
    await page.click('button[type="submit"]:has-text("Create Account")');
    
    // Wait for any network activity
    console.log('📍 Step 5: Wait for network activity...');
    await page.waitForTimeout(3000);
    
    // Check what happened
    console.log('📍 Step 6: Check results');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    console.log(`Total API requests made: ${requests.length}`);
    requests.forEach(req => console.log(`  - ${req}`));
    
    // Check if user appears logged in
    const loggedIn = await page.locator('text=My Account').isVisible().catch(() => false);
    console.log(`User appears logged in: ${loggedIn}`);
    
    // Check for any error messages
    const errorVisible = await page.locator('text=Registration failed').isVisible().catch(() => false);
    console.log(`Error message visible: ${errorVisible}`);
    
    // Verify we made the registration API call
    const registrationCalls = requests.filter(req => req.includes('/api/register'));
    console.log(`Registration API calls: ${registrationCalls.length}`);
    
    expect(registrationCalls.length).toBeGreaterThan(0);
  });
}); 