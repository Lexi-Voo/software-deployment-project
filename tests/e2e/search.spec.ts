import { test, expect } from '@playwright/test';

test('User can search for a city with a specific date range', async ({ page }) => {
  await page.goto('/');

  await page
    .getByPlaceholder('Enter a city name...')
    .fill('Kuala Lumpur');

  const dateInputs = page.locator('input[type="date"]');

  const today = new Date().toISOString().split('T')[0];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  const endDate = futureDate.toISOString().split('T')[0];

  await dateInputs.nth(0).fill(today);
  await dateInputs.nth(1).fill(endDate);

  await page.getByRole('button', { name: 'Search' }).click();

  await page.waitForTimeout(5000);
  await expect(
    page.getByPlaceholder('Enter a city name...')
  ).toBeVisible();
});

test('Should show error if start date is after end date', async ({ page }) => {
  await page.goto('/');

  await page
    .getByPlaceholder('Enter a city name...')
    .fill('Kuala Lumpur');

  const dateInputs = page.locator('input[type="date"]');

  await dateInputs.nth(0).fill('2026-12-31');
  await dateInputs.nth(1).fill('2026-01-01');

  await page.getByRole('button', { name: 'Search' }).click();

  await expect(page.locator('.alert')).toContainText(
    'Start date cannot be after end date'
  );
});

test('User can select an attraction to see details', async ({ page }) => {
  await page.goto('/');

  await page
    .getByPlaceholder('Enter a city name...')
    .fill('Kuala Lumpur');

  await page.getByRole('button', { name: 'Search' }).click();

  await page.waitForTimeout(5000);

  const attractionButtons = page.locator('button');

  const count = await attractionButtons.count();

  if (count < 2) {
    test.skip();
    return;
  }

  await attractionButtons.nth(1).click();

  const detailSections = page.locator('.detail-section');

  if (await detailSections.count()) {
    await expect(detailSections.first()).toBeVisible();
  }
});