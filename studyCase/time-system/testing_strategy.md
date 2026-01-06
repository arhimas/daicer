# 🧪 Testing Strategy: The Reliability Mandate

> **Goal**: To prove, mathematically and practically, that the Daicer Time System is deterministic and reliable.

## 1. The "Golden Standard" (Determinism)

We define reliability as: **Input(Seed, State, Event) → Always Output(SameState)**.

### 1.1 The Replay Test

- **Concept**: Record a user session (e.g., "Combat encounter with 3 goblins").
- **Artifact**: A JSON file `session_recording.json` containing initial state + list of events.
- **Test**:
  1.  Load Initial State.
  2.  Feed Events one by one into the `GameLoop`.
  3.  Assert `FinalState` equals the `FinalState` from the recording.
  4.  **Frequency**: Run on every CI/CD pipeline.

## 2. The "Chaos" Test (Robustness)

### 2.1 Fuzzing

- **Concept**: Throw garbage/random data at the Event Ledger.
- **Test**:
  1.  Emit `TIME_PASS` with negative numbers.
  2.  Emit `ATTACK` with missing actors.
  3.  Emit `ENTROPY` messages out of order.
  4.  **Expectation**: The system handles errors gracefully (rejects invalid events) without crashing or corrupting the `sequenceId` chain.

### 2.2 Concurrency / Race Conditions

- **Scenario**: Two players click "Attack" at the exact same millisecond.
- **Test**:
  1.  Fire 50 async `logEvent` calls simultaneously.
  2.  **Assert**: `sequenceIds` are strictly sequential (1, 2, 3...) with no gaps or duplicates.

## 3. The "Drift" Test (Long-Running Stability)

### 3.1 The Overnight Simulation

- **Concept**: Simulate 24 hours of in-game Travel/Rest.
- **Actions**: 1000s of `TIME_PASS` events, hundreds of `Entropy` checks.
- **Verification**:
  - Compare the `TimeFrame` snapshot at Hour 24 (Live) with a Replayed calculation from Hour 0.
  - **Pass Condition**: `JSON.stringify(Live) === JSON.stringify(Replay)`.

## 4. Specific Behavior Tests

### 4.1 Logic Verification

- **Turn Order**: Verify Strict Round Robin.
- **Durations**: Verify a "1 Minute" buff expires exactly after 10 rounds of "6 seconds".
- **Bio-Decay**: Verify Hunger increases linearly with Time.

### 4.2 Frontend Sync

- **Test**: Open two browser tabs.
- **Action**: Player A moves.
- **Assert**: Player B sees move interpolation immediately (via Socket) AND sees the correct finalized position (via Event confirmation).

---

_Strategy by Antigravity_
