// Review screenshots of the production build served at http://127.0.0.1:4321 (npm run build && npm run preview).
// Output defaults to ../review-shots; override with REVIEW_DIR. Not part of the shipped site.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.env.REVIEW_DIR ?? join(process.cwd(), '..', 'review-shots');
mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:4321';
const browser = await chromium.launch({ channel: 'chrome' });

const shots = [
  // [file, path, width, scheme, deviceScaleFactor]
  ['home-desktop-1440', '/', 1440, 'light', 1],
  ['home-large-1680', '/', 1680, 'light', 1],
  ['home-laptop-1024', '/', 1024, 'light', 1],
  ['home-tablet-820', '/', 820, 'light', 2],
  ['home-phone-375', '/', 375, 'light', 2],
  ['home-desktop-1440-dark', '/', 1440, 'dark', 1],
  ['projects-desktop-1440', '/projects/', 1440, 'light', 1],
  ['projects-tablet-820', '/projects/', 820, 'light', 2],
  ['projects-phone-375', '/projects/', 375, 'light', 2],
  ['rbrain-desktop-1440', '/projects/rbrain/', 1440, 'light', 1],
  ['rbrain-phone-375', '/projects/rbrain/', 375, 'light', 2],
  ['rbrain-desktop-1280-dark', '/projects/rbrain/', 1280, 'dark', 1],
  ['about-desktop-1440', '/about/', 1440, 'light', 1],
  ['about-phone-375', '/about/', 375, 'light', 2],
  ['not-found-desktop-1440', '/404.html', 1440, 'light', 1],
];
// ONLY=name1,name2 limits the run to those files (interaction shots run only when ONLY is unset)
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
for (const [file, path, width, scheme, dsf] of shots) {
  if (only && !only.includes(file)) continue;
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, deviceScaleFactor: dsf, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + path);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(out, `${file}.png`), fullPage: true });
  await ctx.close();
}
// interaction: keyboard focus on the home project link
if (!only) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#projects .proj h3 a').focus();
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(out, 'home-keyboard-focus.png'), clip: { x: 0, y: 300, width: 1440, height: 900 } });
  await ctx.close();
}
await browser.close();
console.log(`screenshots in ${out}`);
