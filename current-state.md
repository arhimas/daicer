# Daicer Project: Current State (Deep Analysis)

> **Generated**: Jan 2026
> **System**: MacOS / Strapi 5 / Postgres / Node.js
> **Architecture**: "Sandwich Pipeline" / POPV / Headless GraphQL

---

## 1. Executive Summary

Daicer is a **State-of-the-Art (SOTA) Headless VTT (Virtual Tabletop) Engine**. Unlike traditional VTTs (Foundry, Roll20), Daicer is "Database-First". The world state is not held in memory but is strictly persisted to PostgreSQL after every transactional turn.

It operates on a **Zero-Socket** architecture for the client, relying on "Passive Polling" to update the UI. This ensures that the Server is the single source of truth and prevents "Ghost States" common in WebSocket-heavy apps.

**Core Philosophy:**
1.  **Schema is the Map**: The database structure *is* the game rules.
2.  **Atomic Turns**: A turn is a single database transaction. All or nothing.
3.  **Hydration**: Static JSON ("Fireball Spell") is hydrated into Executable Code (`RuntimeAction`) at runtime.
4.  **1ft Precision**: The world is a voxel grid where 1 cell = 1 foot.

---

## 2. Architecture & Flow Specifications

### 2.1 The Sandwich Pipeline (Turn Orchestration)

The "Sandwich" architecture ensures strict determinism by wrapping the "Meat" (Logic) in "Bread" (Safety & Persistence).

**Stage 0: The Guardian (Locking)**
- **Goal**: Prevent Race Conditions.
- **Mechanism**: `LockService.acquire(roomId)`. If locked, returns `429 Too Many Requests`.
- **TTL**: 5 seconds. If the server crashes, the lock expires automatically.

**Stage 1: Intent (Ears)**
- **Input**: GraphQL Mutation `processRoomTurn(commands: EngineCommand[])`.
- **Parsing**: Converts generic JSON commands (`{ type: "MOVE", x: 10 }`) into strict Zod-validated objects.

**Stage 2: Resolution (Heart)**
- **Engine**: `ActionEngine.dispatch()`.
- **Mode**: **Dry Run**. The engine calculates *what should happen* but **DOES NOT** write to the DB.
- **Output**: `stateDiff` (List of SQL updates) and `GameEvent[]` (Log of what happened).

**Stage 3: Persistence (The Atomic Commit)**
- **Mechanism**: `strapi.db.transaction()`.
- **Action**: Applies the `stateDiff` and inserts `GameEvent` rows in a SINGLE transaction.
- **Safety**: If *any* SQL query fails, the entire turn rolls back. Zero corruption.

**Stage 4: Timeline (Snapshot)**
- **Mechanism**: `SnapshotService`.
- **Action**: Serializes the current `EntitySheet` state (HP, Pos) into a `TimeFrame` record.
- **Purpose**: "Time Travel" debugging and Replay functionality.

**Stage 5: Narration (Voice)**
- **AI**: The `NarrativeEngine` reads the `GameEvent` log and generates flavor text.
- **Delay**: This happens *after* the turn logic, so the narration describes the *actual* outcome (e.g., "The goblin *died* screaming" vs "The goblin was hit").

### 2.2 POPV (Pipeline of Purity & Validation)

All external data follows the **POPV** flow:
1.  **P**arse: Raw JSON -> Zod Schema.
2.  **O**rganize: Structuring data into Domain Entities.
3.  **P**rocess: Pure Function execution (Logic).
4.  **V**alidate: Final output integrity check before DB commit.

---

## 3. Database Registry (Postgres Schema)

> **Note**: This registry maps the high-level Strapi Content Types to their relational SQL reality.

### 3.1 Core Entities (`api::entity.entity`)
The "Blueprint" or "DNA" of an object.
- **`type`** (`enum`): `monster` | `player` | `npc` | `flora`.
- **`name`** (`string`): The generic name (e.g., "Goblin").
- **`description`** (`richtext`): Lore and flavor.
- **`compilation_state`** (`component`):
    - `status`: `Pending` | `Valid` | `Invalid`.
    - `hash`: Checksum of the entity data for change detection.
- **`tags`** (`relation: m:n`): Links to `api::tag.tag`.
- **`features`** (`dynamic zone`): The mechanical abilities (Spellcasting, Multiattack).

### 3.2 Runtime Sheets (`api::entity-sheet.entity-sheet`)
The "Instance" of an entity in the world.
- **`name`** (`string`): The specific name (e.g., "Snarg the Goblin").
- **`entity`** (`relation: m:1`): Link to the Blueprint.
- **`room`** (`relation: m:1`): The Grid/Map it currently occupies.
- **`user`** (`relation: m:1`): The player controlling it (if any).
- **`position`** (`json`): `{ x: number, y: number, z: number, r: enum }`.
- **`stats`** (`component`): HP, AC, Initiative, Speed.
- **`inventory`** (`relation`): Links to `Item` instances.

### 3.3 The World Grid (`api::room.room`)
A 3D Voxel Container.
- **`name`** (`string`): Room ID.
- **`world`** (`relation: 1:1`): Parent World container.
- **`dmSettings`** (`relation: 1:1`): Configuration (Fog of War, Lighting).
- **`activeTurn`** (`relation: 1:1`): Pointer to the current processing turn.
- **`timeFrames`** (`relation: 1:n`): History of all states in this room.

### 3.4 The Event Log (`api::game-event.game-event`)
An immutable record of history.
- **`type`** (`enum`): `DAMAGE`, `HEAL`, `MOVE`, `NARRATIVE`.
- **`turn`** (`relation: m:1`): The turn that generated this event.
- **`source`** (`relation: m:1`): Who caused it (EntitySheet).
- **`targets`** (`relation: m:n`): Who was affected.
- **`payload`** (`json`): Specific data (e.g., `{ amount: 12, damageType: "fire" }`).

### 3.5 Voxel Edits (`api::voxel-change.voxel-change`)
Sparse storage for map modifications (The "Delta" Layer).
- **`position`** (`json`): `{ x, y, z }`.
- **`room`** (`relation: m:1`): The room affected.
- **`oldValue`** (`json`): What was there before ("Grass").
- **`newValue`** (`json`): What is there now ("Lava").
- **`changeType`** (`enum`): `UserEdit` | `Script` | `Explosion`.

---

## 4. Engineering Standards & Tech Stack

### 4.1 "The Law" (Coding Standards)
1.  **Zero `any`**: The `any` type is strictly forbidden. Zod must be used at all IO boundaries.
2.  **200 Line Limit**: Files > 200 lines are considered "Technical Debt" and must be refactored.
3.  **No Magic Numbers**: All constants must be extracted to config or database.
4.  **Colocation**: Documentation (`README.md`) lives *next to* the code (`src/feature/README.md`), not in a generic `docs/` folder.

### 4.2 Technology Stack
- **Runtime**: Node.js (via Docker).
- **Framework**: Strapi 5.32.0 (Headless CMS).
- **Database**: PostgreSQL 16 (strict).
- **Vector DB**: `pgvector` (via Postgres extension) or `sqlite-vec` (fallback).
- **Queue**: Redis + BullMQ (SOTA Async Processing).
- **Testing**: Vitest (Unit) + Supertest (Integration).
- **AI**: Google Gemini (Remote) + Gemma 3 (Local via Python Bridge).
- **Language**: TypeScript 5.9 (Strict Mode).

---

## 5. Plugin Details

### 5.1 `map-explorer`
**Role**: Voxel Editor & Visualizer.
- **Frontend**: A specialized React app embedded in the Strapi Admin Panel.
- **Capabilities**:
    - "Paint" terrain onto the voxel grid.
    - Visualize Entity positions.
    - "God Mode" vs "Player Mode" (Fog of War).
- **Data**: Reads directly from `api::room.room` and writes to `api::voxel-change.voxel-change`.

### 5.2 `queue-dashboard`
**Role**: Background Job Monitor.
- **Integration**: Wraps `@bull-board/ui` into a Strapi Plugin.
- **Security**: Protected by Strapi RBAC (Admin Only).
- **Queues Monitored**:
    - `generate-text-remote`: Gemini API calls.
    - `generate-text-local`: Local Gemma 3 Inference.
    - `compile`: Entity Validation jobs.
    - `genesis`: Massive Seeding jobs.

### 5.3 `semantic-search`
**Role**: RAG (Retrieval Augmented Generation) Engine.
- **Components**:
    - `KnowledgeSource`: PDF/MD files ingested into the system.
    - `KnowledgeSnippet`: Chunked text with Vector Embeddings.
- **Function**: Allows the AI Narrator to query "What does the Ring of Fire do?" and get a grounded answer from the ruleset.

---

## 6. Weakness & Risk Analysis (Rated)

| Area | Score (0-1000) | Critical Analysis |
| :--- | :--- | :--- |
| **Architecture** | **950** | **Strength**: The "Atomic Commit" makes the state virtually incorruptible. <br> **Weakness**: Heavy reliance on "Polling" creates lag (200-500ms) for players. |
| **Code Quality** | **880** | **Strength**: "Zero Any" policy enforces safety. <br> **Weakness**: High abstraction (Factories, Hydrators) makes onboarding difficult for juniors. |
| **Scalability** | **700** | **Strength**: Postgres can handle millions of entities. <br> **Weakness**: The Voxel System (32x32px per cell) stores huge JSON blobs. Large maps (>100x100) may cause DB bloat. |
| **Testing** | **750** | **Strength**: core engine is well tested. <br> **Weakness**: "Fun" is not tested. No simulation of combat balance. |
| **UX (Admin)** | **600** | **Strength**: Powerful tools. <br> **Weakness**: The Strapi Content Manager is generic. Managing complex nested JSON (like Inventory) via standard UI is painful. |

### Critical Recommendations
1.  **Implement Optimistic UI**: The frontend currently waits for the "Passive Poll". It should predict the result to feel "Snappy".
2.  **Simulation Suite**: Write a test that runs 10,000 battles between Goblins and Fighters to tune the math.
3.  **Voxel Compression**: Store Voxel data as Binary (Buffer) or RLE (Run Length Encoded) strings instead of raw JSON arrays to save 90% DB space.
