# 🛡️ Strapi 5 Engineering: Roles, Policies & Auth

> **The Trap**: Strapi has **TWO** completely separate authentication systems. Confusing them is the #1 cause of 403 errors.

## 1. The Dual Auth System

Strapi is two applications in one: The **Headless CMS** (API) and the **Admin Panel** (Dashboard). They do not share users.

| Feature        | System A: **Users & Permissions**       | System B: **Admin RBAC**                 |
| :------------- | :-------------------------------------- | :--------------------------------------- |
| **Audience**   | End Users (Gamers, Customers, Frontend) | Content Editors, Developers, Admin Staff |
| **Plugin**     | `plugin::users-permissions`             | `admin` (Core)                           |
| **Table**      | `up_users`                              | `admin_users`                            |
| **Token**      | JWT (Generated via `/api/auth/local`)   | JWT (Generated via `/admin/login`)       |
| **Management** | Settings > Users & Permissions Plugin   | Settings > Administration Panel > Roles  |

---

## 2. Configuring Routes (The "Type" Check)

When defining a route in a plugin or API, you **MUST** declare which system it belongs to.

### A. Admin Routes (`type: 'admin'`)

These are routes called by the **Admin Panel React App**.

```typescript
// src/plugins/my-plugin/server/routes/admin.ts
export default {
  type: 'admin', // <--- CRITICAL: Tells Strapi to use Admin Auth
  routes: [
    {
      method: 'GET',
      path: '/stats',
      handler: 'controller.getStats',
      config: {
        // The Policy that checks the Admin Token
        policies: ['admin::isAuthenticatedAdmin'],
      },
    },
  ],
};
```

### B. Content API Routes (`type: 'content-api'`)

These are routes called by your **Game Client / Website**.

```typescript
// src/plugins/my-plugin/server/routes/content.ts
export default {
  type: 'content-api', // <--- CRITICAL: Tells Strapi to use Users-Permissions
  routes: [
    {
      method: 'GET',
      path: '/my-game-data',
      handler: 'controller.getData',
      // No policy needed usually; managed via Admin UI (Settings > Users & Permissions)
    },
  ],
};
```

---

## 3. Policies Deep Dive

A policy is a function that returns `true` (pass) or `false` (403 Forbidden).

### Usage Syntax

`['global::policyName']` or `['plugin::plugin-name.policyName']`

### Common Built-in Policies

| Policy                                      | Target System  | Description                                                     |
| :------------------------------------------ | :------------- | :-------------------------------------------------------------- |
| `admin::isAuthenticatedAdmin`               | **Admin Only** | Checks if request has a valid Admin JWT.                        |
| `admin::hasPermissions`                     | **Admin Only** | Checks granular permissions (e.g., "Can Read Content Manager"). |
| `plugin::users-permissions.isAuthenticated` | **End User**   | Checks if request has a valid User JWT.                         |
| `plugin::users-permissions.ratelimit`       | **End User**   | Basic rate limiting for API.                                    |

### Creating a Custom Policy

**Location**: `src/api/[name]/policies/is-vip.ts`

```typescript
export default (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;

  // 1. Check if user exists (Authentication)
  if (!user) return false;

  // 2. Check logic (Authorization)
  if (user.role.name === 'VIP') {
    return true; // Pass
  }

  // 3. Return error (Custom 403 message)
  return policyContext.forbidden('You are not a VIP!');
};
```

## 4. Troubleshooting 403 Errors

If you get a 403, run this checklist:

1.  **Who is calling?**
    - Is it the Admin Panel? -> Check route has `type: 'admin'`.
    - Is it the Game Client? -> Check route has `type: 'content-api'`.
2.  **Is the Token correct?**
    - Do not try to use a Game User Token to access an Admin Route.
3.  **Is the Role Configured?**
    - **Admin**: Check Settings > Administration Panel > Roles > [Role] > Plugins.
    - **User**: Check Settings > Users & Permissions > Roles > [Public/Authenticated].

## 📚 Official Reference

- [Policies Documentation](https://docs.strapi.io/cms/backend-customization/policies)
- [Users & Permissions Plugin](https://docs.strapi.io/cms/plugins/users-permissions)
- [Admin Role Based Access Control (RBAC)](https://docs.strapi.io/cms/user-guide/settings/administration-panel/roles)
