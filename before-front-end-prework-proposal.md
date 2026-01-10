Based on the provided backend codebase and the frontend refactoring goals, here is the strategic plan to prepare the Backend.

The core philosophy of this plan is **"GraphQL for State, Sockets for Signals."** This aligns with your requirement that sockets/polling are secondary to a unified data layer, while keeping the architecture robust.

---

# 🛠️ Backend Improvement Plan

## 1. Current Situation

- **Hybrid API Surface:** The backend currently exposes logic through three different channels with overlapping responsibilities:
  - **REST (`api/game/routes`):** Used for `submitAction`, `processTurn`, and `generateWorld`.
  - **GraphQL (`lifecycle/graphql`):** Used for some queries and mutations, but manually defined and not fully comprehensive.
  - **Socket.IO (`lifecycle/socket`):** Used for both _signaling_ (turn start/end) and _data transport_ (sending the full `GameState` object on join).
- **Heavy Socket Payloads:** The `stream-manager` and `game-broadcaster` currently broadcast massive JSON objects (full entity lists, map chunks) via Websockets. This makes the frontend state management complex because it has to merge Socket data with API data.
- **Loose Schema Coupling:** While `shared/schemas` exists (Zod), the GraphQL SDL (`type-defs.ts`) is manually written. There is no guarantee that the GraphQL API returns exactly what the Zod schema validates, leading to the "Any Pollution" on the frontend.

## 2. What We Need to Change

1.  **Shift to "GraphQL First":** Move all game interactions (Action Submission, Turn Processing, World Generation) to GraphQL Mutations. Keep REST **only** for Auth (`users-permissions`) and File Uploads (`upload` plugin).
2.  **Implement "Signal" Architecture:** Stop sending full data payloads over Socket.IO. Instead, send lightweight "Invalidation Signals" (e.g., `event: "turn_complete", turnId: "123"`). This forces the Frontend to refetch data via GraphQL, ensuring the "Unified Data Layer" (Apollo Cache) is always the single source of truth.
3.  **Strict Schema Mapping:** Ensure the GraphQL resolvers strictly adhere to the Zod schemas defined in `@daicer/shared`.
4.  **Expose "View Model" Resolvers:** Create specific GraphQL resolvers that aggregate data exactly how the frontend needs it (e.g., a `GameView` type) to prevent the frontend from needing to stitch together `Room`, `World`, and `TimeFrame` manually.

## 3. High-Level Approach

We will refactor the `lifecycle/graphql` layer to be the primary gateway. The `api/game` controllers will become thin wrappers or be bypassed entirely by GraphQL resolvers. We will modify the `game-broadcaster` to emit signals instead of data.

**The New Flow:**

1.  **Action:** Frontend calls `mutation SubmitAction`.
2.  **Logic:** Backend processes logic, updates DB.
3.  **Signal:** Backend emits Socket event `game:update` (Payload: `{ type: 'entities', ids: [...] }`).
4.  **Reaction:** Frontend receives signal -> Calls `apolloClient.refetch()`.
5.  **Data:** Backend returns fresh, strictly typed data via GraphQL.

---

## 4. Implementation Phases

### Phase 1: GraphQL Consolidation (The API Layer)

_Goal: Make GraphQL the only way to interact with game logic._

- **Task 1.1: Audit & Port REST Controllers.**
  - Review `api/game/controllers/game.ts`.
  - Ensure `submitAction`, `processTurn`, `spawnCreature`, and `generateWorld` have corresponding, fully-featured GraphQL Mutations in `lifecycle/graphql/mutation-resolvers.ts`.
- **Task 1.2: Define the `GameView` Schema.**
  - Update `lifecycle/graphql/type-defs.ts`. Create a comprehensive `GameView` type that includes `room`, `activeTurn`, `myself` (Player), and `visibleEntities`. This reduces frontend "God Component" complexity by providing a single query to render the screen.
- **Task 1.3: Deprecate Game REST Routes.**
  - Mark `api/game/routes/*.ts` as deprecated (except for debug/admin routes).

### Phase 2: The "Signal" Refactor (The Socket Layer)

_Goal: Reduce socket complexity and rely on Apollo Cache._

- **Task 2.1: Refactor `game-broadcaster.ts`.**
  - Modify `broadcastRoomEntities` and `broadcastTurnComplete`.
  - Instead of sending the full `entities` array, send a signal: `{ type: 'REFETCH_ENTITIES', roomId: '...' }`.
  - _Exception:_ Keep `llm:stream:event` sending text chunks, as real-time streaming is too fast for polling/refetching.
- **Task 2.2: Update `stream-manager.ts`.**
  - Ensure it supports a lightweight "Ping" mode for non-streaming events.

### Phase 3: Schema Hardening (Type Safety)

_Goal: Connect Zod Schemas to GraphQL._

- **Task 3.1: Zod-to-GraphQL Alignment.**
  - Review `shared/schemas/game.ts` and `lifecycle/graphql/type-defs.ts`.
  - Ensure every field in the GraphQL `EntitySheet` type matches the Zod `EntitySheetSchema`.
- **Task 3.2: Resolver Validation.**
  - In `lifecycle/graphql/resolvers.ts`, wrap the output of complex resolvers with `EntitySchema.parse()`. If the database data is malformed, the backend should throw/log immediately rather than sending bad data to the frontend.

### Phase 4: Optimization (Performance)

_Goal: Ensure the "Refetch" strategy is fast._

- **Task 4.1: Resolver Optimization.**
  - Since the frontend will refetch often, optimize the `Room.entities` and `Room.messages` resolvers.
  - Ensure `buildDeepPopulate` (in `cli/utils/schema.ts` logic used by resolvers) is efficient and doesn't over-fetch.
- **Task 4.2: TimeFrame Resolver.**
  - Expose `TimeFrame` fetching via GraphQL. Allow the frontend to request `query GetTimeFrame($id: ID!)` to support the "Time Travel" feature efficiently without reloading the whole room.

---

### Summary of Changes Required

| File/Module                               | Change                                                 |
| :---------------------------------------- | :----------------------------------------------------- |
| `lifecycle/graphql/type-defs.ts`          | Add `GameView` type; Ensure all Mutations exist.       |
| `lifecycle/graphql/mutation-resolvers.ts` | Implement logic currently trapped in REST controllers. |
| `api/game/services/game-broadcaster.ts`   | Switch from Data Broadcast to Signal Broadcast.        |
| `api/game/controllers/game.ts`            | Mark as deprecated (logic moved to Service/Resolver).  |
| `shared/schemas/*`                        | Treat as the "Bible" for GraphQL types.                |

This plan prepares the backend to support the **Unidirectional Data Flow** on the frontend by providing a stable, strictly typed, pull-based API.
