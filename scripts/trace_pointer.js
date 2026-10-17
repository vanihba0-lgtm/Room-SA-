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

  // Lock pointer by clicking canvas
  await page.click('canvas');
  await new Promise(r => setTimeout(r, 500));

  // Check initial position by inspecting player ref if possible, or movement
  console.log('Testing W key in normal Chamber 101...');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.up('KeyW');

  // Collect key & override rule
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Collect Key') || b.getAttribute('aria-label')?.includes('Brass Key'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

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

  // Click exit door
  console.log('Clicking exit door to trigger transition...');
  await page.evaluate(() => {
    const doorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Exit') || b.getAttribute('aria-label')?.includes('Blast Door'));
    if (doorBtn) doorBtn.click();
  });

  // Wait for transition to complete
  await new Promise(r => setTimeout(r, 5500));

  // Inspect state
  const stateInfo = await page.evaluate(() => {
    return {
      pointerLockElement: document.pointerLockElement?.tagName,
      activeElement: document.activeElement?.tagName,
      modals: Array.from(document.querySelectorAll('[role="dialog"]')).map(d => d.getAttribute('aria-label')),
      overlays: Array.from(document.querySelectorAll('.chamber-transition-overlay, .cinematic-transition-backdrop')).map(o => o.className),
    };
  });
  console.log('State info after transition:', stateInfo);

  await browser.close();
}

main().catch(console.error);
