<div align="center">

# 🎲 Daicer Backend

**The Brain, The Heart, and The Soul.**

[![Backend CI](https://img.shields.io/github/actions/workflow/status/lguibr/daice/backend.yml?label=Backend_Build&logo=github&style=for-the-badge)](https://github.com/lguibr/daice/actions/workflows/backend.yml)
[![codecov](https://codecov.io/gh/lguibr/daice/graph/badge.svg?token=CODECOV_TOKEN&flag=backend)](https://codecov.io/gh/lguibr/daice)
[![Strapi](https://img.shields.io/badge/Back-Strapi_5-4945FF?logo=strapi&style=for-the-badge)](https://strapi.io/)
[![TypeScript](https://img.shields.io/badge/Code-100%25_TS-3178C6?logo=typescript&style=for-the-badge)](https://www.typescriptlang.org/)

> **"A Deterministic State Machine serving a persistent, procedural simulation."**

</div>

---

## 🏛 The Technical Architecture

### 1. The Game Loop (`src/api/game`)

The core of the backend is the `GameLoop`. It is **Server-Authoritative**.

- **Logic:** `turn-processing.ts`
- **State:** `game-ledger.ts`

**The Cycle:**

1.  **Input:** User sends an Intent ("I want to move North").
2.  **Validation:** The `VoxelEngine` checks collision logic on the server.
3.  **Execution:** The state is mutated (Entity Position `x,y,z` changes).
4.  **Snapshot:** A Hash of the new state is created in the `Ledger`.
5.  **Broadcast:** The new state is pushed via `Socket.IO` to all clients.
6.  **Narration:** The `Narrator` (LLM) reads the _result_ (not the intent) and describes it.

### 2. The Engine Library (`src/engine`)

This is the **Pure Logic Core**.
Unlike `src/api`, this directory has **NO Strapi Dependencies**.
It contains the mathematical truth of the universe:

- `voxel/`: Coordinate systems and chunk math.
- `rules/`: D&D 5e Ruleset implementation (AC, DC, Saving Throws).
- `entropy/`: Chaos tracking logic.
  Because it is dependency-free, it can be tested in isolation (Unit Tests) at extreme speeds (~1ms).

### 3. The API Layer (`Postgres` + `GraphQL`)

We use a **Dual-Head** approach:

- **REST:** Used for internal Admin Panel & heavy write operations.
- **GraphQL:** Used by the **Frontend** for precise data fetching.
  - _Why?_ To prevent over-fetching massive JSON blobs when we only need `character.name` and `character.hp`.

---

## 🛠 The CLI (Command Line Interface)

The Daicer CLI is a developer's best friend. It bridges the gap between the Simulation and the Database.

```bash
yarn cli <command>
```

| Command     | Usage                          | Description                                                                      |
| :---------- | :----------------------------- | :------------------------------------------------------------------------------- |
| `explore`   | `yarn cli explore`             | **Interactive Browser.** View Mobs, Items, and Spells with full JSON inspection. |
| `knowledge` | `yarn cli knowledge -q "Lich"` | **Vector Search.** Query the RAG database for lore and rules.                    |
| `status`    | `yarn cli status`              | **Health Check.** View active rooms, memory usage, and worker status.            |

---

## 🔮 The Enrichment Engine (`scripts/enrichment`)

**"Hallucinating Structure from Chaos."**

The defining feature of Daicer. We take unstructured SRD Text and convert it into Game Logic.

### Example: Fireball

**Input (Raw Text):**

> _A bright streak flashes from your pointing finger to a point you choose..._

**Enrichment Process:**

1.  **Ingest:** Read raw text.
2.  **Schema Check:** Validate against `z.object({ damage: z.string(), radius: z.number() })`.
3.  **LLM Transformation:** Gemini extracts the logic.
4.  **Verification:** If Zod fails, we auto-correct and retry.

**Output (Game Logic):**

```json
{
  "type": "spell",
  "level": 3,
  "mechanic": {
    "type": "save",
    "attribute": "dexterity",
    "effect": "half_damage"
  },
  "damage": {
    "dice": "8d6",
    "type": "fire"
  },
  "targeting": {
    "shape": "sphere",
    "radius": 20,
    "range": 150
  }
}
```

---

## 🗺 Documentation Map

> **Click headers to dive deep.**

| Module                                                        | Description                                                    | Key Tech                         |
| :------------------------------------------------------------ | :------------------------------------------------------------- | :------------------------------- |
| **[🔌 API (`src/api`)](src/api/README.md)**                   | Strapi Content Types & Game Logic.                             | `game-ledger`, `turn-processing` |
| **[⚙️ Engine (`src/engine`)](src/engine/README.md)**          | **Pure Logic Core.** Dependency-free Math, Rules, and Entropy. | `voxel-math`, `dnd-5e-srd`       |
| **[♻️ Lifecycle (`src/lifecycle`)](src/lifecycle/README.md)** | Server Bootstrapping & Socket.IO Events.                       | `socket.io`, `bootstrap`         |
| **[🛠 Utils (`src/utils`)](src/utils/README.md)**             | Helpers, LLM Wrappers, and Error Handling.                     | `google-gemini`, `langchain`     |
| **[🔮 Scripts (`scripts/`)](scripts/README.md)**              | Automations, Migrations, and Enrichment.                       | `enrichment-engine`              |

---

## 🧪 Developer Cheatsheet

### 🏃‍♂️ Running the Server

```bash
yarn develop
```

### ⚡️ Processing a Turn (Manual)

You can force the engine to tick via cURL:

```bash
curl -X POST http://localhost:1337/api/narrator/action \
  -H "Content-Type: application/json" \
  -d '{
    "roomId": "abcd-1234",
    "input": "I cast Magic Missile at the darkness",
    "userId": "user-789"
  }'
```
