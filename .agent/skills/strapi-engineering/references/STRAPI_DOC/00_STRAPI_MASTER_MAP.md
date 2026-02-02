# 🗺️ Strapi Master Knowledge Map

> **Usage Rule**: Start here. Use this map to navigate the entire Strapi ecosystem documentation, including official guides, internal package specs, RFCs, and design system components.

---

## 🚀 1. Core Documentation (The Guide)

_Best for: Learning concepts, day-to-day development, and API refs._

- **Getting Started**: [Quick Start](content/cms/getting-started/quick-start.md) | [Installation](content/cms/installation/cli.md)
- **Backend Customization**:
  - [Controllers](content/cms/backend-customization/controllers.md)
  - [Services](content/cms/backend-customization/services.md)
  - [Policies](content/cms/backend-customization/policies.md)
  - [Middlewares](content/cms/backend-customization/middlewares.md)
- **API Reference**:
  - [Document Service API](content/cms/api/document-service.md)
  - [Entity Service API](content/cms/api/entity-service.md)
  - [Query Engine API](content/cms/api/query-engine.md)
- **Plugins**: [Plugin Development](content/cms/plugins-development/introduction.md)

---

## 🏗️ 2. Architectural Decisions (RFCs)

_Best for: Understanding WHY things work the way they do._

- [Request For Comments (RFCs)](rfcs/README.md)
- _Look in `rfcs/rfcs/` for specific deep dives into features like Content History or Internationalization._

---

## 🎨 3. Design System & UI

_Best for: Building custom plugins and Admin UI extensions._

- **Design System Root**: [Documentation](design-system/content/index.mdx) (Note: Check `design-system/content` for component docs)
- **Components**: [UI Primitives](packages-all/ui-primitives/README.md)

---

## 📦 4. Package Internals (Deep Dive)

_Best for: Debugging, understanding internal logic, and advanced hacking._

### Core

- **Server**: [strapi](packages-all/strapi/README.md)
- **Admin**: [admin](packages-all/admin/README.md)
- **Database**: [database](packages-all/database/README.md)
- **Utils**: [utils](packages-all/utils/README.md)

### Plugins (Official)

- **Users & Permissions**: [plugin-users-permissions](packages-all/plugin-users-permissions/README.md)
- **GraphQL**: [plugin-graphql](packages-all/plugin-graphql/README.md)
- **Upload**: [upload](packages-all/upload/README.md)
- **I18N**: [i18n](packages-all/i18n/README.md)

---

## 🛠️ 5. Contributing & Standards

_From the Monorepo Root._

- [Contributing Guide](core-repo/CONTRIBUTING.md)
- [Security Policy](core-repo/SECURITY.md)

---

## 🧠 Navigation Tips

- **Search**: In Obsidian, press `Cmd/Ctrl + O` to search by filename.
- **Backlinks**: Enable backlinks to see how pages connect.
- **Images**: Images should render natively if they were relative links in the source.
