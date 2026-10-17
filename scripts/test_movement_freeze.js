import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.error('ERR:', err));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); window.location.hash = ''; });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button[aria-label="START NEW GAME"]');
  await new Promise(r => setTimeout(r, 500));
  const confirmBtn = await page.$('button.btn-confirm-overwrite');
  if (confirmBtn) await confirmBtn.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button.btn-briefing-skip');
  await new Promise(r => setTimeout(r, 3000));

  // Dismiss tutorial
  const dismissBtn = await page.$('button.btn-tutorial-dismiss');
  if (dismissBtn) await dismissBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // Collect key
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Collect Key') || b.getAttribute('aria-label')?.includes('Brass Key'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Override RULE_01
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Open Terminal"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Execute Rule Rewrite Sequence"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close terminal"], button.terminal-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  console.log('Door interaction 1 (unlock door)...');
  await page.evaluate(() => {
    const doorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Exit') || b.getAttribute('aria-label')?.includes('Blast Door'));
    if (doorBtn) doorBtn.click();
  });

  console.log('Waiting 6s for transition...');
  await new Promise(r => setTimeout(r, 6000));

  // Check state after transition
  const debugInfo = await page.evaluate(() => {
    return {
      currentRoom: document.querySelector('.hud-accessible-only span')?.textContent,
      hasTransitionModal: !!document.querySelector('.cinematic-transition-backdrop'),
      hasFadeOverlay: !!document.querySelector('.chamber-transition-overlay'),
      pointerLocked: !!document.pointerLockElement,
      activeTag: document.activeElement?.tagName,
      activeClass: document.activeElement?.className,
    };
  });
  console.log('Debug info after transition:', debugInfo);

  // Now click canvas to re-lock pointer if needed
  await page.click('canvas');
  await new Promise(r => setTimeout(r, 500));

  // Test moving forward
  console.log('Holding W for 1 second...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.up('KeyW');

  // Let's also check door interaction 2!
  console.log('Door interaction 2...');
  await page.evaluate(() => {
    const doorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Exit') || b.getAttribute('aria-label')?.includes('Blast Door'));
    console.log('Door button 2 text:', doorBtn?.textContent, doorBtn?.getAttribute('aria-label'));
    if (doorBtn) doorBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const debugInfo2 = await page.evaluate(() => {
    return {
      currentRoom: document.querySelector('.hud-accessible-only span')?.textContent,
      hasTransitionModal: !!document.querySelector('.cinematic-transition-backdrop'),
    };
  });
  console.log('Debug info after door click 2:', debugInfo2);

  await browser.close();
}

main().catch(console.error);
