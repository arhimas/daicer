<div align="center">

# 🛠 Daicer Utils (`src/utils`)

**The Toolbox.**

> **Helpers, Wrappers, and Integrations.**

</div>

---

## 📦 Modules

### 1. `llm/` (The AI Interface)

The bridge between Daicer and Google Gemini.

- **`gemini.ts`**: Core client initialization.
- **`structured.ts`**: The "Zod-to-JSON" constraint pipeline.
- **`stream-manager.ts`**: Handles token streaming to the frontend.

### 2. `math/` (Vector Math)

Geometry helpers that pure `engine` checks might need validation for or API-specific transformations.

- _Note: Most heavy math should live in `@daicer/engine`._

### 3. `entity-geometry.ts` (The Spatial Authority)

The Single Source of Truth for mapping D&D Size Categories (Tiny...Gargantuan) to Pixel Dimensions.

- **Mandate**: `1 Foot = 32 Pixels` (The Golden Ratio).
- **Scope**: Used by Frontend (Canvas), Backend (PixelForge), and AI (Gemini Prompts).
- **API**:
  - `getPixelDimensions(size)`: Returns 32, 64, 96, 128...
  - `getCellFootprint(size)`: Returns 1, 2, 3, 4...

### 4. `upload.ts` (Media Handling)

Wrappers around Strapi's Upload Plugin to handle generated Map Images and Tokens.

---

## 🤖 The Prompt System (`prompt.ts`)

We do not hardcode prompt strings in the logic.
We use a **Template System** that pulls from `src/prompts` (or similar config).

- **Supports Internationalization**: (e.g., `en`, `pt-BR` variants).
- **Injection**: Uses `{{variable}}` syntax for dynamic context insertion.
