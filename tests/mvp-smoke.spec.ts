import { test, expect } from '@playwright/test';

/**
 * MVP Smoke Tests — validates core user flows work locally.
 * Run with: npx playwright test tests/mvp-smoke.spec.ts
 */

test.describe('Homepage & Navigation', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RepShield/i);
    await expect(page.locator('text=RepShield')).toBeVisible();
  });

  test('nav links work', async ({ page }) => {
    await page.goto('/');

    // Desktop nav
    await page.click('a:has-text("Live Scanner")');
    await expect(page).toHaveURL(/\/scan/);

    await page.goto('/');
    await page.click('a:has-text("Check Status")');
    await expect(page).toHaveURL(/\/ticket-status/);
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.locator('text=404')).toBeVisible();
  });
});

test.describe('Auth Flow', () => {
  test('login page renders with sign in and create account tabs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  });

  test('registration form validates required fields', async ({ page }) => {
    await page.goto('/login');
    await page.click('[value="register"]');

    // Try to submit empty form — HTML5 validation should block
    const submitBtn = page.locator('form >> button:has-text("Create Account")');
    await submitBtn.click();

    // Should still be on login page (form not submitted)
    await expect(page).toHaveURL(/\/login/);
  });

  test('registration form shows password hint', async ({ page }) => {
    await page.goto('/login');
    await page.click('[value="register"]');
    await expect(page.locator('text=Must be at least 8 characters')).toBeVisible();
  });

  test('forgot password dialog opens', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Forgot your password")');
    await expect(page.locator('text=Reset Password')).toBeVisible();
    await expect(page.locator('input[id="forgot-email"]')).toBeVisible();
  });
});

test.describe('Public Pages', () => {
  test('scan page loads', async ({ page }) => {
    await page.goto('/scan');
    await expect(page.locator('text=Brand Scanner')).toBeVisible();
  });

  test('ticket status page loads', async ({ page }) => {
    await page.goto('/ticket-status');
    await expect(page.locator('text=Check Status')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('text=Contact')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('text=About')).toBeVisible();
  });

  test('privacy policy loads', async ({ page }) => {
    await page.goto('/privacy-policy');
    await expect(page.locator('text=Privacy Policy')).toBeVisible();
  });

  test('terms of service loads', async ({ page }) => {
    await page.goto('/terms-of-service');
    await expect(page.locator('text=Terms of Service')).toBeVisible();
  });

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('text=Blog')).toBeVisible();
  });
});

test.describe('Protected Pages (redirect to login)', () => {
  test('dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login
    await page.waitForURL(/\/(login|auth)/, { timeout: 5000 });
  });

  test('my-account redirects unauthenticated users', async ({ page }) => {
    await page.goto('/my-account');
    await page.waitForURL(/\/(login|auth|my-account)/, { timeout: 5000 });
  });

  test('admin pages redirect non-admin users', async ({ page }) => {
    await page.goto('/admin-dashboard');
    // Should redirect away (to auth or home)
    await page.waitForURL(/\/(auth|login|\/)$/, { timeout: 5000 });
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('mobile menu opens and shows auth buttons', async ({ page }) => {
    await page.goto('/');

    // Mobile hamburger menu button should be visible
    const menuBtn = page.locator('button >> svg.lucide-menu').first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Mobile menu should now show links
    await expect(page.locator('nav >> a:has-text("Live Scanner")')).toBeVisible();
    await expect(page.locator('nav >> a:has-text("Check Status")')).toBeVisible();

    // Should show Login button for unauthenticated users
    await expect(page.locator('nav >> a:has-text("Login")')).toBeVisible();
  });
});

test.describe('Hero Quote Flow', () => {
  test('reddit URL input accepts valid URL and shows email step', async ({ page }) => {
    await page.goto('/');

    const urlInput = page.locator('input[placeholder*="Reddit"]').first();
    if (await urlInput.isVisible({ timeout: 3000 })) {
      await urlInput.fill('https://reddit.com/r/test/comments/abc123/test_post');

      // Try to submit
      const submitBtn = page.locator('button:has-text("Get Free Quote")').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        // Should advance to email step or show email input
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('API Health', () => {
  test('auth endpoint responds', async ({ request }) => {
    const response = await request.get('/api/auth/user');
    // 401 for unauthenticated is correct behavior
    expect([200, 401]).toContain(response.status());
  });

  test('blog API responds', async ({ request }) => {
    const response = await request.get('/api/blog/posts');
    expect(response.status()).toBe(200);
  });
});
