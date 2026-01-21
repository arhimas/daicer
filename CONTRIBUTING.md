# Contributing to Daicer

## 📚 Engineering Handbook

New to the project? Read these first:

1.  **[Strapi 5 Engineering Mastery](docs/strapi-engineering/)**: The definitive guide to our backend architecture.
    *   [Content Types](docs/strapi-engineering/01-content-types.md)
    *   [Admin Customization](docs/strapi-engineering/02-admin-customization.md)
    *   [Plugins & Extensions](docs/strapi-engineering/03-plugins-and-extensions.md)
    *   [Roles & Policies](docs/strapi-engineering/05-roles-and-policies.md)
2.  **[Agent Rules](.agent/rules/)**: The strict coding standards we follow.

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
