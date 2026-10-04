import { test, expect } from '@playwright/test';
import { routes, widths } from './routes';

test.describe('keyboard and navigation', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('skip link moves focus to main; first tab stop is the skip link', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('a.skip')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#main');
  });

  test('keyboard focus is visible on links', async ({ page }) => {
    await page.goto('/');
    await page.locator('#projects .proj h3 a').focus();
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle + ' ' + getComputedStyle(document.activeElement!).outlineWidth);
    expect(outline).toBe('solid 2px');
  });

  test('navigation: header, home entry, project label, crumb, and back link reach their pages', async ({ page }) => {
    await page.goto('/');
    await page.locator('header nav').getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.locator('header nav a[aria-current="page"]')).toHaveText('Projects');
    await page.locator('.pair .label h2 a').click();
    await expect(page).toHaveURL(/\/projects\/rbrain\/$/);
    await expect(page.locator('h1')).toHaveText('rbrain');
    await page.locator('.pair.top .kicker a').click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await page.goto('/projects/rbrain/');
    await page.locator('.next a').click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await page.goto('/');
    await page.locator('#projects .proj h3 a').click();
    await expect(page).toHaveURL(/\/projects\/rbrain\/$/);
    await page.locator('header nav').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await page.locator('header .name').click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('diagrams', () => {
  for (const width of widths) {
    test(`a horizontal diagram is either one row or a column, never a wrapped row (${width}px)`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/projects/', '/projects/rbrain/']) {
        await page.goto(route);
        const bad = await page.evaluate(() => [...document.querySelectorAll('.flow')].filter((f) => {
          const tops = [...f.children].map((c) => Math.round(c.getBoundingClientRect().top));
          const lefts = [...f.children].map((c) => Math.round(c.getBoundingClientRect().left));
          const oneRow = new Set(tops).size === 1;
          const oneColumn = new Set(lefts).size === 1 || tops.every((t, i) => i === 0 || t > tops[i - 1]);
          return !(oneRow || oneColumn);
        }).length);
        expect(bad, route).toBe(0);
      }
    });
  }
});

test.describe('motion', () => {
  test('no decorative motion exists: no infinite or running animations on any page', async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);
      const running = await page.evaluate(() => document.getAnimations().length);
      expect(running, route).toBe(0);
    }
  });

  test('reduced motion: navigation has no view transition', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto('/');
    const vt = await p.evaluate(() => [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.includes('@view-transition') && matchMedia((r as CSSMediaRule).conditionText ?? '').matches); } catch { return false; } }));
    expect(vt).toBe(false);
    await ctx.close();
  });
});

test.describe('layout stability', () => {
  for (const [name, width] of [['desktop', 1280], ['phone', 375]] as const) {
    test(`cumulative layout shift stays under 0.1 (${name})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() => {
        (window as any).__cls = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      });
      for (const route of ['/', '/projects/', '/projects/rbrain/', '/about/']) {
        await page.goto(route);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        const cls = await page.evaluate(() => (window as any).__cls);
        expect(cls, route).toBeLessThan(0.1);
      }
    });
  }
});
