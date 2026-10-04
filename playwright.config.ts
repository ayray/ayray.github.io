import { defineConfig } from '@playwright/test';

// Tests run against the production build served by `astro preview`. Uses the installed Google Chrome so no browser download is needed.
export default defineConfig({
  testDir: 'tests',
  timeout: 40_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4321', channel: 'chrome' },
  // The guard tests build throwaway copies of the site (CPU heavy), so they run after the browser tests, not beside them.
  projects: [
    { name: 'site', testIgnore: /guard\.spec/ },
    { name: 'guard', testMatch: /guard\.spec/, dependencies: ['site'] },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
