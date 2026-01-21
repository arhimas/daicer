
# 🛑 06. Strapi Architecture (The Standard)

> [!CRITICAL]
> **Schema-First, Dual-Auth, and Injection.**
> Strapi 5 is opinionated. We follow its opinions.
> **Reference**: See [`docs/strapi-engineering/`](../../docs/strapi-engineering/) for deep dives.

## 1. Schema-First (No Code-First Models)

- **Rule**: You **CANNOT** define Content Types via TypeScript classes (Classes) or Decorators.
- **Enforcement**:
  - All models must be defined in `schema.json` files.
  - Use `npx @strapi/sdk-plugin` or scripts to generate them.
  - **See**: [`docs/strapi-engineering/01-content-types.md`](../../docs/strapi-engineering/01-content-types.md)

## 2. The Dual-Auth Trap (403 Prevention)

- **Rule**: Explicitly type your routes.
- **Enforcement**:
  - **Admin Routes**: Must be `type: 'admin'` and use `admin::isAuthenticatedAdmin`.
  - **Game Routes**: Must be `type: 'content-api'` and use `plugin::users-permissions`.
  - **See**: [`docs/strapi-engineering/05-roles-and-policies.md`](../../docs/strapi-engineering/05-roles-and-policies.md)

## 3. Surgical Admin Injection

- **Rule**: **NEVER** fork the Admin Panel.
- **Enforcement**:
  - Use **Injection Zones** to insert UI.
  - Use **Custom Fields** for specialized inputs.
  - Use `@strapi/design-system` for all Admin UI components.
  - **See**: [`docs/strapi-engineering/02-admin-customization.md`](../../docs/strapi-engineering/02-admin-customization.md)

## 4. The Extension Hierarchy

- **Level 1 (Config)**: Use `src/extensions` to add fields to existing plugins.
- **Level 2 (Logic)**: Use `register()` only when you need to completely hijack a service.
- **See**: [`docs/strapi-engineering/03-plugins-and-extensions.md`](../../docs/strapi-engineering/03-plugins-and-extensions.md)

