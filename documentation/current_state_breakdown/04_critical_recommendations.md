# Critical Recommendations & Future Roadmap

> **Status**: **Strategic Directives**
> **Priority**: Critical for V1.0 Release.
> **Theme**: Performance, Storage, and Simulation.

## 1. Recommendation: Optimistic UI (The "Snappy" Protocol)

**Problem**: 200ms lag kills immersion.
**Directive**: Implement Client-Side Prediction for **Movement** and **Basic Interactions**.

### Implementation Strategy
1.  **Shared Logic**: Port `src/engine/physics.ts` (Collision Logic) to a shared package `@daicer/shared` that can run in the Browser.
2.  **The "Ghost" State**: The frontend maintains a `localState` (Redux) overlaid on the `serverState` (GraphQL).
    *   `DisplayPosition = localState.hasPendingMove ? localState.predictedPos : serverState.pos`
3.  **Reconciliation**: If the server rejects the move (e.g., hidden trap), the client receives a `GameEvent: REJECT_MOVE`. The frontend must play a "Rubber Band" animation snapping the token back.

## 2. Recommendation: The Great Simulation Suite

**Problem**: We know the code "works" (no crashes), but we don't know if the game is **fair**.
**Risk**: A Level 1 Spell might accidentally one-shot a Level 20 Dragon due to a hydration bug.

### The Monte Carlo Engine
We need a script that runs headless simulations.

```typescript
// src/scripts/simulate-battle.ts

const results = { wins: 0, losses: 0, turns: [] };

for (let i = 0; i < 10000; i++) {
    const fighter = createEntity('Fighter_Lvl5');
    const goblin = createEntity('Goblin_Boss');
    
    while(fighter.hp > 0 && goblin.hp > 0) {
        // AI: Random valid move
        const move = generateRandomMove(fighter);
        engine.dispatch(move);
    }
    
    if (fighter.hp > 0) results.wins++;
}

console.log(`Win Rate: ${results.wins / 100}%`);
// If Win Rate is 99%, the Goblin Boss is too weak.
```

## 3. Recommendation: Voxel Compression (Binary Storage)

**Problem**: A 100x100x10 map = 100,000 Voxels.
Stored as JSON: `[{x:1,y:1,z:1,t:'grass'}, ...]` -> ~50MB JSON payload.
**Postgres Bloat**: Retrieving this for every room load is catastrophic.

### The "Buffer" Solution
Store the map as a **Binary Blob** or **Image**.

**Scenario A: RLE (Run Length Encoding)**
Instead of `Grass, Grass, Grass...`, store `Grass: 50`.

**Scenario B: PNG Mapping (The "Pixel" Forge approach)**
- Use a PNG image where `Pixel(x,y)` color represents the height/terrain.
- 100x100 PNG = ~5KB.
- **Savings**: 99.9%.

### Implementation Plan
1.  Keep `voxel-change` (Deltas) as JSON relations (for history/undo).
2.  Convert the "Base Layer" of `api::room.room` to a `media` field (PNG) or a `blob` field (Binary).
3.  Update `VoxelEngine` to parse the Buffer on load.

## 4. Recommendation: The "Frozen" Archive

**Problem**: Every turn generates a `TimeFrame` record.
**Rate**: 1 turn / minute x 4 hours = 240 records per session.
**Bloat**: After 1 year, the `time_frames` table will have millions of rows.

### The Archival Strategy
Move old turns to Cold Storage.
1.  **Hot**: Last 50 turns (Fast access for Undo).
2.  **Cold**: Older turns are serialized to a single JSON file on S3/Google Cloud Storage and the SQL rows are deleted.
    *   `Entity: TimeFrameArchive { url: 's3://.../session_1_frames.json.gz' }`

**Impact**: Keeps the SQL database lean and fast while preserving history forever.
