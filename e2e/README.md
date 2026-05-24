# E2E Tests — AI Learning Hub

End-to-end tests using [Playwright](https://playwright.dev/) with Chromium. Tests simulate real user flows through the browser against the running frontend and backend.

---

## Prerequisites

- Node.js v18+
- Backend running on `http://localhost:5000` (or `reuseExistingServer: false` in config)
- Frontend starts automatically via Playwright's `webServer`

---

## Quick Start

```bash
cd e2e
npm install
npx playwright install chromium    # first time only
```

### Run Tests

| Command | Description |
|---|---|
| `npm test` | Headless run (default) |
| `npm run test:headed` | Visible browser window |
| `npm run test:ui` | Playwright UI mode (interactive) |
| `npm run test:debug` | Debug mode with Playwright Inspector |
| `npm run codegen` | Open Playwright code generator against local frontend |
| `npm run report` | Open last test report |

### Run a Single File

```bash
npx playwright test tests/auth.spec.js
```

### Run with Different Backend URL

```bash
BACKEND_URL=http://localhost:5000 npx playwright test
```

---

## Test Structure

```
e2e/
├── fixtures/
│   └── helpers.js          # API helpers for test data setup
├── tests/
│   ├── auth.spec.js        # Registration, login, wrong password, logout
│   ├── formations.spec.js  # Browse homepage, formations page, detail, search
│   ├── rcf-flow.spec.js    # RCF login, dashboard, centre details
│   ├── formateur-flow.spec.js  # Formateur login, earnings, formations
│   └── student-flow.spec.js    # Student register, formations, dashboard, learning
├── playwright.config.js    # Playwright configuration
└── package.json
```

### What Each Test Covers

| File | Tests | Coverage |
|---|---|---|
| `auth.spec.js` | 4 | Register (3-step form), login success, wrong password, logout clears token |
| `formations.spec.js` | 4 | Page load, formation list renders, detail page navigation, search input |
| `rcf-flow.spec.js` | 3 | RCF dashboard access, centre details page |
| `formateur-flow.spec.js` | 4 | Formateur dashboard, earnings page, formations page |
| `student-flow.spec.js` | 4 | Register as apprenant, formations page, dashboard, learning page |

### Total: 19 tests (17 pass, 2 skipped* in dev)

\* `formateur lesson detail` and `RCF create formation` are skipped when centre creation fails (centres require admin approval in the backend).

---

## Fixtures & Helpers (`fixtures/helpers.js`)

All helpers use Playwright's built-in `request` context to set up data via the backend API directly (no UI interaction for data seeding).

| Function | Purpose |
|---|---|
| `uniqueEmail(prefix)` | Generates `prefix_timestamp_random@gmail.com` — avoids Joi's strict TLD validation |
| `registerUser(request, overrides)` | Creates a user via `POST /users/register-with-image`. Returns `{ token, user, email }`. Default role is `apprenant`. |
| `loginUser(request, email, password)` | Logs in via `POST /users/login`. Returns the JWT token. |
| `createCentre(request, token, overrides)` | Creates a training centre. Returns `null` if the request fails (admin approval may be needed). |
| `createFormation(request, token, centreId, overrides)` | Creates a formation in a centre. Returns `null` on failure. |

---

## Common Gotchas for Developers

### 1. Email Domain Must Be Valid

Backend Joi validation rejects unusual TLDs. Use `@gmail.com` only:

```js
// ❌ Will get 400 error
`test_${Date.now()}@e2e.test`

// ✅ Always use
`test_${Date.now()}@gmail.com`
```

Helpers already handle this — use `uniqueEmail()`.

### 2. Login Form Has No `name` Attributes

The login form renders native `<input>` elements **without** `name` attributes. Use `type` selectors instead:

```js
// Login form (no name attribute)
await page.locator('input[type="email"]').fill(email);
await page.locator('input[type="password"]').fill(password);

// Registration form (has name attributes)
await page.fill('input[name="email"]', email);
```

### 3. Registration Is a 3-Step Form

The register form has three steps:
1. **Account** — prenom, nom, email, telephone, password, confirmPassword — click `button.rf-btn-next` to continue
2. **Profile** — avatar upload (optional) — click `button.rf-btn-next` to skip
3. **Role** — click `.rf-role-card` to select a role, then submit with `button[type="submit"]`

### 4. Logout Button Has Two Instances

The "Sign Out" button appears both in the user dropdown and the mobile drawer. Always use `.first()`:

```js
await page.getByRole('button', { name: 'Sign Out' }).first().click();
```

### 5. Centre Creation May Fail

Creating a centre as a test RCF user may fail because centres require admin approval in the backend. Tests that depend on centres gracefully skip when this happens. To fix: manually approve the test centre in the admin panel, or modify the backend to auto-approve in test environments.

### 6. Tests Are Sequential

`fullyParallel: false` and `workers: 1` — tests in different files share server state (database). Using one worker avoids race conditions from parallel user registrations.

---

## How to Add a New Test

1. Create a new file in `tests/` (e.g., `payments.spec.js`)
2. Import helpers from `../fixtures/helpers.js`
3. Use Playwright's `request` fixture to seed data via API
4. Use `page` fixture to interact with the browser
5. Run it: `npx playwright test tests/payments.spec.js`

Example skeleton:

```js
import { test, expect } from '@playwright/test';
import { registerUser, uniqueEmail } from '../fixtures/helpers.js';

test.describe('Payment Flow', () => {
  test('user can view payment history', async ({ page, request }) => {
    const { token } = await registerUser(request);
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.goto('/apprenant/paiements');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });
});
```

---

## CI Integration

In CI environments (`process.env.CI` is truthy):
- `reuseExistingServer` is disabled — Playwright starts fresh backend and frontend
- `retries: 1` — one automatic retry on failure
- `forbidOnly: true` — fails if any `.only` is left in test files

Example GitHub Actions workflow:

```yaml
- name: Run E2E tests
  working-directory: e2e
  run: |
    npm ci
    npx playwright install chromium
    npx playwright test
```

---

## Reports

After a test run:
- HTML report: `e2e/playwright-report/index.html`
- Screenshots on failure: `e2e/test-results/`
- View report: `npm run report`
