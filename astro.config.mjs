import { defineConfig } from 'astro/config';

// Static output only (PORTFOLIO DEC-003): no backend, no SSR adapter.
export default defineConfig({
  site: 'https://ayray.github.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
