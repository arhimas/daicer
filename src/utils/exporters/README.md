# Exporters & Test Utilities

Utilities for "breaking the glass" during testing and development. These tools often bypass standard security or flow restrictions for the sake of efficiency in non-production environments.

## Modules

### `god-mode.ts`

Authentication bypass token generator for E2E tests.

- **God Users**: Pre-defined users (Alice, Bob, DM) with fixed IDs.
- **JWT Generation**: Signs valid Strapi tokens using the test environment secret, allowing tests to inject authentication headers without performing a real OAuth login.
