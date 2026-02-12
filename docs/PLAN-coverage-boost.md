# Plan: Boost Coverage to 80%

> **Goal**: Increase project code coverage from ~60% to 80% across all metrics by targeting high-impact files.

## 🧠 Brainstorm & Strategy Selection

We analyzed the `coverage-summary.json` to identify files with the most *uncovered lines*.

### Options Considered
*   **Option A (Low Hanging Fruit)**: Focus only on small utils. *Pros*: Fast. *Cons*: Doesn't tackle the main debt.
*   **Option B (Deep Core)**: Focus on complex engines (Combat, Movement). *Pros*: High stability. *Cons*: Slow, complex mocks.
*   **Option C (Top Offenders)**: Target the files contributing the most *volume* to the missing lines, regardless of difficulty.

### 💡 Selected Strategy: Option C (Top Offenders)
This gives the best ROI for the "80% Goal". We can gain massive percentage points by fixing just 5-6 large files that are currently at 0% or low coverage.

---

## 📅 Phased Execution Plan

### Phase 1: The "Zero-to-Hero" Campaign (High Impact)
*Targeting large files that currently have 0% coverage. Simple "happy path" tests here yield huge gains.*

- [ ] **Test `entity-lifecycle.ts`** (128 lines missing)
    - **Path**: `src/api/game/services/entity-lifecycle.ts`
    - **Strategy**: Mock `strapi.documents` and test lifecycle hooks (spawn, death, cleanup).
- [ ] **Test `structure-service.ts`** (102 lines missing)
    - **Path**: `src/api/voxel-engine/services/structure-service.ts`
    - **Strategy**: Test structure generation and validation logic.
- [ ] **Test `turn-service.ts`** (77 lines missing)
    - **Path**: `src/api/room/services/turn-service.ts`
    - **Strategy**: Test turn transition logic and state updates.
- [ ] **Test `game-event.ts`** (67 lines missing)
    - **Path**: `src/api/game-event/services/game-event.ts`
    - **Strategy**: Test event emission and subscription.

### Phase 2: The "Heavy Hitters" (Complex Logic)
*Targeting critical systems that are partially tested but have large gaps.*

- [ ] **Refine `tool-registry.ts`** (147 lines missing)
    - **Path**: `src/api/agent/services/tool-registry.ts`
    - **Strategy**: Add tests for tool registration, error handling, and execution flows.
- [ ] **Refine `turn-processing.ts`** (83 lines missing)
    - **Path**: `src/api/game/services/turn-processing.ts`
    - **Strategy**: Cover edge cases in turn resolution (timeouts, interrupts).
- [ ] **Refine `action-dispatcher.ts`** (58 lines missing)
    - **Path**: `src/api/game/src/engine/engine/action-dispatcher.ts`
    - **Strategy**: Test dispatching of complex/nested actions.

### Phase 3: UI & Plugins (React & Admin)
*Targeting the largest UI gaps.*

- [ ] **Test `PixelForge/index.tsx`** (126 lines missing)
    - **Path**: `src/plugins/map-explorer/admin/src/components/PixelForge/index.tsx`
    - **Strategy**: Use Review `test-utils` to modify component state and verify rendering.

## 📊 Verification Checklist

- [ ] Run `npm run cocov` after each file to confirm percentage gain.
- [ ] Ensure `Metric > 80%` for Lines, Statements, Functions, and Branches.
