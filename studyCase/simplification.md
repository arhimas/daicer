# Simplification Study: The 2-Workspace Architecture

## Context & Objective

The current project structure consists of four workspaces:

- `frontend/`: The React application.
- `backend/`: The Strapi/Node.js server.
- `engine/`: Core deterministic game logic and rules.
- `shared/`: Common types, Zod schemas, and constants.

**The Proposal**: Consolidate into strictly `frontend/` and `backend/`. The backend absorbs `engine` and `shared`. The frontend consumes logic and data primarily via GraphQL (leveraging `codegen` for types).

**The Goal**: Maximize development velocity and Developer Experience (DevEx) by reducing workspace complexity and relying on a single, strong typing pipeline (GraphQL).

---

## Architecture Comparison

### Current State (The Distributed Brain)

Logic is shared. The frontend "knows" the rules because it imports `@daicer/engine`.

- **Flow**: User acts -> Frontend calculates/predicts -> Sends Action to Backend -> Backend validates using same Engine -> Updates DB.
- **Type Source**: `@daicer/shared` and `@daicer/engine` exports.

### Proposed State (The Thin Client)

Logic is centralized. The frontend is a view layer.

- **Flow**: User acts -> Frontend sends Intent (Mutation) -> Backend executes Engine -> Updates DB -> Frontend refetches (Query).
- **Type Source**: GraphQL Codegen (derived from Backend Schema).

---

## Deep Analysis

### 1. Developer Experience (DevEx) & Velocity

| Feature                   | Current (4-Workspaces)                                                                                                          | Proposed (2-Workspaces)                                                            |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| **Dependency Management** | **High Friction**. Needs `yarn link` or strict hoisting. Version mismatch between `shared` and `backend` can cause silent bugs. | **Seamless**. Linear dependencies. Backend owns its logic. Frontend owns its view. |
| **Context Switching**     | **High**. Modifying a rule requires editing `engine`, rebuilding, then updating `backend` to use it.                            | **Low**. Modify the rule directly in `backend/src/engine`. Immediate feedback.     |
| **Onboarding**            | **Complex**. "Why is this rule here and not there?"                                                                             | **Simple**. "Backend has rules. Frontend shows results."                           |

**Verdict**: The 2-workspace model significantly reduces the "Tax" of maintaining internal libraries, which is huge for velocity in small teams.

### 2. Type Safety & The "Single Source of Truth"

- **Current**: Types are defined in `shared` (Zod/TS). Both Frontend and Backend import them.
  - _Risk_: If the API response format drifts (e.g., via a Strapi transform) from the shared type, the Frontend crashes at runtime.
- **Proposed**: Types are generated from the _actual_ GraphQL API (Codegen).
  - _Benefit_: **Perfect Parity**. The type `Monster` in the frontend is exactly what the backend promised to deliver. If the backend removes a field, the frontend build fails immediately.
  - _Constraint_: You lose access to internal types (`class DiceRoll`). You only get the data shape. This enforces a clean separation of concerns.

### 3. Game State & Optimistic Updates

- **Current**: Frontend can import `engine.calculateDamage()` to show the user "You will likely deal 5 damage" before sending the request.
- **Proposed**: Frontend cannot import the logic.
  - _Mitigation_: The backend can expose "Dry Run" queries (e.g., `query PreviewAttack { ... }`) or the frontend relies on simple approximations for UI feedback.
  - _Reality Check_: For a turn-based game, instantaneous client-side physics is rarely strict. Waiting 100ms for the server to say "You hit" is acceptable and prevents "desyncs" where the client thought it hit but the server says miss.

### 4. The WebSocket Problem

This is the main technical hurdle.

- **Issue**: Most socket libraries (Socket.io) are loosely typed. Currently, `shared` likely holds the Event Payloads.
- **Solution in 2-Workspace Model**:
  - **Pattern A (The Purist)**: Use Sockets _only_ for "Invalidation Signals" (e.g., `Event: { entityId: "123", type: "UPDATE" }`). The frontend then triggers a GraphQL refetch. This keeps 100% of data typing within GraphQL Codegen.
  - **Pattern B (The Pragmatic)**: Define Event Types in Backend. Generate a `socket-types.d.ts` artifact during `codegen` and commit it to frontend.
  - **Recommendation**: **Pattern A**. It aligns perfectly with the "Simplify" goal. It guarantees you never have "stale" socket data structures.

### 5. Testing

- **Current**: Unit tests in `engine` are pure.
- **Proposed**: You can still keep a `backend/src/engine` folder that is pure and unit-tested. You just stop publishing it as a package.
  - _Benefit_: One test runner (`vitest` in backend) covers persistence and logic.

---

## Potential Pitfalls (Cons)

1.  **"Fat" Backend**: The backend codebase grows. Proper folder structure (`src/api`, `src/engine`, `src/core`) becomes critical to avoid a mess.
2.  **No Offline Mode**: The game effectively becomes "Online Only". The client cannot function without the brain. (Likely acceptable for this project).
3.  **Latency Sensitivity**: Every interactive element that needs "Rules" needs a network call.

---

## Final Judgment: **STRONGLY RECOMMEND SIMPLIFICATION**

The proposed "Simplification" aligns perfectly with the robust **"Backend-for-Frontend" (BFF)** pattern. By treating the Frontend as a pure consumer of the Backend's schema:

1.  **You eliminate the "Dependency Hell"** of local npm packages.
2.  **You enforce the "Server Authoritative"** architecture (anti-cheat by default).
3.  **You gain "Free" Types** via GraphQL Codegen that are always in sync with your API.

### The Strategy for Migration

1.  **Move** `engine/src/*` to `backend/src/engine/`.
2.  **Move** `shared/src/*` to `backend/src/shared/`.
3.  **Refactor** Backend imports to use local paths.
4.  **Refactor** Frontend:
    - Replace usage of `@daicer/engine` types with **GraphQL Generated Types**.
    - For logic (e.g., `rollDice`), replace with a **Mutation** or **Query** to the backend.
5.  **Refactor** Sockets:
    - Shift to "Invalidation-based" updates (Socket says "Refetch", GraphQL fetches data).

**Verdict**: The gain in velocity (velocity = speed \* direction) outweighs the loss of client-side simulation capabilities for a turn-based game.

@[studyCase]
