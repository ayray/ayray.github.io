import { test, expect } from '@playwright/test';
import { routes } from './routes';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const visibleText = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ');
const pages = () => walk('dist').filter((f) => f.endsWith('.html') && !/aboutme\.html|projects\.html$/.test(f));

// Raymond's cleared stance (CLM-030) keeps the em dash he wrote; it is the only place one may appear.
const STANCE = 'I build software for the messy part—where product decisions meet real-world systems and failure has consequences.';

// Non-public phrases this site must never show. This repository is public, so only their SHA-256 hashes are stored here;
// the phrases are kept privately. Each built page's visible text is normalized the same way, every 1- to 5-word sequence
// is hashed, and any match fails the build check.
const tokens = (t: string) => t.normalize('NFKC').toLowerCase()
  .replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/(\d)([a-z])/g, '$1 $2').replace(/%/g, ' % ')
  .split(/[^a-z0-9%]+/).filter(Boolean);
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const NON_PUBLIC = new Set([
  '03f5ed581c44e3cf7672849ca3a6f6bbd3992f988aaf0735fac25d72fc7cacf3',
  '060204520e34d2207bdb177db8897e37688cec204db76e5501e3f38bd7d79319',
  '06fe93058800d0227b57b1690987e5fc3c69b74c4fab801020eba111ced6fb28',
  '0bebe4f827ba6313eed0f517e38d6c495265c165dafd8eae90a30c8545460d02',
  '10b637d883c024ea77fa942a33699035f3d0a3d5c60a810af2cf1e9ff011625b',
  '15aa4cf0c0d424f1aaf7d9c4771a828657cb93eac217e04e42024b0a1ede3129',
  '1dd97f4129667a9ee6b03193b3c4f7a7d4a446b4f9e5e24219d912f78e995068',
  '228dee63c633d74451d508bac8f5cff9c8c6a427e258ab076bee150a8fdb1316',
  '24f872ae9c7ea83c6411da845e28f10f0182d4597002c2b5dbb5164e8ee1135e',
  '2708f981d4b14fe38c91dbc257dc04fff7795e6bf78e58e19f5bbef5dd68b729',
  '2bed2032ed3d8300b7714ff77101e6c43637597977337c699191dd844c86a72d',
  '2c94c18e8404a2466e8438cc5cb1edaa57d9da1b8be47a7f54df928ca3ed560d',
  '323311905cf8505ae41e1b24a08c46b77d38d461442cf8f4575fb6f8408fd237',
  '32ceacc06e8970a0aa5554b60fc60f5a7685e66f25500a85cda86046b3a0a9d3',
  '3338cf4654503b67917ba4cb47bcf261d67025e9bd15fbf913c602226dd9d4e2',
  '34fb46c847bb9df96e5205a39d382f648a6e8dce1e014cd85b4ca6a88d88ed03',
  '3fabe81adce12c039003bf6f45a922f0922362d3123a1b928035c9f3a939bbcb',
  '3fe007c4b479f68e0302bf82c58efcacdd93a920d7531eaed4ec63c8df7a2564',
  '40510175845988f13f6162ed8526f0b09f73384467fa855e1e79b44a56562a58',
  '41242b9fae56fad4e6e77dfe33cb18d1c3fc583f988cf25ef9f2d9be0d440bbb',
  '41357e667cc91d012c6bc2c57cc80ea9c9be6fdf4b2a81b19ae5a0a0eaa78971',
  '424e9661130eeeb05edccfd89125d903eafd4e9f9cdf6d0b88fff6b51df92a69',
  '482b5190a023d95f91b3887189f51f5ba17d6a73ee04f9f6ffdeca162b82a6ee',
  '4ae587e9eabbaaa9e99d6c61a0d86fe248441379e98806809873758c53005640',
  '4ea5ee68fea05586106890ded5733820bb77d919cda27bc4b8139b7cd33b8889',
  '7171b73fae682f6d9ecd7f5df1e32181db261468c2819ee5f79f0bb55c83d700',
  '781a9710a21eda0984cd40392856cc443e46257f7e8ceac617873c2e1c1173fd',
  '94abcb2d2773df65cda0708afd551ea23131ec18400d7694cd971b016d86e7ae',
  '99497c84358f2273772f341abe1afbd7005a475ebed857a9aecc02b7353263d8',
  'a3145393aa69ec6cabcc651e74ffc989c239d21d9a9ab7b370ccd202b110a983',
  'a625159d18da57180b7215e56c4ca20cabf8bcd9b7030c8c460aeed7b5588c6c',
  'a74e503354fdd464eff1440f72fa800dcd9f4e24aa7778fd4cc02d4cde120437',
  'b090147020e033534635010c4f7eb6fc270d44e5df67ea9e744a8087df9ca106',
  'b37077ab55cc118d2ddc75604ebd37251dced9975b558757646fac355c406bd1',
  'b82a139057355271c48d2df962c79dce6e5809f49ffb43fb3247a5f23116d2e3',
  'b9549e9e9e7717c576d9e935c6d8135259cd6dad742538d38e7845aa862d0392',
  'bc23913772a2a9c4cb336e4b7b365ef007fc58ea29f81f95911bd9c403aa359b',
  'be6faca76642ef848e6a33a624321377c6c63744291d641792795e9831727705',
  'c6123621b97a5af6005bc91fe71a9b514488f1b63323e38cc7a7f004c17f5216',
  'cb164f503c86aeb1525f5285f3384052af7671b536d3e9e975dca49d01e4bb27',
  'd2de465fc2ea21ea28ab8fddc8bd39c6f45bde60cf02ff4f23acaf47332cb98e',
  'd33443a7db9f479e90b14c6b5889a3dbecef67c59b2b0781e758e4956c22e568',
  'd6fb966667c0c69b10ab98e64a3ff0ea9930148eedb8ce42ba54e9117a8c8f2f',
  'df2f7b955ba573ad404a73018787771e506801fbcf31edfe60e4f89cf5301427',
  'ef6009646394cfd6ff25a44fb68bfcc015170a5aefc7ff629d53ce2c364fb7ee',
  'f914c462c110a54343a79b466d06bebf3eddcb2495fe08f5f853eb0a949b251a',
  'ff682b12711d40be4db968a4f170ddf02d0c44490abbd922d3d1d32a6aa2bd30',
]);
function nonPublicMatches(text: string): string[] {
  const t = tokens(text);
  const hits: string[] = [];
  for (let n = 1; n <= 5; n++) {
    for (let i = 0; i + n <= t.length; i++) {
      const gram = t.slice(i, i + n).join(' ');
      if (NON_PUBLIC.has(sha256(gram))) hits.push(gram);
    }
  }
  return hits;
}

test('the non-public phrase guard matches its own normalization', () => {
  expect(NON_PUBLIC.size).toBeGreaterThan(40);
  expect(tokens('A 1,234-step plan: 12k at 5%')).toEqual(['a', '1234', 'step', 'plan', '12', 'k', 'at', '5', '%']);
});

test('built pages never contain non-public, private, or placeholder material', () => {
  const readable: Array<[RegExp, string]> = [
    [/\b\d+\s+commits?\b/i, 'commit counts'],
    [/[—–]/, 'em or en dash in copy (only the cleared stance may contain one)'],
    [/\b(Led|Owned the roadmap|Built, operates|Contributor|Primary release engineer)\b/, 'ownership label'],
    [/case study|supporting note/i, 'case-study vocabulary'],
    // contact and resume are intentionally absent in V1, with no placeholder
    [/not decided\]|resume|résumé|mailto:|tel:|contact me|coming soon|more soon|more to come/i, 'contact, resume, or placeholder'],
    [/class="placeholder"/, 'placeholder markup'],
  ];
  const files = pages();
  expect(files.length).toBe(5);
  for (const f of files) {
    const html = readFileSync(f, 'utf8');
    expect(html, `${f}: link to a retired /work/ route`).not.toMatch(/href="\/work/);
    const text = visibleText(html).replace(STANCE, '');
    expect(nonPublicMatches(text), `${f}: non-public phrase`).toEqual([]);
    for (const [re, why] of readable) expect(text, `${f}: ${why}`).not.toMatch(re);
  }
  expect(visibleText(readFileSync('dist/about/index.html', 'utf8'))).toContain(STANCE);
});

// The public surface is fixed: only these routes, files, collections, and page templates may exist. Anything else,
// including any retired employer page or a new collection, fails here without naming what it might be.
test('the built output is exactly the reviewed public surface', () => {
  const slugs = readdirSync('src/content/projects').filter((f) => f.endsWith('.yaml')).map((f) => f.replace(/\.yaml$/, ''));
  const html = walk('dist').filter((f) => f.endsWith('.html')).map((f) => f.slice('dist/'.length)).sort();
  expect(html).toEqual(['404.html', 'about/index.html', 'aboutme.html', 'index.html', 'projects.html', 'projects/index.html',
    ...slugs.map((s) => `projects/${s}/index.html`)].sort());
  expect(readdirSync('dist').sort()).toEqual(['404.html', '_astro', 'about', 'aboutme.html', 'favicon.svg', 'fonts', 'index.html', 'projects', 'projects.html']);
  expect(readdirSync('dist/projects').filter((f) => statSync(join('dist/projects', f)).isDirectory()).sort()).toEqual([...slugs].sort());
  expect(existsSync('dist/work')).toBe(false);
});

test('the source can only produce that surface: one content collection, a fixed set of page templates', () => {
  expect(readdirSync('src/content')).toEqual(['projects']);
  expect(readFileSync('src/content.config.ts', 'utf8')).toMatch(/export const collections = \{ projects \};/);
  expect(walk('src/pages').map((f) => f.slice('src/pages/'.length)).sort())
    .toEqual(['404.astro', 'about.astro', 'index.astro', 'projects/[slug].astro', 'projects/index.astro']);
  expect(readdirSync('src/content/projects').every((f) => f.endsWith('.yaml'))).toBe(true);
});

test('legacy URL stubs forward to the new pages', () => {
  expect(readFileSync('dist/aboutme.html', 'utf8')).toContain('url=/about/');
  expect(readFileSync('dist/projects.html', 'utf8')).toContain('url=/projects/');
  expect(statSync('dist/404.html').size).toBeGreaterThan(0);
});

test('legacy stubs redirect in the browser', async ({ page }) => {
  await page.goto('/aboutme.html');
  await expect(page).toHaveURL(/\/about\/$/);
  await page.goto('/projects.html');
  await expect(page).toHaveURL(/\/projects\/$/);
});

test('the view-transition rule ships only for no-preference motion', () => {
  const css = walk('dist/_astro').filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')).join('\n');
  expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[^}]*@view-transition/s);
});

for (const route of routes) {
  test(`${route}: requests stay same-origin and fonts are self-hosted`, async ({ page }) => {
    const external: string[] = [];
    page.on('request', (r) => { if (!r.url().startsWith('http://127.0.0.1:4321') && !r.url().startsWith('data:')) external.push(r.url()); });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    expect(external).toEqual([]);
    const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    if (route === '/') expect(fonts).toEqual(expect.arrayContaining(['Schibsted Grotesk', 'IBM Plex Mono']));
  });
}

test('mono is metadata only: never a heading, never above 14px', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll('body *').forEach((el) => {
        if (el.closest('.review')) return;
        const cs = getComputedStyle(el);
        if (!cs.fontFamily.includes('IBM Plex Mono')) return;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (!own) return;
        if (/^H[1-6]$/.test(el.tagName)) out.push(`mono heading ${el.tagName}: ${el.textContent!.slice(0, 30)}`);
        if (parseFloat(cs.fontSize) > 14) out.push(`mono ${cs.fontSize}: ${el.textContent!.slice(0, 30)}`);
      });
      return out;
    });
    expect(bad, route).toEqual([]);
  }
});

test('the review banner is present in a review build', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('aside.review')).toContainText('Review build, not published');
});

test('every failure or approval-only branch carries a reading-order label for assistive technology', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);
    const bad = await page.evaluate(() => [...document.querySelectorAll('.dia .branch')].filter((f) => !f.querySelector('.vh')).length);
    expect(bad, route).toBe(0);
  }
  await page.goto('/projects/rbrain/');
  expect(await page.locator('.dia .branch.cond').count()).toBeGreaterThan(0);
});

// Identity hierarchy (PORTFOLIO DEC-011): Raymond first; a job title is context, never identity.
test.describe('identity hierarchy', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the home h1 is the identity statement and the largest type on the site', async ({ page }) => {
    let largestElsewhere = 0;
    for (const route of routes) {
      await page.goto(route);
      const max = await page.evaluate(() => Math.max(...[...document.querySelectorAll('main *')]
        .filter((el) => !el.closest('.hero') && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
        .map((el) => parseFloat(getComputedStyle(el).fontSize))));
      largestElsewhere = Math.max(largestElsewhere, max);
    }
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText("I'm Raymond Sy.I make things.");
    const hero = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.hero h1 span')!).fontSize));
    expect(hero).toBeGreaterThan(largestElsewhere);
  });

  test('no job title appears in a heading, label, or link anywhere', async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);
      const hits = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, h4, dt, nav a, .label .kicker, .hero .now')]
        .map((el) => el.textContent!).filter((t) => /devsecops|engineer\b|product manager/i.test(t)));
      expect(hits, route).toEqual([]);
    }
  });

  test('on the home page the current title appears once, inside Background, at reading size', async ({ page }) => {
    await page.goto('/');
    const r = await page.evaluate(() => {
      const main = document.querySelector('main')!;
      const count = (main.textContent!.match(/DevSecOps/g) ?? []).length;
      const p = [...main.querySelectorAll('p')].find((x) => x.textContent!.includes('DevSecOps'))!;
      return { count, inBackground: !!p.closest('[aria-labelledby="background-h"]'), size: parseFloat(getComputedStyle(p).fontSize) };
    });
    expect(r.count).toBe(1);
    expect(r.inBackground).toBe(true);
    expect(r.size).toBeLessThanOrEqual(20);
  });

  test('Projects sits above Background on the home page', async ({ page }) => {
    await page.goto('/');
    const [p, b] = await Promise.all([page.locator('#projects-h').boundingBox(), page.locator('#background-h').boundingBox()]);
    expect(p!.y).toBeLessThan(b!.y);
  });

  test('"product" is never presented as a held title', async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);
      expect(await page.locator('main').textContent(), route).not.toMatch(/product manager|as a product/i);
    }
  });
});

test.describe('Projects with one project', () => {
  test('/projects/ lists exactly the projects that exist and implies no others', async ({ page }) => {
    const entries = readdirSync('src/content/projects').filter((f) => f.endsWith('.yaml'));
    await page.goto('/projects/');
    await expect(page.locator('main section.pair')).toHaveCount(entries.length);
    await expect(page.locator('main h2')).toHaveText(['rbrain']);
    expect(await page.locator('main').textContent()).not.toMatch(/\b\d+\s+projects?\b|one project|only project|more (projects|soon)|coming|stay tuned/i);
  });

  test('the home page shows the same projects and links to /projects/', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#projects .proj h3')).toHaveText(['rbrain']);
    await expect(page.locator('#projects a[href="/projects/"]')).toHaveCount(1);
  });

  test('object and label is used only on project pages, never on the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.pair, .dia.big')).toHaveCount(0);
    await page.goto('/projects/');
    expect(await page.locator('.pair .dia.big').count()).toBeGreaterThan(0);
    await page.goto('/projects/rbrain/');
    await expect(page.locator('.pair.top .dia.big')).toHaveCount(1);
  });
});
