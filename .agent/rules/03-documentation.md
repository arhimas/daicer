---
trigger: always_on
---

# 🛑 03. Documentation Strategy

> [!IMPORTANT]
> **Colocation is King. Separation of Concerns is Law.**

## 1. The Structure: "One Module, One Manual"

Every functional directory (e.g., `/src/Combat`) **MUST** contain:

1.  **The Code**: (`index.ts`, `logic.ts`)
2.  **The Manual**: (`README.md`)

**NEVER** create a separate `docs/` folder. The documentation lives _with_ the code.

## 2. The README.md (The Knowledge Graph)

- **Purpose**: Explains Rules, Lore, and Architecture.
- **Linking**: This is the **ONLY** place allowed to use Obsidian-style WikiLinks (`[[Concept-Name]]`).
- **RAG**: The `yarn cli knowledge` command indexes these files.

## 3. JSDoc (The Code Navigator)

- **Purpose**: Explains Inputs, Outputs, and Code Flow.
- **Linking**: Use standard `{@link SymbolName}`. **NEVER** use `[[WikiLinks]]` in JSDoc.
- **Verbosity**: SOTA standard. Explain _why_, not just _what_.

**Example JSDoc:**

```typescript
/**
 * Calculates damage based on the Entropy modifier.
 *
 * 📖 **Rules**: See [Entropy Mechanics](./README.md#entropy)
 *
 * @param {number} base - The base damage.
 * @returns {number} The modified damage.
 * @see {@link EntropyService}
 */
```
