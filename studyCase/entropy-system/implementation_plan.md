# Entropy System Foundation Implementation Plan

## Goal Description

Implement the **Entropy System** to introduce dynamic, deterministic chaos into the game world. This system tracks "World Conditions" (e.g., Political Climate, Weather), manages an "Entropy Pool" that fluctuates over time, and triggers narrative events or mutations.

## Design Decisions (User Confirmed)

- **Granularity**: The system operates on a **Turn-based** rhythm. explicit "Advance Turn" or "Time Skip" actions drive entropy.
- **Visibility**: Entropy State and Pool values are **DM ONLY** (and Debug).
- **Time Jumps**: Long Rests use a **Bulk Simulation** approach.

## Completed Changes

### Backend Dependencies

#### [NEW] [package.json](file:///Users/lg/lab/daicer/backend/package.json)

- Added `seedrandom` and `@types/seedrandom`

### Engine Core

#### [NEW] [entropy](file:///Users/lg/lab/daicer/backend/src/engine/entropy/index.ts)

- Implemented `EntropySystem` class with `seedrandom`.
- Implemented `advanceTurn`, `simulateTimePassage`, and `applyChange` logic.
- Ported POC data structures.

#### [MODIFY] [game-loop.ts](file:///Users/lg/lab/daicer/backend/src/engine/core/game-loop.ts)

- Updated `GameLoop` to hold `EntropySystem`.

### API & Persistence

#### [MODIFY] [room/schema.json](file:///Users/lg/lab/daicer/backend/src/api/room/content-types/room/schema.json)

- Added `entropyState` field.

#### [MODIFY] [time-frame/schema.json](file:///Users/lg/lab/daicer/backend/src/api/time-frame/content-types/time-frame/schema.json)

- Added `entropySnapshot` field.

#### [MODIFY] [turn-processing.ts](file:///Users/lg/lab/daicer/backend/src/api/game/services/turn-processing.ts)

- Injected Entropy logic into `processTurn`.
- Added persistence via `GameLedger` (`ENTROPY_CHANGE`) and `Room` updates.

## Quality Gate (Verified)

- **Determinism**: Verified via script. Identical seeds produce identical logs.
- **Persistence**: Verified rehydration of system preserves state capability.
- **Integration**: `EntropySystem` is wired into the main turn loop.
