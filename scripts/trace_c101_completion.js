import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function main() {
  console.log('Launching browser to trace Chamber 101 completion...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER ERROR:', err));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); window.location.hash = ''; });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  
  // Skip cinematic & start game
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button[aria-label="START NEW GAME"]');
  await new Promise(r => setTimeout(r, 500));
  const confirmBtn = await page.$('button.btn-confirm-overwrite');
  if (confirmBtn) await confirmBtn.click();
  await new Promise(r => setTimeout(r, 1000));
  await page.click('button.btn-briefing-skip');
  await new Promise(r => setTimeout(r, 3000));

  console.log('--- In Chamber 101 ---');
  // Dismiss tutorial
  const dismissBtn = await page.$('button.btn-tutorial-dismiss');
  if (dismissBtn) await dismissBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  // Collect key via accessible button
  console.log('Collecting brass key...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Collect Key') || b.getAttribute('aria-label')?.includes('Brass Key'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Override RULE_01 via terminal
  console.log('Opening terminal...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Open Terminal"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Clicking quick override button...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Execute Rule Rewrite Sequence"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Close terminal
  console.log('Closing terminal...');
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close terminal"], button.terminal-close-btn');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check state before exit interaction
  const stateBefore = await page.evaluate(() => {
    return {
      activeStoryBeatChamber: !!document.querySelector('.cinematic-transition-backdrop'),
      isTransitioning: !!document.querySelector('.chamber-transition-overlay'),
      pointerLock: !!document.pointerLockElement
    };
  });
  console.log('State before door click:', stateBefore);

  // Click exit door
  console.log('Interacting with exit door...');
  await page.evaluate(() => {
    const doorBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Exit') || b.textContent?.includes('Door') || b.getAttribute('aria-label')?.includes('Door') || b.getAttribute('aria-label')?.includes('Blast Door'));
    console.log('Door button found:', !!doorBtn, doorBtn?.getAttribute('aria-label'));
    if (doorBtn) doorBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const stateAfterDoor = await page.evaluate(() => {
    return {
      activeStoryBeatChamber: !!document.querySelector('.cinematic-transition-backdrop'),
      isTransitioning: !!document.querySelector('.chamber-transition-overlay'),
      currentChamberText: document.querySelector('.hud-accessible-only span')?.textContent,
      objectiveText: document.querySelector('.hud-objective-title')?.textContent,
      pointerLock: !!document.pointerLockElement
    };
  });
  console.log('State after door click:', stateAfterDoor);

  // Wait for transition to complete
  console.log('Waiting for transition...');
  await new Promise(r => setTimeout(r, 6000));

  const stateAfterTransition = await page.evaluate(() => {
    return {
      activeStoryBeatChamber: !!document.querySelector('.cinematic-transition-backdrop'),
      isTransitioning: !!document.querySelector('.chamber-transition-overlay'),
      currentChamberText: document.querySelector('.hud-accessible-only span')?.textContent,
      objectiveText: document.querySelector('.hud-objective-title')?.textContent,
      pointerLock: !!document.pointerLockElement
    };
  });
  console.log('State after transition completed:', stateAfterTransition);

  // Test movement
  console.log('Testing W key press and tracking camera position...');
  const posBefore = await page.evaluate(() => {
    // Check if camera can be read
    return document.querySelector('.chamber-canvas-element') ? 'canvas present' : 'no canvas';
  });
  console.log('posBefore:', posBefore);

  await browser.close();
  console.log('Trace complete.');
}

main().catch(console.error);
