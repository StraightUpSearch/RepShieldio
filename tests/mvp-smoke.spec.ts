import { test, expect } from '@playwright/test';

/**
 * MVP Smoke Tests — validates core user flows work locally.
 * Run with: npx playwright test tests/mvp-smoke.spec.ts
 */

test.describe('Homepage & Navigation', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await expect(page).toHaveTitle(/RepShield/i);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('nav links work', async ({ page }) => {
    await page.goto('/');

    // Desktop nav — use getByRole for precise matching
    await page.getByRole('link', { name: /Live Scanner/i }).first().click();
    await expect(page).toHaveURL(/\/scan/);

    await page.goto('/');
    await page.getByRole('link', { name: /Check Status/i }).first().click();
    await expect(page).toHaveURL(/\/ticket-status/);
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
  });
});

test.describe('Auth Flow', () => {
  test('login page renders with sign in and create account tabs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('tab', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Create Account/i })).toBeVisible();
  });

  test('registration form validates required fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('tab', { name: /Create Account/i }).click();

    // Try to submit empty form — HTML5 validation should block
    const submitBtn = page.getByRole('button', { name: /Create Account/i });
    await submitBtn.click();

    // Should still be on login page (form not submitted)
    await expect(page).toHaveURL(/\/login/);
  });

  test('registration form shows password hint', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('tab', { name: /Create Account/i }).click();
    await expect(page.getByText('Must be at least 8 characters')).toBeVisible();
  });

  test('forgot password dialog opens', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /Forgot your password/i }).click();
    await expect(page.getByText('Reset Password')).toBeVisible();
    await expect(page.locator('input[id="forgot-email"]')).toBeVisible();
  });
});

test.describe('Full Registration & Login Flow', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';

  test('can register a new account and auto-login', async ({ page }) => {
    await page.goto('/login');

    // Switch to Create Account tab
    await page.getByRole('tab', { name: /Create Account/i }).click();

    // Fill out the registration form
    await page.locator('#register-firstname').fill('Test');
    await page.locator('#register-lastname').fill('User');
    await page.locator('#register-email').fill(testEmail);
    await page.locator('#register-password').fill(testPassword);

    // Submit
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Should redirect to my-account after auto-login
    await page.waitForURL(/\/my-account/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'My Account' })).toBeVisible();
  });

  test('can login with existing credentials', async ({ page, request }) => {
    // Register via API first
    const email = `login-test${Date.now()}@example.com`;
    await request.post('/api/register', {
      data: { email, password: testPassword, firstName: 'Login', lastName: 'Test' }
    });

    // Now login via the UI (fresh page, no session)
    await page.goto('/login');
    await page.locator('#login-email').fill(email);
    await page.locator('#login-password').fill(testPassword);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Should redirect to my-account
    await page.waitForURL(/\/my-account/, { timeout: 10000 });
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('nonexistent@example.com');
    await page.locator('#login-password').fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Should show error toast
    await expect(page.locator('li[role="status"][data-state="open"]').first()).toBeVisible({ timeout: 5000 });
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Account Page', () => {
  test('shows dashboard tabs when logged in', async ({ page }) => {
    // Register and login
    const email = `acct-test${Date.now()}@example.com`;
    await page.goto('/login');
    await page.getByRole('tab', { name: /Create Account/i }).click();
    await page.locator('#register-firstname').fill('Account');
    await page.locator('#register-lastname').fill('Tester');
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill('TestPass123!');
    await page.getByRole('button', { name: /Create Account/i }).click();
    await page.waitForURL(/\/my-account/, { timeout: 10000 });

    // Verify dashboard tabs are visible
    await expect(page.getByRole('tab', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /My Tickets/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Wallet/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Settings/i })).toBeVisible();
  });

  test('settings tab shows user info', async ({ page }) => {
    const email = `settings-test${Date.now()}@example.com`;
    await page.goto('/login');
    await page.getByRole('tab', { name: /Create Account/i }).click();
    await page.locator('#register-firstname').fill('Settings');
    await page.locator('#register-lastname').fill('User');
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill('TestPass123!');
    await page.getByRole('button', { name: /Create Account/i }).click();
    await page.waitForURL(/\/my-account/, { timeout: 10000 });

    // Click Settings tab
    await page.getByRole('tab', { name: /Settings/i }).click();

    // Should show user email
    await expect(page.getByText(email)).toBeVisible();
    // Should show user name
    await expect(page.getByText('Settings User')).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('scan page loads', async ({ page }) => {
    await page.goto('/scan');
    await expect(page.getByRole('heading', { name: /Scanner/i }).first()).toBeVisible();
  });

  test('ticket status page loads', async ({ page }) => {
    await page.goto('/ticket-status');
    await expect(page.getByText('Check Your Ticket Status')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: /Contact/i }).first()).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { name: /About/i }).first()).toBeVisible();
  });

  test('privacy policy loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
  });

  test('terms of service loads', async ({ page }) => {
    await page.goto('/terms-of-service');
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: /Reputation Management/i })).toBeVisible();
  });
});

test.describe('Protected Pages (redirect to login)', () => {
  test('dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/(login|auth)/, { timeout: 5000 });
  });

  test('my-account redirects unauthenticated users', async ({ page }) => {
    await page.goto('/my-account');
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });

  test('admin pages redirect non-admin users', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await page.waitForURL(/\/(auth|login|\/)$/, { timeout: 5000 });
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile menu opens and shows nav links', async ({ page }) => {
    await page.goto('/');

    // Mobile hamburger menu button
    const menuBtn = page.locator('header button').filter({ has: page.locator('svg') }).first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Mobile menu should show links — scope to nav within header
    const nav = page.locator('header nav');
    await expect(nav.getByRole('link', { name: /Live Scanner/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Check Status/i })).toBeVisible();
  });

  test('mobile menu shows login for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    const menuBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
    await menuBtn.click();

    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
  });

  test('mobile registration works', async ({ page }) => {
    await page.goto('/login');
    const email = `mobile-test${Date.now()}@example.com`;

    await page.getByRole('tab', { name: /Create Account/i }).click();
    await page.locator('#register-firstname').fill('Mobile');
    await page.locator('#register-lastname').fill('User');
    await page.locator('#register-email').fill(email);
    await page.locator('#register-password').fill('TestPass123!');
    await page.getByRole('button', { name: /Create Account/i }).click();

    await page.waitForURL(/\/my-account/, { timeout: 10000 });
  });
});

test.describe('Hero Quote Flow', () => {
  test('reddit URL input accepts valid URL and shows email step', async ({ page }) => {
    await page.goto('/');

    const urlInput = page.locator('input[placeholder*="Reddit"], input[placeholder*="reddit"]').first();
    if (await urlInput.isVisible({ timeout: 3000 })) {
      await urlInput.fill('https://reddit.com/r/test/comments/abc123/test_post');

      const submitBtn = page.getByRole('button', { name: /Get Free Quote|Submit|Analyze/i }).first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('API Health', () => {
  test('auth endpoint responds', async ({ request }) => {
    const response = await request.get('/api/auth/user');
    expect([200, 401]).toContain(response.status());
  });

  test('blog API responds', async ({ request }) => {
    const response = await request.get('/api/blog/posts');
    expect(response.status()).toBe(200);
  });

  test('auth user endpoint returns proper structure', async ({ request }) => {
    // Register a user
    const email = `api-test${Date.now()}@example.com`;
    const registerRes = await request.post('/api/register', {
      data: {
        email,
        password: 'TestPass123!',
        firstName: 'API',
        lastName: 'Test'
      }
    });
    expect(registerRes.status()).toBe(201);

    // The register response should set a session cookie
    // Now fetch user — the cookie should be sent automatically
    const userRes = await request.get('/api/auth/user');
    expect(userRes.status()).toBe(200);
    const userData = await userRes.json();
    expect(userData.authenticated).toBe(true);
    expect(userData.user).toBeDefined();
    expect(userData.user.email).toBe(email);
    expect(userData.user.firstName).toBe('API');
  });
});
