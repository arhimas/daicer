# 🧰 Strapi 5 Engineering: SDKs & Tooling

> **Efficiency Rule**: Don't reinvent the wheel. Use the official kits.

## 1. Plugin SDK (`@strapi/sdk-plugin`)
This is the CLI toolkit for scaffolding and maintaining plugins.

### Installation
It usually comes with the Strapi project, or via `npx`.

### Key Commands
```bash
# scaffolding a new plugin
npx @strapi/sdk-plugin init src/plugins/my-new-plugin

# Verify plugin structure (linter for plugins)
npx @strapi/sdk-plugin verify

# Watch mode (crucial for local dev)
# This compiles your plugin's admin TS as you type
npx @strapi/sdk-plugin watch
```

## 2. Design System SDK (`@strapi/design-system`)
**MANDATORY for Admin UI**. Strapi 5's Admin Panel is built on this.
*   **Do Not**: Write raw CSS or use Tailwind classes directly in the Admin Panel unless absolutely necessary.
*   **Do**: Use the primitives.

### Usage
```typescript
import { 
  Box, 
  Flex, 
  Typography, 
  Button, 
  TextInput 
} from '@strapi/design-system';

const MyPage = () => (
  <Box padding={8} background="neutral100">
    <Flex direction="column" gap={4}>
      <Typography variant="alpha">Hello World</Typography>
      <TextInput label="Name" />
      <Button variant="default">Save</Button>
    </Flex>
  </Box>
);
```

### Reference
-   **Storybook**: [design-system.strapi.io](https://design-system.strapi.io)
-   **Icons**: [Strapi Icons Catalog](https://design-system.strapi.io/?path=/docs/icons--docs)

## 3. Client SDK (`@strapi/client`)
This is the official TypeScript/JavaScript client for **external** applications (scripts, frontends, microservices).

### Why use it?
It handles authentication, error parsing, and type inference better than raw `fetch`.

### Example
```typescript
import { Strapi } from '@strapi/client';

const strapi = new Strapi({
  baseURL: 'http://localhost:1337',
  auth: process.env.STRAPI_API_TOKEN,
});

// Fetching
const { data, meta } = await strapi.find('dragons', {
  filters: { breathType: 'Fire' },
  populate: ['hoard'],
  pagination: { page: 1, pageSize: 10 }
});

// Creating
await strapi.create('dragons', {
  name: 'Smaug',
  powerLevel: 9001
});
```

## 📚 Official Reference
-   [Strapi Plugin SDK GitHub](https://github.com/strapi/sdk-plugin)
-   [Strapi Client GitHub](https://github.com/strapi/client)
