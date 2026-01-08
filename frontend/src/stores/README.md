<div align="center">

# 🧠 Frontend Stores (`src/stores`)

**The Client-Side Brain.**

> **Zustand, Immer, and Optimistic UI.**

</div>

---

## 🏛 The Store Architecture

We use **Zustand** for global state. It is lighter than Redux and supports transient updates (animation frames) without re-rendering the whole tree.

### 1. `useGameStore`

Tracks the Session State.

- **`room`**: The diverse object of the current room.
- **`players`**: List of connected users.
- **`turn`**: Current turn index and actor.

### 2. `useTerrainStore`

Tracks the Voxel World.

- **`chunks`**: `Map<"x,y", ChunkDTO>`
- **Optimistic Updates**: When you modify a tile, we update this store _immediately_ before sending the packet to the server.
- **Delta Patching**: Handles partial updates from `GAME_UPDATE` events.

### 3. `useUIStore`

Ephemeral UI state.

- `modals`: Open/Close state.
- `toasts`: Notification queue.
- `debug`: Toggles for the "God Mode" overlay.
