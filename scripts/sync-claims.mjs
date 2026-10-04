// Mirrors claim STATUSES (only) from the private claim register in Raymond's Brain into src/data/claims.json,
// for the claim IDs this site references. No claim text, sources, or attribution is copied.
// Run: npm run claims:sync   (override the register path with CLAIM_REGISTER=/path/to/CLAIM-REGISTER.md)
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const registerPath = process.env.CLAIM_REGISTER
  ?? join(root, '..', 'Raymonds-Brain', 'projects', 'raymond-sy-portfolio', 'content', 'CLAIM-REGISTER.md');

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const used = new Set();
for (const f of walk(join(root, 'src'))) {
  if (f.endsWith('claims.json')) continue;
  for (const m of readFileSync(f, 'utf8').matchAll(/CLM-\d{3}/g)) used.add(m[0]);
}

const status = {};
for (const line of readFileSync(registerPath, 'utf8').split('\n')) {
  if (!line.startsWith('| CLM-')) continue;
  const cells = line.split('|').map((c) => c.trim());
  status[cells[1]] = cells[7];
}
const missing = [...used].filter((id) => !(id in status));
if (missing.length) { console.error(`Not in the register: ${missing.join(', ')}`); process.exit(1); }
const out = Object.fromEntries([...used].sort().map((id) => [id, status[id]]));
writeFileSync(join(root, 'src', 'data', 'claims.json'), JSON.stringify(out, null, 2) + '\n');
const tally = Object.values(out).reduce((a, s) => ((a[s] = (a[s] ?? 0) + 1), a), {});
console.log(`claims.json: ${used.size} referenced`, tally);
