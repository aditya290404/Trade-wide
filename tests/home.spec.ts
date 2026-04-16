import { test, expect } from '@playwright/test';

test.describe('TradeWide Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the home page
    await page.goto('http://localhost:5173');
  });

  test('should load the dashboard with hero section', async ({ page }) => {
    // Check main heading
    const title = page.locator('h1');
    await expect(title).toContainText('Learn Trading with Zero Risk');
    
    // Check visibility of key primary buttons
    await expect(page.locator('text=View Portfolio')).toBeVisible();
    await expect(page.locator('text=Trade History')).toBeVisible();
  });

  test('should display the Live Market Watch section', async ({ page }) => {
    // Wait for the market watchlist to appear
    const watchlist = page.locator('text=Live Market Watch');
    await expect(watchlist).toBeVisible();
  });

  test('navigation should work to trades page', async ({ page }) => {
    await page.click('text=Trades');
    await expect(page).toHaveURL(/.*trades/);
  });
});
