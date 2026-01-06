import { test, expect } from '@playwright/test';
import { generateGodToken, MOCK_USERS } from './utils/god-mode';

test.describe('Flow 1: Creation & Spawn', () => {
  test.beforeEach(async ({ page }) => {
    // Inject God Token
    const token = generateGodToken(MOCK_USERS.ALICE);
    await page.addInitScript((t) => {
      window.localStorage.setItem('strapi_jwt', t);
    }, token);

    // Mock GenAI to avoid cost/latency
    await page.route('**/graphql', async (route) => {
      const req = route.request();
      const body = req.postDataJSON();
      if (body?.operationName?.startsWith('GenerateAvatar')) {
        await route.fulfill({
          json: {
            data: {
              [body.operationName]: {
                mimeType: 'image/png',
                data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGP6DwABBAEKKFE8ZwAAAABJRU5ErkJggg==',
              },
            },
          },
        });
      } else {
        await route.continue();
      }
    });
  });

  test('Alice can create a room, create a character, and spawn into the world', async ({ page }) => {
    // 1. Landing
    page.on('console', (msg) => console.log(`BROWSER: ${msg.text()}`));

    await page.goto('/');

    // Force Unregister Service Workers to prevent caching
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    });

    // Debug Auth
    const authState = await page.evaluate(() => localStorage.getItem('strapi_jwt'));
    console.log(`AUTH STATE LENGTH: ${authState?.length || 0}`);
    console.log(`CURRENT URL: ${page.url()}`);
    console.log(`BODY TEXT: ${await page.locator('body').innerText()}`);

    // Wait for button using Role (more robust)
    await expect(page.getByRole('button', { name: /create/i })).toBeVisible();

    // 2. Create Room via Wizard
    await page.getByTestId('lobby-create-room-btn').click();
    await page.waitForURL('**/create');

    // Fill minimum requirements
    await page.getByLabel('Theme').fill('E2E Test World');
    await page.getByTestId('wizard-next-button').click(); // Step 1 -> 2

    // Terrain Step
    await page.getByTestId('wizard-create-room-button').click();

    // 3. Room Loaded
    await page.waitForURL(/\/room\//);

    // 4. Character Creation (Auto-redirect or manual)
    const createCharBtn = page.getByTestId('lobby-create-char');
    if (await createCharBtn.isVisible()) {
      await createCharBtn.click();
    }
    await page.waitForURL(/\/wizard/);

    // Class (Fighter)
    await page.locator('button:has-text("Fighter")').click();
    await page.getByTestId('wizard-next-btn').click();

    // Race (Human - Assume Default)
    await page.getByTestId('wizard-next-btn').click();

    // Stats (Standard Array - Auto)
    await page.getByTestId('wizard-next-btn').click();

    // Alignment
    await page.getByTestId('wizard-next-btn').click();

    // Details (Auto-fill check)
    await expect(page.locator('input[type="text"]').first()).not.toBeEmpty();
    await page.getByTestId('wizard-next-btn').click();

    // Equipment
    await page.getByTestId('wizard-next-btn').click();

    // Visuals & Finish
    // Expect "Generate" to be mocked by route handler above
    const startBtn = page.getByTestId('wizard-complete-btn');
    await expect(startBtn).toBeEnabled({ timeout: 10000 });
    await startBtn.click();

    // 5. Back to Lobby -> Ready -> Start
    await page.waitForURL(/\/room\//);
    await page.getByTestId('lobby-ready-toggle').click();
    await page.getByTestId('lobby-start-game').click();

    // 6. Gameplay Verification
    await expect(page.locator('textarea:visible')).toBeEnabled({ timeout: 30000 });

    // Verify Canvas Presence (Token existence on grid)
    // We check purely via virtual DOM or reliable side-effect
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Optional: Check if "Alice" is in the player list using a reliable selector
    // await expect(page.getByText('Alice')).toBeVisible();
  });
});
