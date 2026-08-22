import { expect, test } from '@playwright/test';

test('deve carregar a aplicação base', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Aplicação base' })).toBeVisible();
});
