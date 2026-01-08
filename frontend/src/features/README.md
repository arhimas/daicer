<div align="center">

# ⚡️ Daicer Features (`src/features`)

**The Complex Domains.**

> **Vertical Slices of Functionality.**

</div>

---

## 📂 Modules

### 1. `debug/` (The God Mode)

This is not just `console.log`.
It is a visualized **Voxel Inspector**.

- **`MapRenderer3D`**: A raw Three.js view of the world state, independent of the main game loop.
- **`JsonViewer`**: Deep inspection of Entity State logic.

### 2. `create-room/` (The Wizard)

The multi-step flow for generating a new world.

- **Sequence**: Name -> Biome -> Seed -> Confirm.
- **Validation**: Checks seed uniqueness against the backend.

### 3. `lobby/` (The Waiting Room)

The pre-connection screen.

- Handles Character Selection.
- Displays Room Metadata (Active Players, Last Saved).
