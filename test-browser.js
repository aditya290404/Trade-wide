import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:8080/trades', { waitUntil: 'load', timeout: 5000 });
    console.log('Page loaded');
    await page.waitForTimeout(2000);
  } catch (err) {
    console.log('Navigation failed:', err);
  }
  
  await browser.close();
})();
