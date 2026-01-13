---
trigger: always_on
---

# 🛑 01. Coding Standards (The Law)

> [!IMPORTANT]
> **Zero Tolerance for Technical Debt.**

## 1. The Zero `any` Mandate

- **Rule**: `any` and `unknown` are **STRICTLY FORBIDDEN**.
- **Enforcement**:
  - Use **Zod** to validate external data boundaries.
  - Use **Discriminated Unions** for state management.
  - Use **Generics** properly.
  - **NO** `as` casting unless absolutely unavoidable (must be commented with justification).

## 2. The 200-Line Limit

- **Rule**: No file shall exceed 200 lines.
- **Action**: If you hit line 201, **STOP**. Refactor. Extract hooks, services, or utilities.
- **Exception**: Generated types, JSON, Seeds.

## 3. Naming & Hygiene

- **No Abbreviations**: `characterSheet` (✅), `charSheet` (❌). `context` (✅), `ctx` (❌).
- **Explicit Returns**: All functions **MUST** have an explicit return type.
- **No Magic Numbers**: Extract constants to a configuration file or fetch them from Strapi via CLI.

## 4. Type Definitions

- **No Repeated Types**: Do not redefine `User` in 5 places. Import from `@/types` or the generated GraphQL types.
- **Prefer `type` over `interface`**: Unless you specifically need declaration merging (you likely don't).
