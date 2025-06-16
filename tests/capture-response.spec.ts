import { test, expect } from '@playwright/test';

test.describe('Capture Registration Response', () => {
  test('Capture exact API response to debug redirect issue', async ({ page }) => {
    console.log('🔍 Capturing registration API response details');
    
    let registrationResponse: any = null;
    let registrationError: any = null;
    
    // Capture registration response
    page.on('response', async (response) => {
      if (response.url().includes('/api/register')) {
        console.log(`📥 Registration Response: ${response.status()} ${response.url()}`);
        
        try {
          const data = await response.json();
          registrationResponse = data;
          console.log(`📊 Response Data: ${JSON.stringify(data, null, 2)}`);
        } catch (e) {
          try {
            const text = await response.text();
            registrationResponse = text;
            console.log(`📊 Response Text: ${text}`);
          } catch (e2) {
            registrationError = `Failed to read response: ${e2.message}`;
            console.log(`❌ Response Error: ${registrationError}`);
          }
        }
        
        const headers = await response.allHeaders();
        console.log(`📋 Response Headers: ${JSON.stringify(headers, null, 2)}`);
      }
    });
    
    // Monitor mutations for success/error
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Registration') || text.includes('registration')) {
        console.log(`📝 Console (${msg.type()}): ${text}`);
      }
      if (text.includes('mutation') || text.includes('Mutation')) {
        console.log(`🔄 Mutation Log: ${text}`);
      }
      if (msg.type() === 'error' && !text.includes('Stripe') && !text.includes('X-Frame')) {
        console.log(`❌ Console Error: ${text}`);
      }
    });
    
    // Navigate and fill form
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    const testEmail = `capture${Date.now()}@test.com`;
    await page.fill('input[id="register-firstname"]', 'Capture');
    await page.fill('input[id="register-lastname"]', 'Test');
    await page.fill('input[id="register-email"]', testEmail);
    await page.fill('input[id="register-password"]', 'capturepass123');
    
    console.log('📤 Submitting registration form...');
    await page.click('button[type="submit"]:has-text("Create Account")');
    
    // Wait longer for response
    await page.waitForTimeout(8000);
    
    console.log('📍 Final Analysis:');
    console.log(`  Final URL: ${page.url()}`);
    
    if (registrationResponse) {
      console.log('✅ Registration Response Received:');
      console.log(JSON.stringify(registrationResponse, null, 2));
      
      // Check if response indicates success
      if (registrationResponse.user || registrationResponse.success !== false) {
        console.log('✅ Response appears successful - should trigger redirect');
        
        // Check if page actually redirected
        if (page.url().includes('/my-account')) {
          console.log('✅ SUCCESS: User redirected to account page!');
        } else {
          console.log('❌ ISSUE: Successful response but no redirect');
          console.log('   This suggests frontend mutation onSuccess not firing');
        }
      } else {
        console.log('❌ Response indicates failure');
      }
    } else if (registrationError) {
      console.log('❌ Registration Error:', registrationError);
    } else {
      console.log('❌ No registration response captured');
    }
    
    await page.screenshot({ path: 'debug-response-capture.png', fullPage: true });
  });
}); 