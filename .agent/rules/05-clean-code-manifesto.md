# 🛑 05. Clean Code Manifesto (The Purge)

> [!IMPORTANT]
> **We write code for humans, not just compilers.**
> **No Abbreviations. No Ego. No Magic.**

## 1. Naming: The Anti-Abbreviation League

- **Rule**: Names MUST be meaningful and verbose if necessary.
- **Forbidden**: `ctx`, `usr`, `idx`, `val`, `cb`, `req`, `res`, `err`.
- **Mandate**: Use `context`, `user`, `index`, `value`, `callback`, `request`, `response`, `error`.
- **Why**: We have IDEs with autocomplete. Use them. Abbreviations make code unreadable.

## 2. The "No Cool Names" Policy

- **Rule**: Zero tolerance for "SOTA", "Intelligent", "BetterHandler", "V2", "Super", "Mega", "NextGen".
- **Action**: Refactor to descriptive, boring, reference standards.
- **Example**:
  - ❌ `SotaLogger` -> ✅ `StructuredLogger`
  - ❌ `SmartUserHandler` -> ✅ `UserRegistrationService`
  - ❌ `InventoryV2` -> ✅ `EquipmentManager`
- **Philosophy**: Clear, boring names are professional. "Cool" names are technical debt.

## 3. Functional Purity (A + B = C)

- **Rule**: Single Responsibility is absolute.
- **Pattern**: Functions should be deterministic. Input A + Input B must ALWAYS equal Output C.
- **Structure**:
  - Separate **Data** from **Behavior**.
  - Separate **Side Effects** (DB, API) from **Logic**.
  - **Goal**: Code that is easy to test and easy to maintain.

## 4. Strategic Abstraction

- **Rule**: Do not abstract for the sake of abstraction ("DRY" can be a trap).
- **Good Abstractions**:
  - **Adapters**: Normalizing external data.
  - **Serialization**: Transforming data formats.
  - **Translations**: Mapping domain concepts.
- **Bad Abstractions**: Hiding simple logic behind complex factories just to feel smart.

## 5. Code Smell Awareness

- **Rule**: Think about code smells while coding. If it feels wrong, it IS wrong.
- **Triggers**:
  - "I'll fix this later" -> Fix it NOW.
  - "This is a bit hacky" -> Delete it.
  - "Just a quick bypass" -> REJECTED.
- **Mindset**: Be hostile towards your own code. Refactor constantly.
