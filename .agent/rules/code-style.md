---
trigger: always_on
---

# 🛑 Coding Standards (The Law)

> [!IMPORTANT]
> **Technical Debt is Forbidden.**

## 1. The Absolute Zero `any`

- **Rule**: `any` and `unknown` are **FORBIDDEN**.
- **Exception**: `unknown` is permitted ONLY in Zod schema inputs or `catch(e)` blocks, but MUST be narrowed immediately.
- **Enforcement**: If you type `any`, you must delete the file and start over.

## 2. The 200-Line Limit

- **Rule**: Max file length is **200 lines**.
- **Action**: At line 201, you **STOP** and Refactor.
- **Exception**: Generated types, JSON, Seeds, and highly cohesive Zod schemas.

## 3. Strict Naming & Hygiene

- **No Abbreviations**: `ctx` (❌), `context` (✅). `char` (❌), `character` (✅).
- **Explicit Returns**: Functions **MUST** have explicit return types.
- **No Console Logs**: `console.log` is banned. Use `strapi.log` or a dedicated Logger service.

## 4. Documentation Coupling

- **Rule**: Every exported function MUST have JSDoc.
- **Linking**: JSDoc MUST link to the relevant Strapi documentation file in `STRAPI_DOC/` if it relies on a specific API.
  - Example: `@see file://STRAPI_DOC/content/cms/backend-customization/controllers.md`

## 5. Type Definitions

- **Single Source of Truth**: Do not manually define interfaces that exist in `@strapi/types`.
- **Prefer `type`**: Use `type` over `interface` unless declaration merging is required.
