# 🧩 Strapi 5 Engineering: Plugins & Extensions

> **Power User Guide**: Extend functionality without breaking the core.

## 1. Plugin Architecture (V2)
Strapi 5 plugins are self-contained modules.

```
src/plugins/my-plugin/
├── admin/            # [Frontend] React Code
│   └── src/
│       ├── index.tsx # Entry point (register/bootstrap)
├── server/           # [Backend] Node.js Code
│   └── src/
│       ├── content-types/
│       ├── controllers/
│       ├── services/
│       ├── routes/   # Defined with type: 'admin' or 'content-api'
│       └── index.ts  # Server entry point
└── package.json
```

## 2. Extensions vs. Hijacking
You often need to modify existing plugins (like `users-permissions` or `upload`).

### A. The "Extension" Folder (`src/extensions`)
**Best For**: Adding fields to Content Types or tweaking configuration.

**Example**: Adding `discordId` to User.
File: `src/extensions/users-permissions/content-types/user/schema.json`
```json
{
  "attributes": {
    "discordId": {
      "type": "string"
    }
  }
}
```

### B. The "Hijack" (Programmatic Admin Override)
**Best For**: Completely replacing backend logic (Controllers/Services).
**Location**: `src/index.ts` (Root of your project).

```typescript
export default {
  register({ strapi }) {
    // 1. Target the service
    const emailService = strapi.plugin('email').service('email');
    
    // 2. Wrap the original function
    const originalSend = emailService.send;

    // 3. Replace with your logic
    emailService.send = async (options) => {
      console.log(`[Hijack] Checking email to ${options.to}`);
      
      // Add custom logic...
      if (options.to.includes('@forbidden.com')) throw new Error('Blocked');

      // Call original
      return originalSend(options);
    };
  },
};
```

## 3. Routes & Policies
When building plugin routes, security is key.

### Admin Panel Routes
Routes used by your Admin Plugin frontend.
```typescript
// server/src/routes/admin.ts
export default {
  type: 'admin', // <--- CRITICAL
  routes: [
    {
      method: 'GET',
      path: '/stats',
      handler: 'myController.getStats',
      config: {
        policies: ['admin::isAuthenticatedAdmin'], // Standard Admin Auth
      },
    },
  ],
};
```

### Content API Routes
Routes used by the public / frontend app.
```typescript
// server/src/routes/content.ts
export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/public-data',
      handler: 'myController.getPublicData',
    },
  ],
};
```

## 📚 Official Reference
-   [Plugin Development Guide](https://docs.strapi.io/cms/plugins-development)
-   [Plugins Extension](https://docs.strapi.io/cms/plugins-development/plugins-extension)
-   [Server API (Routes/Controllers)](https://docs.strapi.io/cms/plugins-development/server-api)
