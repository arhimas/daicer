# @daicer/llm-core

**The Central Nervous System of Daicer's AI.**

> [!IMPORTANT]
> **Type Safety First**. This library enforces "Iron Gates" quality. No `any`. Strict Generics.
> Prompts are **Generated Code** derived from `prompts.json`.

## 🏗 Architecture

This library is **Framework Agnostic** but built for Strapi. It uses an **Adapter Pattern** to interact with the host system (Database, Logger).

### 1. The Prompt Registry (`src/prompt-registry`)
- **Source of Truth**: `prompts.json`
- **Generators**: `yarn generate:prompts` (runs `scripts/generate-prompts.ts`)
- **Output**: `src/prompt-registry/index.ts` (Zod Schemas + TypeScript Types)

**Workflow**:
1. Add a prompt to `prompts.json` with a `variables` schema.
2. Run generator.
3. Use `GeminiService.formatPrompt('your-key', { ...vars })`.
   - 🛑 Typescript Error if vars don't match.
   - 🛑 Runtime Error if vars don't parse via Zod.

### 2. Gemini Service (`src/services/gemini.ts`)
- **Engine**: LangChain + Google GenAI (`gemini-3-pro-preview`)
- **capabilities**:
  - `generatePixelData`: Multimodal Pixel Art generation (Text + Vision).
  - `generateBlueprint`: Structured Game Asset Blueprints.
  - `generateStructuredData`: Generic structured output for any Zod schema.

### 3. Context Builder (`src/context/builder.ts`)
- **Purpose**: Deep RAG (Retrieval Augmented Generation).
- **Logic**:
  - Fetches Entity Context (Deep or Shallow).
  - Inject Vision Context (Semantic Zones).
  - Merges "Draft" data (Frontend state) with "DB" data.

## 📦 Usage

```typescript
import { GeminiService, StrapiAdapter, LLMCoreConfig } from '@daicer/llm-core';

// 1. Configure Adapter (Strapi Injection)
const adapter: StrapiAdapter = {
  log: strapi.log,
  db: strapi.db,
  getModel: (uid) => strapi.getModel(uid),
  fetchContext: customFetcher // Optional
};

// 2. Initialize
const service = GeminiService({ 
    adapter, 
    config: { contentTypes: { prompt: 'api::prompt.prompt' } } 
});

// 3. Use (Type-Safe!)
const result = await service.generateStructuredData({
    promptKey: 'gameplay-combat', // Type-checked Key
    variables: { 
        combatantState: 'Injured', // Type-checked Props
        action: 'Attack' 
    },
    schema: MyZodSchema
});
```

## 🛠 Scripts

- `yarn generate:prompts`: Re-generates Zod schemas from `prompts.json`.
