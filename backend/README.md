<div align="center">

# 🎲 Daicer Backend (Monolithic V5)

**The Brain, The Heart, and The Soul.**

[![Backend CI](https://img.shields.io/github/actions/workflow/status/lguibr/daice/backend.yml?label=Backend_Build&logo=github&style=for-the-badge)](https://github.com/lguibr/daice/actions/workflows/backend.yml)
[![codecov](https://codecov.io/gh/lguibr/daice/graph/badge.svg?token=CODECOV_TOKEN&flag=backend)](https://codecov.io/gh/lguibr/daice)
[![Strapi](https://img.shields.io/badge/Back-Strapi_5-4945FF?logo=strapi&style=for-the-badge)](https://strapi.io/)
[![TypeScript](https://img.shields.io/badge/Code-100%25_TS-3178C6?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

> **"The Database IS the State."**

</div>

---

## 🏛 The Monolithic Architecture

As of **Phase 2 Complete (Jan 2026)**, the backend operates on the **V5 Monolithic Server** model.

### 1. The Schematic Truth

The Strapi Database is the **Single Source of Truth**. We have removed the `EntityAdapter` layer.

- **`EntitySheet`:** The primary gameplay object. What you see in the DB is what is in the game.
- **`TurnPipeline`:** A transactional orchestrator. All changes (Move, Attack, Event Log) happen in **One Atomic Transaction**.

👉 **[See Schema Architecture Map](docs/schema_architecture.md)**

### 2. The Game Loop ("The Sandwich")

1.  **Intent (GraphQL Mutation):** User calls `submitAction`.
2.  **Resolution (Pure Logic):** `ActionEngine` calculates the outcome (e.g., Hit/Miss, Pathfinding).
3.  **Persistence (Transactional):** The Database is updated, and Events are logged.
4.  **Narration (Async):** The LLM reads the event log and generates a story summary (`Turn.summary`).
5.  **Memory (RAG):** The summary is auto-embedded into `KnowledgeSnippets`.

👉 **[See Mutation Catalog](docs/mutation_catalog.md)**

### 3. Reliability & Visibility

- **Determinism:** World Generation is strictly seeded.
- **Fog of War:** Server-side `VisibilityService` prevents cheating.
- **Memory:** Automated RAG ingestion via Turn Lifecycles.

---

## 🛠 The CLI (Command Line Interface)

The Daicer CLI is a developer's best friend.

```bash
yarn cli <command>
```

| Command     | Usage                          | Description                                                                      |
| :---------- | :----------------------------- | :------------------------------------------------------------------------------- |
| `explore`   | `yarn cli explore`             | **Interactive Browser.** View Mobs, Items, and Spells with full JSON inspection. |
| `knowledge` | `yarn cli knowledge -q "Lich"` | **Vector Search.** Query the RAG database for lore and rules.                    |
| `status`    | `yarn cli status`              | **Health Check.** View active rooms, memory usage, and worker status.            |

---

## 🗺 Documentation Map

| Module                                                        | Description                                                    | Key Tech                         |
| :------------------------------------------------------------ | :------------------------------------------------------------- | :------------------------------- |
| **[🔌 API (`src/api`)](src/api/README.md)**                   | Strapi Content Types & Game Logic.                             | `game-ledger`, `turn-pipeline`   |
| **[⚙️ Engine (`src/engine`)](src/engine/README.md)**          | **Pure Logic Core.** Dependency-free Math, Rules, and Entropy. | `voxel-math`, `dnd-5e-srd`       |
| **[♻️ Lifecycle (`src/lifecycle`)](src/lifecycle/README.md)** | Server Bootstrapping & GQL Resolvers.                          | `graphql`                        |
| **[📚 Docs (`docs/`)](docs/)**                                | **System Documentation.**                                      | `mutation_catalog`, `schema_map` |

---

## 🧪 Developer Cheatsheet

### 🏃‍♂️ Running the Server

```bash
yarn develop
```

### ⚡️ Development / Testing

```bash
# Verify Logic Determinism (Zero-DB)
yarn vitest api/game/services/__tests__/logic-determinism.test.ts

# Integration Test (Transaction Verification)
yarn test
```

### 🧹 Clean Build

```bash
yarn build
```
