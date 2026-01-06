# 🛑 01. Coding Standards (The Law)

> [!IMPORTANT]
> **Strict enforcement of Hygiene and Naming.**

## 1. The 200-Line Limit
**Rule**: No file shall exceed 200 lines.
**Enforcement**: **STOP & REFACTOR**.
**Exceptions**: JSON, Markdown, Seeds, Generated Types.

## 2. No Scrub Types
**Rule**: `any` and `unknown` are **FORBIDDEN**.
**Enforcement**: Use proper Generics or Discriminated Unions. Casts are a last resort and must be justified.

## 3. Naming Conventions
**Rule**: **NO ABBREVIATIONS**.
**Whitelist**: `id`, `html`, `url`.
**Examples**:
- ❌ `minVal`, `charSheet`, `ctx`
- ✅ `minimumValue`, `characterSheet`, `context`

## 4. DRY & Atomic
- **DRY**: Redundancy is allowed only if it increases reliability and decoupling. Otherwise, extract.
- **Atomic**: Commits/Tooling steps can be batched, but changes must be focused.

## 5. Package Management
**Rule**: **Yarn Only**.
**Lockfile**: `yarn.lock` is sacred. Never mix with `npm`.
