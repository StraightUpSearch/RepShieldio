import { test, expect } from '@playwright/test';

test.describe('Frontend Content Check', () => {
  test('Check what content is actually served', async ({ page }) => {
    console.log('🔍 Checking frontend content...');
    
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`Page title: "${title}"`);
    console.log(`Current URL: ${url}`);
    
    // Get page content
    const bodyContent = await page.locator('body').textContent();
    console.log(`Body content length: ${bodyContent?.length || 0} characters`);
    
    // Check for key elements
    const hasRepShield = bodyContent?.includes('RepShield');
    const hasCreateAccount = bodyContent?.includes('Create Account');
    const hasSignIn = bodyContent?.includes('Sign In');
    const hasLogin = bodyContent?.includes('Login');
    
    console.log(`Contains "RepShield": ${hasRepShield}`);
    console.log(`Contains "Create Account": ${hasCreateAccount}`);
    console.log(`Contains "Sign In": ${hasSignIn}`);
    console.log(`Contains "Login": ${hasLogin}`);
    
    // Look for any buttons
    const buttons = await page.locator('button').count();
    console.log(`Number of buttons found: ${buttons}`);
    
    if (buttons > 0) {
      for (let i = 0; i < Math.min(buttons, 5); i++) {
        const buttonText = await page.locator('button').nth(i).textContent();
        console.log(`Button ${i + 1}: "${buttonText}"`);
      }
    }
    
    // Look for tabs specifically
    const tabs = await page.locator('[role="tab"]').count();
    console.log(`Number of tabs found: ${tabs}`);
    
    if (tabs > 0) {
      for (let i = 0; i < tabs; i++) {
        const tabText = await page.locator('[role="tab"]').nth(i).textContent();
        console.log(`Tab ${i + 1}: "${tabText}"`);
      }
    }
    
    // Check for any React errors in console
    const hasError = bodyContent?.includes('error') || bodyContent?.includes('Error');
    console.log(`Page contains error text: ${hasError}`);
    
    // If we find RepShield but no Create Account, it's a UI issue
    if (hasRepShield && !hasCreateAccount) {
      console.log('❌ DIAGNOSIS: Frontend loads but Create Account button missing');
    } else if (!hasRepShield) {
      console.log('❌ DIAGNOSIS: Frontend not loading properly');
    } else {
      console.log('✅ DIAGNOSIS: Frontend appears to be working');
    }
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'debug-frontend.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-frontend.png');
  });
}); 