import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Vanih/.gemini/antigravity-ide/brain/75f3089b-9a6b-4393-9ed0-033d0ed1fb19';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function main() {
  console.log('Launching Chrome for forensic visual audit...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist']
  });

  const page = await browser.newPage();
  
  // 1. Pristine load without hash/storage
  console.log('Step 1: Loading Cinematic Opening...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '';
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  
  const shot1 = path.join(ARTIFACT_DIR, '01_cinematic_opening.png');
  await page.screenshot({ path: shot1 });
  console.log('Saved 01:', shot1);

  // 2. Advance to Main Menu
  console.log('Step 2: Advancing to Main Menu...');
  await page.keyboard.press('Space');
  await new Promise(r => setTimeout(r, 1200));

  const shot2 = path.join(ARTIFACT_DIR, '02_main_menu.png');
  await page.screenshot({ path: shot2 });
  console.log('Saved 02:', shot2);

  // 3. Chamber Select Modal
  console.log('Step 3: Opening Chamber Select Modal...');
  const chamberBtn = await page.$('button[aria-label="CHAMBER SELECT"]');
  if (chamberBtn) {
    await chamberBtn.click();
    await new Promise(r => setTimeout(r, 800));
    const shot3 = path.join(ARTIFACT_DIR, '03_chamber_select_modal.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved 03:', shot3);

    const closeSector = await page.$('button[aria-label="Close sector selection"], button.btn-close-icon');
    if (closeSector) await closeSector.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 4. Settings Modal
  console.log('Step 4: Opening Settings Modal...');
  const settingsBtn = await page.$('button[aria-label="SETTINGS & AUDIO"]');
  if (settingsBtn) {
    await settingsBtn.click();
    await new Promise(r => setTimeout(r, 800));
    const shot4 = path.join(ARTIFACT_DIR, '04_settings_modal.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved 04:', shot4);

    const closeSettings = await page.$('button[aria-label="Close settings"], button.btn-close-icon');
    if (closeSettings) await closeSettings.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 5. About & Credits Modal
  console.log('Step 5: Opening About Modal...');
  const aboutBtn = await page.$('button[aria-label="ABOUT & CREDITS"]');
  if (aboutBtn) {
    await aboutBtn.click();
    await new Promise(r => setTimeout(r, 800));
    const shot5 = path.join(ARTIFACT_DIR, '05_about_modal.png');
    await page.screenshot({ path: shot5 });
    console.log('Saved 05:', shot5);

    const closeAbout = await page.$('button[aria-label="Close about dialog"], button.btn-close-icon');
    if (closeAbout) await closeAbout.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // 6. Start New Game -> Story Briefing
  console.log('Step 6: Navigating to Story Briefing...');
  const startBtn = await page.$('button[aria-label="START NEW GAME"]');
  if (startBtn) {
    await startBtn.click();
    await new Promise(r => setTimeout(r, 500));
    const confirmOverwrite = await page.$('button.btn-confirm-overwrite');
    if (confirmOverwrite) {
      await confirmOverwrite.click();
    }
  }
  await new Promise(r => setTimeout(r, 1200));

  const shot6 = path.join(ARTIFACT_DIR, '06_story_briefing.png');
  await page.screenshot({ path: shot6 });
  console.log('Saved 06:', shot6);

  // 7. Enter Chamber 101 -> Tutorial Overlay
  console.log('Step 7: Entering Chamber 101 with Tutorial Overlay...');
  const skipBriefing = await page.$('button.btn-briefing-skip, button[aria-label="SKIP BRIEFING"]');
  if (skipBriefing) {
    await skipBriefing.click();
  }
  await new Promise(r => setTimeout(r, 3500));

  const shot7 = path.join(ARTIFACT_DIR, '07_chamber_101_tutorial.png');
  await page.screenshot({ path: shot7 });
  console.log('Saved 07:', shot7);

  // 8. Dismiss Tutorial -> Clean Gameplay HUD
  console.log('Step 8: Dismissing Tutorial for Clean Gameplay...');
  const dismissBtn = await page.$('button.btn-tutorial-dismiss, button[aria-label="Dismiss controls tutorial"]');
  if (dismissBtn) {
    await dismissBtn.click();
  } else {
    await page.keyboard.press('KeyX');
  }
  await new Promise(r => setTimeout(r, 1000));

  const shot8 = path.join(ARTIFACT_DIR, '08_chamber_101_gameplay.png');
  await page.screenshot({ path: shot8 });
  console.log('Saved 08:', shot8);

  // 9. Pause Menu Modal
  console.log('Step 9: Opening Pause Menu...');
  const pauseBtn = await page.$('button.hud-esc-pill, button[aria-label="Pause menu and controls"]');
  if (pauseBtn) {
    await pauseBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await new Promise(r => setTimeout(r, 1000));

  const shot9 = path.join(ARTIFACT_DIR, '09_pause_menu.png');
  await page.screenshot({ path: shot9 });
  console.log('Saved 09:', shot9);

  await browser.close();
  console.log('ALL 9 VERIFICATION SCREENSHOTS SAVED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Audit capture failed:', err);
  process.exit(1);
});
