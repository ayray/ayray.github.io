import { test, expect } from '@playwright/test';
import { routes, widths } from './routes';

for (const width of widths) {
  test.describe(`layout at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });
    for (const route of routes) {
      test(`${route}: no horizontal overflow, one h1, main landmark, sane heading order`, async ({ page }) => {
        await page.goto(route);
        const m = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          inner: window.innerWidth,
          h1: document.querySelectorAll('h1').length,
          mains: document.querySelectorAll('main').length,
          levels: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => +h.tagName[1]),
          clipped: [...document.querySelectorAll('main *')].filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
          }).map((el) => el.tagName + '.' + el.className).slice(0, 3),
        }));
        expect(m.scroll, 'horizontal overflow').toBeLessThanOrEqual(m.inner);
        expect(m.clipped, 'element outside the viewport').toEqual([]);
        expect(m.h1).toBe(1);
        expect(m.mains).toBe(1);
        m.levels.forEach((lv, i) => { if (i) expect(lv - m.levels[i - 1], `heading jump at index ${i}`).toBeLessThanOrEqual(1); });
      });
    }
  });
}

const cpl = (page: import('@playwright/test').Page, selector: string) => page.evaluate((sel) => {
  const p = document.querySelector(sel) as HTMLElement;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
  probe.textContent = 'x'.repeat(100);
  p.appendChild(probe);
  const per = probe.getBoundingClientRect().width / 100;
  probe.remove();
  return p.getBoundingClientRect().width / per;
}, selector);

test('line length stays readable: project prose under 75 characters per line, Background under 50', async ({ page }) => {
  await page.setViewportSize({ width: 1680, height: 900 });
  await page.goto('/projects/rbrain/');
  expect(await cpl(page, '.prose p')).toBeLessThan(75);
  await page.goto('/');
  expect(await cpl(page, '.band .measure')).toBeLessThan(50);
});

test('compositions: hero beside its context on desktop, stacked below 1024px; label above the object on phones', async ({ page }) => {
  for (const [w, beside] of [[1680, true], [1280, true], [1024, true], [820, false], [375, false]] as const) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    const [h1, now] = await Promise.all([page.locator('.hero h1').boundingBox(), page.locator('.hero .now').boundingBox()]);
    expect(now!.x > h1!.x + 100, `${w}px hero`).toBe(beside);
    await page.goto('/projects/');
    const [obj, label] = await Promise.all([page.locator('.pair .obj').first().boundingBox(), page.locator('.pair .label').first().boundingBox()]);
    if (beside) expect(label!.x, `${w}px pair`).toBeGreaterThan(obj!.x + obj!.width - 1);
    else expect(label!.y, `${w}px pair`).toBeLessThan(obj!.y);
  }
});

test('touch targets: primary nav is at least 44px tall on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  for (const a of await page.locator('header nav a').all()) {
    const box = await a.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('header stays on one row from 700px up, and the nav is on its own row only on phones', async ({ page }) => {
  for (const [w, oneRow] of [[1280, true], [820, true], [700, true], [375, false]] as const) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    const [name, nav] = await Promise.all([page.locator('header .name').boundingBox(), page.locator('header nav').boundingBox()]);
    const sameRow = Math.abs((name!.y + name!.height / 2) - (nav!.y + nav!.height / 2)) < 30;
    expect(sameRow, `${w}px`).toBe(oneRow);
  }
});

test('the Back link aligns to the reading column', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/projects/rbrain/');
  const next = await page.locator('.next a').boundingBox();
  const prose = await page.locator('.prose').first().boundingBox();
  expect(Math.abs(next!.x - prose!.x)).toBeLessThan(2);
});
