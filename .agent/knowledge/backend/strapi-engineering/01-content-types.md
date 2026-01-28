# 📄 Strapi 5 Engineering: Content Types & Schemas

> **Core Philosophy**: "Schema is Source of Truth".
> In Strapi 5, the database structure is derived strictly from JSON schema files. You do not define models with TypeScript classes or decorators.

## 1. The Schema Definition
Each Content Type lives in `src/api/[api-name]/content-types/[type-name]/schema.json`.

### Anatomy of a Schema
```json
{
  "kind": "collectionType", // or "singleType"
  "collectionName": "dragons",
  "info": {
    "singularName": "dragon",
    "pluralName": "dragons",
    "displayName": "Dragon",
    "description": "High-level entity representation"
  },
  "options": {
    "draftAndPublish": true,
    "populateCreatorFields": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true,
      "minLength": 3
    },
    // ... relations and other fields
  }
}
```

## 2. Programmatic Creation ("Code-as-Schema")
Since Strapi prevents "Code-First" definition (like TypeORM), "Programmatic Creation" implies **Generating Schema Files via Scripts**.

### The "SOTA" Generator Pattern
Instead of manually editing JSON, create a script intended to run during your build/setup phase.

```typescript
// scripts/generators/create-content-type.ts
import fs from 'fs-extra';
import path from 'path';

const defineSchema = (name: string, attributes: any) => ({
  kind: 'collectionType',
  collectionName: name.toLowerCase() + 's',
  info: {
    singularName: name.toLowerCase(),
    pluralName: name.toLowerCase() + 's',
    displayName: name,
  },
  options: { draftAndPublish: true },
  attributes,
});

const dragonSchema = defineSchema('Dragon', {
  name: { type: 'string', required: true },
  powerLevel: { type: 'integer', default: 9000 }
});

const targetPath = path.join(__dirname, '../../src/api/dragon/content-types/dragon/schema.json');
fs.outputJsonSync(targetPath, dragonSchema, { spaces: 2 });
```

## 3. Relations & Logic
Relations are defined in `attributes`.

-   **OneToOne**: `"relation": "oneToOne", "target": "api::target.target"`
-   **OneToMany**: `"relation": "oneToMany", "target": "api::target.target"`
-   **ManyToOne**: `"relation": "manyToOne", "target": "api::target.target"`

### Lifecycle Hooks (`lifecycles.ts`)
Alongside `schema.json`, use `lifecycles.ts` to enforce business logic.

```typescript
// src/api/dragon/content-types/dragon/lifecycles.ts
export default {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.powerLevel > 9000) {
      throw new Error("It's over 9000!");
    }
  },
  afterCreate(event) {
    const { result } = event;
    // Trigger external notification
  }
};
```

## 📚 Official Reference
-   [Strapi 5 Models Documentation](https://docs.strapi.io/cms/backend-customization/models)
-   [Document Service API](https://docs.strapi.io/cms/api/document-service)
