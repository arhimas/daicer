# 🏯 The Solid Base: SOTA Time, Persistence & State Architecture

> **Mandate**: "The Best, Not The Easiest."
> **Core Objective**: Absolute Determinism, Infinite Replayability, Granular Debugging.
> **Status**: Foundation for Time, Travel, Entropy, and Combat.

This document defines the **Ultimate Event-Sourced Architecture** for the Daicer Engine. It rejects "Snapshots as Truth" in favor of strict, immutable history replayed through a deterministic engine.

---

## 1. The Philosophy: "The Ledger of Reality"

In this SOTA architecture, the database state (`EntitySheets` rows) is **Ephemeral**. It is merely a cached projection of the only thing that matters: **The Event Log**.

### The Golden Rules

1.  **Immutability**: Once an Event is written, it is essentially etched in stone.
2.  **Determinism**: `State(T) = Function(InitialState, Events[0...T])`.
    - This function must yield the _exact same JSON_ today, tomorrow, and in 10 years, regardless of server restarts.
3.  **No Side Effects**: The engine logic _cannot_ make network calls, read random numbers (without a Seed), or check "current time" (use Event Timestamp).

---

## 2. The Persistence Architecture (`TimeCrystals`)

We replace the loose "Room -> Turn -> Event" correlation with a strict **Blockchain-like Ledger**.

### 2.1 The Unified Event Log (`api::game-event`)

This is the single source of truth. Every simulation tick, player action, or AI thought is an Event.

| Attribute         | Logic               | Why "The Best"?                                                                                                |
| :---------------- | :------------------ | :------------------------------------------------------------------------------------------------------------- |
| **`sequenceId`**  | **BigInt (Global)** | Ensures absolute, atomic ordering across the entire distributed system. No race conditions.                    |
| **`causalityId`** | **Relation**        | Which Event caused this? (e.g., A `TIME_PASS` caused an `ENTROPY_CHECK` caused a `SPAWN`). Traceability graph. |
| **`seed`**        | **Integer**         | The specific RNG seed used for this event. **Crucial for Replayability**.                                      |
| **`actor`**       | **Polymorphic**     | Player, System, or another Entity.                                                                             |
| **`delta`**       | **JSON Patch**      | The _exact_ changes applied to the state (e.g., `hp: -5`). Used for O(1) "Undo".                               |
| **`snapshot`**    | **JSON (Sparse)**   | Occasional full-state verification hash to detect "Drift".                                                     |

### 2.2 The Time Machine (Granularity: Infinite)

We do not just "step back by Turn". We step back by **Operation**.

- **Seek(TargetTime)**:

  1.  Find nearest `TimeFrame` (Cache) _before_ target.
  2.  Hydrate Engine with Cache.
  3.  Replay `Events` one by one, applying `deltas`.
  4.  Stop exactly at `TargetTime`.

- **Forking Paths (Multiverse Debugging)**:
  - Found a bug in Turn 50?
  - Replay to Turn 49.
  - Code Fix: Patch the `Engine` logic.
  - **New Branch**: Replay Turn 50 with _new code_ but _same inputs_.
  - Compare `State(Old)` vs `State(New)` to verify fix.

---

## 3. The Systems Integration

### 🕰️ The Time System (The Conductor)

Time is no longer a "Passive Property". It is the **Driver**.

- **The Tick Loop**:
  ```typescript
  while (Game.active) {
    // 1. Process Pending Inputs (Events)
    // 2. Advance Simulation (Logic)
    // 3. Emit Resulting Events (Output)
    // 4. Update Global Time
  }
  ```
- **Granularity Scaling**:
  - **Combat**: Tick = 1 Frame (Sequential Actions).
  - **Exploration**: Tick = 1 Minute.
  - **Travel**: Tick = 1 Hour (Batch Processing).

### 🎲 Entropy (The Chaos Engine)

Entropy is strictly deterministic.

- **Input**: `TimePassed`, `DistanceTraveled`, `WorldDanger`.
- **Logic**: `PRNG(Seed + SequenceId)`.
- **Result**: If `PRNG < Threshold`, emit `Event: ENTROPY_TRIGGER`.
- **Why Best?**: A "Random" encounter will happen _exactly the same way_ if you reload the save. No "Save Scumming" unless explicitly allowed.

### 🗺️ Travel (The Montage)

Travel is a **Calculated Projection**.

1.  **Input**: "Travel to Castle (4 hours)".
2.  **Simulation**: The Engine runs a "Fast-Forward" loop locally.
    - `Hour 1`: Checks Weather. (Event: Rain)
    - `Hour 2`: Checks Encounter. (Safe)
    - `Hour 3`: Checks Bio-Metrics. (Hunger +1)
    - `Hour 4`: Arrival.
3.  **Commit**: The Engine commits the _entire chain_ of resulting events atomically.

---

## 4. Implementation Strategy (The Hard Road)

We choose the hard path because it yields the best results.

### Phase 1: The `Ledger` (Backend)

- **Goal**: Create the `GameLedger` service.
- **Task**: Intercept ALL changes to `EntitySheets`. Redirect them to `Ledger.propose(Event)`.
- **Strictness**: Revoke direct DB write access for `GameService`. Only `Ledger` can write.

### Phase 2: The `DeterministicEngine` (Logic)

- **Goal**: A pure TypeScript class that takes `State + Event` and returns `NewState`.
- **Refactor**: Move logic out of Strapi Controllers (`game.ts`) and into `@daicer/engine` (Pure).
- **Isolation**: Ensure NO dependency on Strapi global `strapi` object inside the Engine.

### Phase 3: The `TimeController` (Debug UI)

- **Goal**: A scrubbing timeline in the Frontend.
- **Features**: Play, Pause, Step Forward, Step Back, "Jump to Message".
- **Visuals**: See the Map "rewind" effectively.

### Phase 4: Systems Rollout

- Once the Ledger is rock solid, we simply "plug in" Entropy, Combat, and Travel as **Logic Modules** that listen to and emit Events.

---

_Architected by Antigravity under the "SOTA & Robustness" Mandate._
