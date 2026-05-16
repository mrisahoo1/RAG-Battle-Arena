import { expect, test } from '@playwright/test';

test('arena renders and opens answer explanation', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle('RAG Battle Arena');
  await expect(page.getByRole('heading', { name: /Compare retrieval architectures/i })).toBeVisible();
  await expect(page.locator('article')).toHaveCount(4);
  await page.getByRole('button', { name: /Run battle/i }).click();
  await page.getByRole('button', { name: /Explain why this answer/i }).first().click();
  await expect(page.getByText('Why this answer?')).toBeVisible();
  await expect(page.getByText('Prompt template')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('platform pages render primary surfaces', async ({ page }) => {
  await page.goto('/retrieval-lab');
  await expect(page.getByText('Chunk explorer')).toBeVisible();
  await page.goto('/evaluation');
  await expect(page.getByText('Evaluation winner')).toBeVisible();
  await page.goto('/observability');
  await expect(page.getByText('Latency and token consumption')).toBeVisible();
  await page.goto('/architecture');
  await expect(page.getByText('Ingestion flow')).toBeVisible();
});
