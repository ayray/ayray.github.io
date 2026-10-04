import { test, expect } from '@playwright/test';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The claim guard is content-quality protection, not an approval mechanism. These tests build throwaway copies of the
// site with edited claim statuses and prove what each mode does. They never touch the real dist/.
test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

function copyOfSite() {
  const dir = mkdtempSync(join(tmpdir(), 'portfolio-guard-'));
  for (const p of ['src', 'public', 'astro.config.mjs', 'tsconfig.json', 'package.json']) cpSync(p, join(dir, p), { recursive: true });
  symlinkSync(join(process.cwd(), 'node_modules'), join(dir, 'node_modules'));
  return dir;
}
function build(dir: string, mode: 'review' | 'publish') {
  try {
    execFileSync('npx', ['astro', 'build'], { cwd: dir, env: { ...process.env, PORTFOLIO_MODE: mode }, stdio: 'pipe' });
    return { ok: true, out: '' };
  } catch (e: any) {
    return { ok: false, out: String(e.stdout) + String(e.stderr) };
  }
}
function setStatuses(dir: string, f: (id: string, current: string) => string) {
  const p = join(dir, 'src/data/claims.json');
  const cur = JSON.parse(readFileSync(p, 'utf8')) as Record<string, string>;
  writeFileSync(p, JSON.stringify(Object.fromEntries(Object.entries(cur).map(([k, v]) => [k, f(k, v)]))));
}

test('publish build succeeds when every referenced claim is Cleared (no contact, resume, or placeholder is required)', () => {
  const dir = copyOfSite();
  try {
    setStatuses(dir, () => 'Cleared');
    const r = build(dir, 'publish');
    expect(r.ok, r.out).toBe(true);
    const html = readFileSync(join(dir, 'dist/index.html'), 'utf8');
    expect(html).not.toContain('Review build');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('publish build is blocked by any claim in use that is not Cleared', () => {
  const dir = copyOfSite();
  try {
    let first = true;
    setStatuses(dir, (_id, _cur) => { if (first) { first = false; return 'Ready'; } return 'Cleared'; });
    const r = build(dir, 'publish');
    expect(r.ok).toBe(false);
    expect(r.out).toMatch(/publish build blocked, claims not Cleared/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Held, Prohibited, and Gap claims fail every build, review included', () => {
  for (const status of ['Held', 'Prohibited', 'Gap']) {
    const dir = copyOfSite();
    try {
      let first = true;
      setStatuses(dir, () => { if (first) { first = false; return status; } return 'Cleared'; });
      const r = build(dir, 'review');
      expect(r.ok, status).toBe(false);
      expect(r.out, status).toMatch(new RegExp(`is ${status} and must not be used`));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
});

test('the real claim table references no Held, Prohibited, or Gap claim', () => {
  const t = JSON.parse(readFileSync('src/data/claims.json', 'utf8')) as Record<string, string>;
  expect(Object.values(t).filter((s) => ['Held', 'Prohibited', 'Gap'].includes(s))).toEqual([]);
});
