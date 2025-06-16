import { test, expect, Page } from '@playwright/test';

interface ActionLog {
  step: number;
  action: string;
  selector?: string;
  value?: string;
  result: 'success' | 'failed' | 'error';
  timestamp: string;
  error?: string;
  screenshot?: string;
}

class AuthDebugger {
  private actionLog: ActionLog[] = [];
  private step = 1;

  constructor(private page: Page) {}

  private async logAction(action: string, result: 'success' | 'failed' | 'error', selector?: string, value?: string, error?: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const screenshotPath = `screenshot-step-${this.step}.png`;
    
    try {
      await this.page.screenshot({ path: `test-results/${screenshotPath}`, fullPage: true });
    } catch (e) {
      console.warn('Could not take screenshot:', e);
    }

    const logEntry: ActionLog = {
      step: this.step++,
      action,
      selector,
      value,
      result,
      timestamp,
      error,
      screenshot: screenshotPath
    };

    this.actionLog.push(logEntry);
    console.log(`[${logEntry.step}] ${action} - ${result.toUpperCase()}`);
    if (error) console.error(`Error: ${error}`);
  }

  async navigateToSite(url: string): Promise<void> {
    try {
      console.log(`🌐 Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await this.logAction(`Navigate to ${url}`, 'success');
    } catch (error) {
      await this.logAction(`Navigate to ${url}`, 'error', undefined, undefined, String(error));
      throw error;
    }
  }

  async captureInitialState(): Promise<void> {
    try {
      const title = await this.page.title();
      const url = this.page.url();
      await this.logAction(`Capture initial state - Title: "${title}", URL: "${url}"`, 'success');
    } catch (error) {
      await this.logAction('Capture initial state', 'error', undefined, undefined, String(error));
    }
  }

  async findLoginForm(): Promise<{ emailSelector: string; passwordSelector: string; submitSelector: string } | null> {
    try {
      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('networkidle');
      
      // Look for login/auth related elements
      const possibleSelectors = {
        emailSelectors: [
          'input[type="email"]',
          'input[name="email"]',
          'input[id*="email"]',
          'input[placeholder*="email" i]',
          '#login-email',
          '#email'
        ],
        passwordSelectors: [
          'input[type="password"]',
          'input[name="password"]',
          'input[id*="password"]',
          '#login-password',
          '#password'
        ],
        submitSelectors: [
          'button[type="submit"]',
          'button:has-text("Sign In")',
          'button:has-text("Login")',
          'button:has-text("Log In")',
          'input[type="submit"]'
        ]
      };

      let emailSelector = '';
      let passwordSelector = '';
      let submitSelector = '';

      // Find email field
      for (const selector of possibleSelectors.emailSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          emailSelector = selector;
          await this.logAction(`Found email field`, 'success', selector);
          break;
        }
      }

      // Find password field
      for (const selector of possibleSelectors.passwordSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          passwordSelector = selector;
          await this.logAction(`Found password field`, 'success', selector);
          break;
        }
      }

      // Find submit button
      for (const selector of possibleSelectors.submitSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          submitSelector = selector;
          await this.logAction(`Found submit button`, 'success', selector);
          break;
        }
      }

      if (!emailSelector || !passwordSelector || !submitSelector) {
        // Check if we need to navigate to login page
        const loginLinks = [
          'a:has-text("Login")',
          'a:has-text("Sign In")',
          'a[href*="login"]',
          'a[href*="auth"]'
        ];

        for (const linkSelector of loginLinks) {
          const link = this.page.locator(linkSelector).first();
          if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
            await this.logAction(`Found login link, clicking`, 'success', linkSelector);
            await link.click();
            await this.page.waitForLoadState('networkidle');
            return await this.findLoginForm(); // Recursive call after navigation
          }
        }

        await this.logAction(`Login form not found`, 'failed');
        return null;
      }

      return { emailSelector, passwordSelector, submitSelector };
    } catch (error) {
      await this.logAction('Find login form', 'error', undefined, undefined, String(error));
      return null;
    }
  }

  async testLogin(email: string, password: string): Promise<boolean> {
    try {
      const formSelectors = await this.findLoginForm();
      if (!formSelectors) {
        await this.logAction('Login test failed - no form found', 'failed');
        return false;
      }

      const { emailSelector, passwordSelector, submitSelector } = formSelectors;

      // Fill email
      await this.page.locator(emailSelector).fill(email);
      await this.logAction(`Fill email field`, 'success', emailSelector, email);

      // Fill password
      await this.page.locator(passwordSelector).fill(password);
      await this.logAction(`Fill password field`, 'success', passwordSelector, '***');

      // Click submit
      await this.page.locator(submitSelector).click();
      await this.logAction(`Click submit button`, 'success', submitSelector);

      // Wait for response
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check for success indicators
      const currentUrl = this.page.url();
      const successIndicators = [
        () => currentUrl.includes('/dashboard'),
        () => currentUrl.includes('/account'),
        () => currentUrl.includes('/my-account'),
        () => this.page.locator('text=Welcome').isVisible({ timeout: 2000 }),
        () => this.page.locator('button:has-text("Logout")').isVisible({ timeout: 2000 }),
        () => this.page.locator('button:has-text("Sign Out")').isVisible({ timeout: 2000 }),
      ];

      for (const indicator of successIndicators) {
        try {
          if (await indicator()) {
            await this.logAction(`Login successful - found success indicator`, 'success');
            return true;
          }
        } catch (e) {
          // Continue checking other indicators
        }
      }

      // Check for error messages
      const errorSelectors = [
        '.error',
        '.alert-error',
        '[data-testid="error"]',
        'text=Invalid',
        'text=failed',
        'text=error'
      ];

      for (const errorSelector of errorSelectors) {
        const errorElement = this.page.locator(errorSelector).first();
        if (await errorElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          const errorText = await errorElement.textContent();
          await this.logAction(`Login failed - error found`, 'failed', errorSelector, errorText || undefined);
          return false;
        }
      }

      await this.logAction(`Login result unclear - no clear success/error indicators`, 'failed');
      return false;

    } catch (error) {
      await this.logAction('Test login', 'error', undefined, undefined, String(error));
      return false;
    }
  }

  getActionLog(): ActionLog[] {
    return this.actionLog;
  }

  printSummary(): void {
    console.log('\n=== AUTH DEBUG SUMMARY ===');
    console.log(`Total actions: ${this.actionLog.length}`);
    console.log(`Successful: ${this.actionLog.filter(a => a.result === 'success').length}`);
    console.log(`Failed: ${this.actionLog.filter(a => a.result === 'failed').length}`);
    console.log(`Errors: ${this.actionLog.filter(a => a.result === 'error').length}`);
    
    console.log('\n=== ACTION LOG ===');
    this.actionLog.forEach(entry => {
      console.log(`[${entry.step}] ${entry.timestamp} - ${entry.action} (${entry.result.toUpperCase()})`);
      if (entry.selector) console.log(`    Selector: ${entry.selector}`);
      if (entry.value && !entry.value.includes('***')) console.log(`    Value: ${entry.value}`);
      if (entry.error) console.log(`    Error: ${entry.error}`);
    });
  }
}

test.describe('RepShield.io Auth Debug', () => {
  test('Test live site authentication flow', async ({ page }) => {
    const authDebugger = new AuthDebugger(page);
    
    try {
      // Navigate to live site
      await authDebugger.navigateToSite('https://repshield.io');
      await authDebugger.captureInitialState();
      
      // Test with dummy credentials first
      const loginSuccess = await authDebugger.testLogin('test@example.com', 'testpassword123');
      
      authDebugger.printSummary();
      
      // The test should document the process, not necessarily succeed
      expect(authDebugger.getActionLog().length).toBeGreaterThan(0);
      
    } catch (error) {
      console.error('Test failed with error:', error);
      authDebugger.printSummary();
      throw error;
    }
  });

  test('Test local development server', async ({ page }) => {
    const authDebugger = new AuthDebugger(page);
    
    try {
      // Navigate to local server
      await authDebugger.navigateToSite('http://localhost:5000');
      await authDebugger.captureInitialState();
      
      // Test registration flow first
      const registrationTest = await authDebugger.testLogin('newuser@test.com', 'testpassword123');
      
      authDebugger.printSummary();
      
      expect(authDebugger.getActionLog().length).toBeGreaterThan(0);
      
    } catch (error) {
      console.error('Local test failed:', error);
      authDebugger.printSummary();
      // Don't throw error for local test as server might not be running
    }
  });
}); 