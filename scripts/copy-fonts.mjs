// Copies the Latin subsets of the two typefaces (both SIL Open Font License) from the Fontsource
// dev dependencies into public/fonts so they are self-hosted. Run: npm run fonts
import { copyFileSync, mkdirSync } from 'node:fs';

const out = new URL('../public/fonts/', import.meta.url);
mkdirSync(out, { recursive: true });
const nm = new URL('../node_modules/', import.meta.url);
const files = [
  ['@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2', 'schibsted-grotesk-latin-wght-normal.woff2'],
  ['@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-italic.woff2', 'schibsted-grotesk-latin-wght-italic.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2', 'ibm-plex-mono-latin-400.woff2'],
  ['@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'ibm-plex-mono-latin-500.woff2'],
  ['@fontsource-variable/schibsted-grotesk/LICENSE', 'LICENSE-schibsted-grotesk.txt'],
  ['@fontsource/ibm-plex-mono/LICENSE', 'LICENSE-ibm-plex-mono.txt'],
];
for (const [from, to] of files) copyFileSync(new URL(from, nm), new URL(to, out));
console.log(`copied ${files.length} font files to public/fonts`);
