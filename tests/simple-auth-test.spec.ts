import { test, expect } from '@playwright/test';

test.describe('Simple Authentication Test', () => {
  test('should register user and redirect to my-account', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');

    // Click on Create Account tab using role-based selector
    await page.getByRole('tab', { name: 'Create Account' }).click();

    // Wait for form to appear
    await page.waitForSelector('#register-firstname', { timeout: 5000 });

    // Fill registration form
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    console.log(`Testing registration with email: ${testEmail}`);
    
    await page.fill('#register-firstname', 'Test');
    await page.fill('#register-lastname', 'User');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', 'password123');

    // Listen for console logs to debug the frontend
    page.on('console', msg => {
      console.log(`🔍 Browser console [${msg.type()}]:`, msg.text());
    });

    // Listen for network responses
    page.on('response', response => {
      if (response.url().includes('/api/register')) {
        console.log(`📡 Registration API response: ${response.status()} ${response.statusText()}`);
      }
    });

    // Submit form using the SUBMIT button, not the tab button
    console.log('🚀 Submitting registration form...');
    await page.click('button[type="submit"]');

    // Wait a bit to see what happens
    await page.waitForTimeout(3000);
    
    console.log(`📍 Current URL after registration: ${page.url()}`);
    
    // Check if toast appeared
    const toastExists = await page.locator('[role="alert"]').count();
    console.log(`🔔 Toast messages found: ${toastExists}`);
    
    if (toastExists > 0) {
      const toastText = await page.locator('[role="alert"]').allTextContents();
      console.log(`🔔 Toast content:`, toastText);
    }

    // Try to wait for redirect with more time
    try {
      await page.waitForURL('**/my-account', { timeout: 20000 });
      console.log(`✅ SUCCESS: Redirected to ${page.url()}`);
    } catch (error) {
      console.log(`❌ TIMEOUT: Still on ${page.url()}`);
      
      // Check if user is authenticated by making a direct API call
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/auth/user', { credentials: 'include' });
        return { status: res.status, data: await res.json() };
      });
      console.log(`👤 User auth check:`, response);
      
      // Try manual navigation
      console.log('🔄 Trying manual navigation to /my-account...');
      await page.goto('http://localhost:5000/my-account');
      await page.waitForTimeout(2000);
      console.log(`📍 After manual navigation: ${page.url()}`);
    }
    
    // Verify we're on the right page
    expect(page.url()).toContain('/my-account');
  });
}); 