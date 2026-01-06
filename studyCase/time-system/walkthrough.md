# 🕰️ Walkthrough: The Solid Base (Time Machine)

> **Status**: ✅ Implemented & Verified
> **Architecture**: SOTA Event-Sourced Ledger
> **Date**: Jan 2026

## 1. What was built?

We successfully implemented the "Time Machine" architecture, allowing granular debugging and reliable state reconstruction.

### Key Components

1.  **GameLedger (`backend/.../game-ledger.ts`)**:

    - The single source of truth for all state changes.
    - Enforces `sequenceId` ordering.
    - Handles `Live` broadcasting + `Persisted` logging.
    - Creates separate `TimeFrame` snapshots efficiently.

2.  **HistoryService (`backend/.../history-service.ts`)**:

    - The "Time Travel" engine.
    - Can take ANY timestamp, find the nearest snapshot, and replay events to reach the exact state.
    - Powered by the pure `GameLoop` and `DeterministicTurnProcessor`.

3.  **Frontend Debug Controls (`GameDebugView` + `TimeControls`)**:
    - Added a "Granular Replay" mode.
    - Users can input a timestamp and "Seek" to that exact moment.
    - The UI injects this ad-hoc state via `TimeFrameContext` without disrupting the live socket connection.

## 2. Verification Results

We ran a rigorous test suite (`time-machine.test.ts`) covering:

| Test Case                 | Result  | Meaning                                                                                     |
| :------------------------ | :------ | :------------------------------------------------------------------------------------------ |
| **Determinism**           | ✅ PASS | `GameLoop` output is identical for identical inputs. Math is solid.                         |
| **Ledger Integrity**      | ✅ PASS | Sequence IDs increment strictly (10 -> 11). No gaps.                                        |
| **Replay Reconstruction** | ✅ PASS | Starting from a Snapshot and replaying `MOVE` events produces the correct final Coordinate. |

## 3. How to Use

### In Development

1.  Open `/game/:roomId/debug`.
2.  Use the Bottom Bar "Time Controls".
3.  **Slider**: Scroll through Saved Snapshots (Turns).
4.  **Seek Input**: Enter a generic timestamp (ms) to calculate an _interpolated_ state between turns.
5.  **Go Live**: Return to real-time socket updates.

### In Code (Adding new Systems)

- **Do NOT** modify `EntitySheet` directly.
- **DO** call `GameLedger.logEvent(roomId, { type: 'MY_EVENT', payload: ... })`.
- The system handles the rest (Persist, Broadcast, Sequence).
