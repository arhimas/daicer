<div align="center">

# 🔌 Daicer API (`src/api`)

**The Business Logic.**

> **Strapi Content Types & Services.**

</div>

---

## 🏛 Structure

Each folder here represents a Strapi **Content-Type** (Database Table) or a specific **API Plugin**.

### 1. `game/` (The Orchestrator)

The core logic resides here.

- **`turn-processing`**: The collision and movement validation.
- **`game-ledger`**: The event sourcing history.

### 2. `voxel-engine/` (The World Builder)

Handles Map Generation requests.

- _Note: This wraps the pure `@daicer/engine` library._

### 3. `narrator/` (The AI Agent)

The HTTP endpoints for the LLM.

- `POST /narrator/action`: The main entry point for user intent.

### 4. `game-event/` (The History)

The immutable log of all actions.

- **`payload`**: JSONB field storing the exact action data.
- **`sequenceId`**: Monotonically increasing ID for playback.
