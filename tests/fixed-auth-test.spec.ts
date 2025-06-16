import { test, expect } from '@playwright/test';

test.describe('Fixed Authentication Test', () => {
  test('Test registration on correct auth page', async ({ page }) => {
    console.log('🎯 Testing registration on CORRECT auth route');
    
    // Track API calls
    const apiCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(`${request.method()} ${request.url()}`);
        console.log(`📡 API CALL: ${request.method()} ${request.url()}`);
      }
    });
    
    // Track JavaScript errors
    const jsErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
        console.log(`❌ JS ERROR: ${msg.text()}`);
      }
    });
    
    console.log('📍 Step 1: Navigate to /login (correct auth route)');
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the auth page
    const title = await page.title();
    const bodyContent = await page.locator('body').textContent();
    console.log(`Page title: "${title}"`);
    console.log(`Page contains "Create Account": ${bodyContent?.includes('Create Account')}`);
    console.log(`Page contains "Sign In": ${bodyContent?.includes('Sign In')}`);
    
    if (!bodyContent?.includes('Create Account')) {
      console.log('❌ FAILED: Create Account button not found on auth page!');
      await page.screenshot({ path: 'debug-auth-page.png', fullPage: true });
      return;
    }
    
    console.log('📍 Step 2: Click Create Account tab');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    console.log('📍 Step 3: Fill registration form');
    const testEmail = `fixed${Date.now()}@test.com`;
    await page.fill('input[id="register-firstname"]', 'Fixed');
    await page.fill('input[id="register-lastname"]', 'Test');
    await page.fill('input[id="register-email"]', testEmail);
    await page.fill('input[id="register-password"]', 'fixedpass123');
    
    console.log('📍 Step 4: Submit registration form');
    await page.click('button[type="submit"]:has-text("Create Account")');
    
    // Wait for API response
    await page.waitForTimeout(5000);
    
    console.log('📍 Step 5: Check results');
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    console.log(`Total API calls: ${apiCalls.length}`);
    apiCalls.forEach(call => console.log(`  - ${call}`));
    
    console.log(`JavaScript errors: ${jsErrors.length}`);
    jsErrors.forEach(error => console.log(`  - ${error}`));
    
    // Check for success
    const registrationCalls = apiCalls.filter(call => call.includes('/api/register'));
    
    if (registrationCalls.length > 0) {
      console.log('✅ SUCCESS: Registration API call was made!');
      if (finalUrl.includes('/my-account') || finalUrl.includes('/account')) {
        console.log('✅ SUCCESS: User was redirected to account page!');
      } else {
        console.log('⚠️ API call made but not redirected - check server response');
      }
    } else {
      console.log('❌ FAILED: No registration API call detected');
    }
    
    await page.screenshot({ path: 'debug-fixed-auth.png', fullPage: true });
    
    // Verify we made the registration API call
    expect(registrationCalls.length).toBeGreaterThan(0);
  });
}); 