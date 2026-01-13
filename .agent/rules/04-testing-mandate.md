---
trigger: always_on
---

# 🛑 04. Testing Mandate

> [!IMPORTANT]
> **Speed, Isolation, and Mocking.**

## 1. Speed Limit

- **Backend Tests**: Must run in under **30 seconds**.
- **Action**: Delete or refactor slow tests.

## 2. Strict Mocking

- **External APIs**: **NEVER** call OpenAI, Strapi, or 3rd party APIs in tests.
- **Mocking Strategy**:
  - Mock the **Boundary**, not the **Logic**.
  - Use `vitest` or `jest` mocks explicitly.
  - **Do not mock types**: Use the real generated types from `yarn codegen`.

## 3. Hostile Testing

- **Happy Path is not enough**.
- Test **Access Denied** (403).
- Test **Invalid Input** (Zod validation failures).
- Test **Missing Data** (Null/Undefined handling).
