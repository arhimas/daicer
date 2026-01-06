import { test, expect } from '@playwright/test';
import { generateGodToken, MOCK_USERS } from './utils/god-mode';

test.describe('Flow 2: Multiplayer Synchronization', () => {
  test('Alice creates a room and Bob joins it', async ({ page: alicePage, browser }) => {
    // --- SETUP: Alice (Host) ---
    // Mock GenAI (Copied from Flow 1)
    await alicePage.route('**/graphql', async (route) => {
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

    alicePage.on('dialog', (d) => d.dismiss());
    alicePage.on('console', (msg) => console.log(`ALICE: ${msg.text()}`));
    alicePage.on('pageerror', (err) => console.log(`ALICE ERROR: ${err}`));

    const aliceToken = generateGodToken(MOCK_USERS.ALICE);
    const bobToken = generateGodToken(MOCK_USERS.BOB);

    // Auth for Alice (Safe CSS Injection)
    await alicePage.addInitScript((t) => {
      window.localStorage.setItem('strapi_jwt', t);

      window.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = 'canvas { display: none !important; }';
        if (document.head) document.head.appendChild(style);
        else document.documentElement.appendChild(style);
      });
    }, aliceToken);

    // Navigate Alice to Lobby
    await alicePage.goto('/');

    // Double-Tap Auth Check
    const isAuth = await alicePage.evaluate(() => !!localStorage.getItem('strapi_jwt'));
    if (!isAuth) {
      console.log('ALICE: Auth missing! Injecting and reloading...');
      await alicePage.evaluate((t) => window.localStorage.setItem('strapi_jwt', t), aliceToken);
      await alicePage.reload();
    }

    // Unregister SW (Alice)
    await alicePage.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    });

    // Verify Alice Auth
    console.log(`ALICE BODY PRE-NAV: ${await alicePage.locator('body').innerText()}`);

    // Navigate directly to Wizard (Bypass 3D Click Issues)
    console.log('ALICE: Navigating to /create manually...');
    await alicePage.goto('/create');

    // Fill Wizard
    console.log('ALICE: Filling Theme...');
    await alicePage.getByLabel('Theme').fill('Multiplayer World');

    console.log('ALICE: Clicking Next...');
    await alicePage.getByTestId('wizard-next-button').click({ force: true });

    console.log('ALICE: Waiting for Create Button...');
    const createBtn = alicePage.getByTestId('wizard-create-room-button');
    await expect(createBtn).toBeVisible({ timeout: 10000 });

    console.log('ALICE: Clicking Create Room Button...');
    await createBtn.click({ force: true });

    // Waiting for Room
    console.log('ALICE: Waiting for Room Load...');
    await alicePage.waitForURL(/\/room\//);
    const roomUrl = alicePage.url();
    console.log(`ALICE ROOM URL: ${roomUrl}`);

    // --- SETUP: Bob (Joiner) ---
    const bobContext = await browser.newContext();
    const bobPage = await bobContext.newPage();

    bobPage.on('console', (msg) => console.log(`BOB: ${msg.text()}`));

    // Auth for Bob (Safe CSS)
    await bobPage.addInitScript((t) => {
      window.localStorage.setItem('strapi_jwt', t);
      window.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = 'canvas { display: none !important; }';
        if (document.head) document.head.appendChild(style);
      });
    }, bobToken);

    // Navigate Bob
    await bobPage.goto(roomUrl);

    // Unregister SW (Bob)
    await bobPage.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    });

    // Validate Join
    await expect(bobPage).toHaveURL(roomUrl);

    // --- PRESENCE CHECK ---
    console.log('Checking Presence...');

    // Alice sees Bob
    await expect(alicePage.getByText('Bob', { exact: false })).toBeVisible({ timeout: 15000 });

    // Bob sees Alice
    await expect(bobPage.getByText('Alice', { exact: false })).toBeVisible({ timeout: 15000 });

    await bobContext.close();
  });
});
