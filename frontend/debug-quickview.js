const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3100/en/explore');
  await page.waitForLoadState('networkidle');
  const card = page.locator('article').first();
  const before = await card.boundingBox();
  console.log('before', JSON.stringify(before));
  const qv = card.getByRole('button', { name: /^Quick view image:/ });
  await qv.click();
  await page.waitForTimeout(1000);
  const after = await card.boundingBox();
  console.log('after', JSON.stringify(after));
  console.log('diff', Math.abs((after?.height ?? 0) - (before?.height ?? 0)));
  console.log('styles', await card.evaluate((el) => ({
    height: getComputedStyle(el).height,
    overflow: getComputedStyle(el).overflow,
    position: getComputedStyle(el).position,
    display: getComputedStyle(el).display,
    minHeight: getComputedStyle(el).minHeight,
  })));
  await browser.close();
})();
