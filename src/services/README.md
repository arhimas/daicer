# Global Services

This directory contains utility services that provide cross-cutting capabilities for the Daicer application, including AI integration, knowledge management, and search.

## Core Services

### [`llm-service`](./llm-service.ts)
A centralized gateway for interacting with Large Language Models (specifically Google's Gemini). It abstracts the API client, manages API keys, and implements model fallback logic (e.g. attempting to use `gemini-3-flash-preview` before falling back to `gemini-1.5-flash`).

### [`embedding-service`](./embedding-service.ts)
Provides local vector embedding generation using the `Jina-Embeddings-v2` model via `@huggingface/transformers`.
- **Offline Capable**: Models are cached locally in `./local_models`.
- **Quantized**: Uses 8-bit quantization for performance.
- **Batched Initialization**: Handles concurrent startup requests.

### [`unified-search-service`](./unified-search-service.ts)
The central search entry point for the application. It acts as a facade, delegating actual semantic search operations to the `semantic-search` plugin while normalizing results into a standard `UnifiedSearchResult` format.

### [`entity-knowledge-service`](./entity-knowledge-service.ts)
Synchronizes Game Entities (Spells, Monsters, etc.) into the Knowledge Base (Vector DB).
- **Process**: Fetches entity -> Generates Markdown -> Embeds Text -> Updates DB.
- **RAG Ready**: Ensures all game content is searchable by the AI.

### [`code-ingestion-service`](./code-ingestion-service.ts)
Similar to `entity-knowledge-service` but for source code. It validates, truncates, and tags source files to make the codebase itself searchable for "Self-Aware" agentic features.

### [`image-generation-service`](./image-generation-service.ts)
Abstraction layer for image generation (currently stubbed/mocked).
