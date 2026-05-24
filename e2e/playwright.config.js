import { defineConfig } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:5000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],

  // Server management — start both frontend and backend
  webServer: [
    {
      command: `cd ../backend && npx nodemon app.js`,
      port: 5000,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: { NODE_ENV: 'development', PORT: '5000' },
    },
    {
      command: `cd ../frontend && npx vite --port 5173`,
      port: 5173,
      reuseExistingServer: false,
      timeout: 30000,
    },
  ],
});
