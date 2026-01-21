import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const URL = 'https://support.hpe.com/docs/display/public/hpe-networking-eos/index.html';

async function scrapeWithPuppeteer() {
  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({ 
    headless: "new",
    // defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Network logging
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (['xhr', 'fetch'].includes(request.resourceType()) || request.url().includes('json')) {
        console.log('REQ:', request.url());
    }
    request.continue();
  });

  try {
    console.log(`🌐 Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Helper to click by text
    const clickByText = async (text) => {
        const el = await page.evaluateHandle((text) => {
            const all = Array.from(document.querySelectorAll('label, span, div, input'));
            return all.find(e => e.innerText && e.innerText.includes(text) && e.offsetParent !== null);
        }, text);

        if (el) {
            try {
                // Try clicking the element
                await el.click(); // ElementHandle.click triggers mouse events
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    };

    console.log('🖱️ Clicking Legacy...');
    await clickByText('Legacy Announcements');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('🖱️ Clicking Switches...');
    await clickByText('Switches');
    
    console.log('⏳ Waiting 10s...');
    await new Promise(r => setTimeout(r, 10000));

    // Exit early to see logs
    await browser.close();

  } catch (e) {
      console.error(e);
      await browser.close();
  }
}

scrapeWithPuppeteer();
