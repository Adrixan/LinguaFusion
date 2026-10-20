import { defineConfig } from '@playwright/test';

// Run `npm run build` first; the tests exercise the production bundle via `vite preview`.
// PW_CHROMIUM_PATH lets a machine with a preinstalled Chromium skip `playwright install`.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
      args: process.env.PW_CHROMIUM_PATH ? ['--no-sandbox'] : [],
    },
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
