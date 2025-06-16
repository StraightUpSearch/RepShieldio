import { test, expect } from '@playwright/test';

test.describe('Console Error Debug', () => {
  test('Check for JavaScript errors preventing form submission', async ({ page }) => {
    console.log('🐛 Checking for JavaScript console errors...');
    
    // Capture all console messages
    const consoleMessages: Array<{type: string, text: string}> = [];
    const jsErrors: string[] = [];
    
    page.on('console', msg => {
      const messageType = msg.type();
      const messageText = msg.text();
      consoleMessages.push({ type: messageType, text: messageText });
      
      if (messageType === 'error') {
        jsErrors.push(messageText);
        console.log(`❌ JS ERROR: ${messageText}`);
      } else {
        console.log(`📝 ${messageType.toUpperCase()}: ${messageText}`);
      }
    });
    
    // Capture network failures
    page.on('requestfailed', request => {
      console.log(`❌ NETWORK FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    // Track API calls
    const apiCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(`${request.method()} ${request.url()}`);
        console.log(`📡 API CALL: ${request.method()} ${request.url()}`);
      }
    });
    
    console.log('📍 Step 1: Navigate to localhost:5000');
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Step 2: Check for initial JavaScript errors');
    if (jsErrors.length > 0) {
      console.log(`❌ Found ${jsErrors.length} JavaScript errors on page load:`);
      jsErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ No JavaScript errors on page load');
    }
    
    console.log('📍 Step 3: Click Create Account tab');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    console.log('📍 Step 4: Fill registration form');
    await page.fill('input[id="register-firstname"]', 'Console');
    await page.fill('input[id="register-lastname"]', 'Debug');
    await page.fill('input[id="register-email"]', `console${Date.now()}@test.com`);
    await page.fill('input[id="register-password"]', 'consolepass123');
    
    console.log('📍 Step 5: Check for errors after form filling');
    const errorsAfterFill = jsErrors.slice(); // Copy current errors
    
    console.log('📍 Step 6: Submit form and monitor for errors');
    const submitButton = page.locator('button[type="submit"]:has-text("Create Account")');
    await submitButton.click();
    
    // Wait and monitor
    await page.waitForTimeout(5000);
    
    console.log('📍 Step 7: Final error and API call analysis');
    console.log(`Total JavaScript errors: ${jsErrors.length}`);
    console.log(`Total API calls made: ${apiCalls.length}`);
    
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript Errors Found:');
      jsErrors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }
    
    if (apiCalls.length === 0) {
      console.log('❌ NO API CALLS MADE - This confirms frontend is not calling the API');
    } else {
      console.log('✅ API calls made:');
      apiCalls.forEach(call => console.log(`  - ${call}`));
    }
    
    // Check current URL
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    // Check if we can see the submit button state
    const buttonText = await submitButton.textContent();
    console.log(`Submit button text: ${buttonText}`);
    
    const buttonDisabled = await submitButton.isDisabled();
    console.log(`Submit button disabled: ${buttonDisabled}`);
    
    // This test should help us understand WHY the API call isn't happening
    console.log('🎯 CONCLUSION:');
    if (jsErrors.length > 0) {
      console.log('❌ JavaScript errors are likely preventing form submission');
    } else if (apiCalls.length === 0) {
      console.log('❌ No JS errors but no API calls - likely form submission handler issue');
    } else {
      console.log('✅ Form submission working - API calls detected');
    }
  });
}); 