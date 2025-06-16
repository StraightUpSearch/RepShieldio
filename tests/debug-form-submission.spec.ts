import { test, expect } from '@playwright/test';

test.describe('Debug Form Submission', () => {
  test('Debug why registration form doesn\'t call API', async ({ page }) => {
    console.log('🐛 Debugging form submission issue');
    
    // Monitor console for errors
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      } else {
        consoleMessages.push(msg.text());
        console.log(`📝 CONSOLE: ${msg.text()}`);
      }
    });
    
    // Monitor network for any API calls
    const apiCalls: Array<{url: string, method: string, data?: any}> = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        let data;
        try {
          data = request.postData() ? JSON.parse(request.postData()!) : null;
        } catch {
          data = request.postData();
        }
        
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          data
        });
        
        console.log(`🌐 API CALL: ${request.method()} ${request.url()}`);
        if (data) {
          console.log(`   Data: ${JSON.stringify(data)}`);
        }
      }
    });
    
    // Navigate to registration
    await page.goto('http://localhost:5000/login');
    await page.waitForLoadState('networkidle');
    
    // Switch to registration tab
    console.log('📱 Clicking Create Account tab');
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);
    
    // Fill form step by step and monitor for changes
    console.log('📝 Filling form fields');
    
    const firstName = await page.locator('#register-firstname');
    const lastName = await page.locator('#register-lastname');
    const email = await page.locator('#register-email');
    const password = await page.locator('#register-password');
    const submitButton = await page.locator('button:has-text("Create Account")').last();
    
    console.log('✅ Found all form elements');
    
    // Check if form elements are enabled
    console.log('🔍 Checking form element states:');
    console.log(`   First Name enabled: ${await firstName.isEnabled()}`);
    console.log(`   Last Name enabled: ${await lastName.isEnabled()}`);
    console.log(`   Email enabled: ${await email.isEnabled()}`);
    console.log(`   Password enabled: ${await password.isEnabled()}`);
    console.log(`   Submit button enabled: ${await submitButton.isEnabled()}`);
    
    // Fill form
    await firstName.fill('Debug');
    console.log('✅ Filled first name');
    
    await lastName.fill('User');
    console.log('✅ Filled last name');
    
    const testEmail = `debugform${Date.now()}@example.com`;
    await email.fill(testEmail);
    console.log(`✅ Filled email: ${testEmail}`);
    
    await password.fill('debugpass123');
    console.log('✅ Filled password');
    
    // Check form validation
    const isFormValid = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.checkValidity() : false;
    });
    
    console.log(`📋 Form valid: ${isFormValid}`);
    
    // Add event listeners to see what happens when form submits
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          console.log('🚀 Form submit event triggered', e);
          console.log('📋 Form data:', new FormData(form));
        });
      }
      
      // Also listen for button clicks
      const buttons = document.querySelectorAll('button[type="submit"]');
      buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          console.log('🖱️ Submit button clicked', e);
          console.log('🔘 Button disabled:', button.disabled);
        });
      });
    });
    
    console.log('📤 Submitting form...');
    
    // Click submit and wait for response
    await submitButton.click();
    
    // Wait for any potential API calls
    await page.waitForTimeout(3000);
    
    // Check final state
    const currentUrl = page.url();
    console.log(`📍 Final URL: ${currentUrl}`);
    
    console.log('\n📊 Summary:');
    console.log(`   Console messages: ${consoleMessages.length}`);
    console.log(`   Console errors: ${consoleErrors.length}`);
    console.log(`   API calls made: ${apiCalls.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleErrors.forEach(error => console.log(`   ${error}`));
    }
    
    if (apiCalls.length > 0) {
      console.log('\n🌐 API Calls:');
      apiCalls.forEach(call => {
        console.log(`   ${call.method} ${call.url}`);
        if (call.data) {
          console.log(`     Data: ${JSON.stringify(call.data)}`);
        }
      });
    } else {
      console.log('\n❌ NO API CALLS WERE MADE!');
      console.log('   This indicates the form submission is not triggering the mutation.');
    }
    
    // Check if we can find the registration mutation in React DevTools
    const reactErrors = await page.evaluate(() => {
      // Try to access React DevTools or components
      try {
        const reactRoot = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        return reactRoot ? 'React DevTools available' : 'No React DevTools';
      } catch (e) {
        return `React access error: ${e.message}`;
      }
    });
    
    console.log(`⚛️ React state: ${reactErrors}`);
    
    expect(true).toBe(true); // Always pass, we're just debugging
  });
}); 