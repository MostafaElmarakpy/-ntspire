const { chromium, expect } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3100/en/explore');
  const card = page.locator('article').first();
  const beforeBounds = await card.boundingBox();
  const quickView = card.getByRole('button', { name: /^Quick view image:/ });
  await quickView.click();
  const dialog = page.getByRole('dialog', { name: /^Quick view:/ });
  await expect(dialog).toBeVisible();
  const afterBounds = await card.boundingBox();
  console.log('before', beforeBounds);
  console.log('after', afterBounds);
  console.log('diff', Math.abs((afterBounds?.height ?? 0) - (beforeBounds?.height ?? 0)));
  browser.close();
})();
