# Contributing to Daicer

## Testing

We employ a "Pyramid of Testing" strategy:

1.  **E2E (Playwright)**: Critical user flows (Creation, Combat, Multiplayer).
2.  **Unit/Integration (Vitest)**: Component logic and Engine rules.

### Running E2E Tests

E2E tests require the backend to be running (or capable of being started by Playwright).

1.  **Setup**:
    ```bash
    yarn install
    ```
2.  **Run All Tests (Headless)**:
    ```bash
    yarn workspace @daicer/frontend test:e2e
    ```
3.  **Debug Mode (Headed)**:
    ```bash
    yarn workspace @daicer/frontend test:e2e --headed
    ```

### Writing Tests

- **E2E**: Place specs in `frontend/e2e`. Use `global-setup` for DB snapshots.
- **Unit**: Place tests alongside source files (e.g., `Button.test.tsx`).

### God Mode (Auth)

Tests bypass Google Auth using "God Tokens". See `backend/src/utils/exporters/god-mode.ts`.
