import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user and redirect to /my-account', async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://localhost:5000/login');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Wait for and verify the tabs are present using role-based selectors
    await expect(page.getByRole('tab', { name: 'Sign In' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('tab', { name: 'Create Account' })).toBeVisible({ timeout: 10000 });
    
    // Click on "Create Account" tab using role-based selector
    await page.getByRole('tab', { name: 'Create Account' }).click();
    
    // Wait for register form to be visible
    await expect(page.locator('#register-firstname')).toBeVisible({ timeout: 5000 });
    
    // Generate unique test data
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    console.log(`Testing registration with email: ${testEmail}`);
    
    // Fill out the registration form
    await page.fill('#register-firstname', 'Test');
    await page.fill('#register-lastname', 'User');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', 'password123');
    
    // Submit the form using the correct submit button
    await page.click('button[type="submit"]');
    
    // Wait for potential redirect and check if we're on /my-account
    await page.waitForURL('**/my-account', { timeout: 15000 });
    
    // Verify we're on the correct page
    expect(page.url()).toContain('/my-account');
    
    // Verify user is logged in by checking for typical account page elements
    await expect(page.locator('body')).toContainText('My Account', { timeout: 5000 });
  });
  
  test('should login existing user and redirect to /my-account', async ({ page }) => {
    // First register a user to test login
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');
    
    const timestamp = Date.now();
    const testEmail = `login${timestamp}@example.com`;
    
    console.log(`Testing login flow with email: ${testEmail}`);
    
    // Wait for tabs to be present
    await expect(page.getByRole('tab', { name: 'Create Account' })).toBeVisible({ timeout: 10000 });
    
    // Register first
    await page.getByRole('tab', { name: 'Create Account' }).click();
    await expect(page.locator('#register-firstname')).toBeVisible({ timeout: 5000 });
    
    await page.fill('#register-firstname', 'Login');
    await page.fill('#register-lastname', 'Test');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to my-account
    await page.waitForURL('**/my-account', { timeout: 15000 });
    
    // Go back to login page to test login functionality
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');
    
    // The Sign In tab should be active by default, just wait for login form
    await expect(page.locator('#login-email')).toBeVisible({ timeout: 10000 });
    
    // Now test login
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', 'password123');
    
    // Find the login submit button in the login form
    await page.locator('form').filter({ hasText: 'Sign in to access your reputation dashboard' }).locator('button[type="submit"]').click();
    
    // Should redirect to /my-account
    await page.waitForURL('**/my-account', { timeout: 15000 });
    expect(page.url()).toContain('/my-account');
  });
}); 