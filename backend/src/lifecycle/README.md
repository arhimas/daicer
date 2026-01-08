<div align="center">

# ♻️ Daicer Lifecycle (`src/lifecycle`)

**The Beat of the Server.**

> **Sockets, Bootstraps, and Teardowns.**

</div>

---

## 🔌 Socket.IO (`lifecycle/socket`)

This module manages the Real-Time Event Stream.
It is initialized during the Strapi Bootstrap phase.

### Key Responsibilities

1.  **Authentication**: Validates JWT tokens on connection Handshake.
2.  **Room Joining**: `socket.join('room_<id>')`.
3.  **Broadcasting**:
    - `GAME_UPDATE`: Entity movements.
    - `NARRATIVE_STREAM`: LLM tokens.
    - `ERROR`: Toasts and alerts.

---

## 🏗 Bootstrap

The entry point for the "Game Loop" initialization.
Since Strapi is stateless by default, we use `lifecycle/bootstrap.ts` (often called from `src/index.ts`) to:

1.  Start the `VoxelWorker` threads.
2.  Resurrect any suspended `GameLoops`.
3.  Hydrate the `Redis` cache (if active).
