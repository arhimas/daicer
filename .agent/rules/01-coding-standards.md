# 🛑 01. Coding Standards (The Law)

> [!IMPORTANT]
> **Strict enforcement of Hygiene, Naming, and Type Safety.**

## 1. The 200-Line Limit

**Rule**: No file shall exceed 200 lines.
**Enforcement**: **STOP & REFACTOR**. Split components, extract hooks, or move logic to services.
**Exceptions**: JSON, Markdown, Seeds, Generated Types.

## 2. THE ZERO ANY MANDATE

**Rule**: `any` and `unknown` are **STRICTLY FORBIDDEN**.
**Enforcement**:

- **NEVER** use `any`. Not for "quick fixes", not for "temporary" code.
- **NEVER** use `unknown` unless you are immediately narrowing it with a Zod schema or Type Guard.
- **Backend Data**: If you don't trust the shape, use `zod` to validate it.
- **Generics**: Use proper Generics or Discriminated Unions.
- **Casting**: `as` casting is highly discouraged. Use type predicates.

## 3. Strict Type Safety

**Rule**: All functions must have explicit return types.
**Rule**: All Props interfaces must be explicit.
**Rule**: No implicit `any`.

## 4. Naming Conventions

**Rule**: **NO ABBREVIATIONS**. Clarity over brevity.
**Whitelist**: `id`, `html`, `url`, `db`, `ui`.
**Examples**:

- ❌ `minVal`, `charSheet`, `ctx`, `params`
- ✅ `minimumValue`, `characterSheet`, `context`, `parameters`

## 5. DRY & Atomic

- **DRY**: Redundancy is allowed only if it increases reliability and decoupling. Otherwise, extract.
- **Atomic**: Commits/Tooling steps can be batched, but changes must be focused.

## 6. Package Management

**Rule**: **Yarn Only**.
**Lockfile**: `yarn.lock` is sacred. Never mix with `npm`.
