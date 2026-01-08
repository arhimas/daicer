# Study: Structure Blueprints & Deterministic Injection (Deep Dive)

> **Status**: APPROVED for Deep Technical Analysis
> **Goal**: Create a production-ready specification for the "Manual to Procedural" pipeline.
> **Philosophy**: "Hand-crafted Soul, Procedurally Distributed."

---

## 1. The Data Layer: Hyper-Optimized Storage

We cannot simply store JSON arrays of `{x,y,z,block}`. A generic castle (50x50x20) is 50,000 voxels. In JSON, that's ~2MB per structure. Too slow for network transfer and too heavy for DB.

We implement a **Palettized Binary Storage Format**.

### 1.1. The "Structure Blob" Format

We store the voxel data as a **Buffer** (or Base64 string in JSON) using a custom layout:

**Header**:

- `Version` (1 byte): Format version.
- `SizeX, SizeY, SizeZ` (3 bytes): uint8 dimensions (Max structure size 255x255x255).
- `PaletteSize` (1 byte): Number of distinct block types used.

**Palette**:

- List of `PaletteSize` strings (null-terminated or length-prefixed).
- Example: `["STONE_WALL", "OAK_PLANK", "GLASS", "TORCH"]`
- This maps ID `0` -> `STONE_WALL`, `1` -> `OAK_PLANK`.

**Voxel Data (Run-Length Encoded)**:

- A stream of `[Count, PaletteID]` pairs.
- **Problem**: 3D data is inefficient to RLE if linear (X->Y->Z).
- **Solution**: We strictly order by Y (Height), then X, then Z. This captures "floors" and "walls" efficiently.
- **Byte Structure**:
  - `Count` (1 byte): 1-255 repetitions.
  - `ID` (1 byte): Palette Index.

**Compression Ratio Estimate**:

- Raw JSON: ~100 bytes/voxel.
- Raw Binary: 1 byte/voxel (with palette).
- RLE Binary: ~0.05 bytes/voxel (Walls are long runs).
- **Result**: A 50k voxel castle -> ~2-5KB. **1000x Improvement**.

### 1.2. The Strapi Schema (Expanded)

```typescript
// backend/types/schemas/StructureBlueprint.ts

interface StructureBlueprint {
  id: number;
  attributes: {
    // Identity
    name: string; // "Watchtower of the Falling Leaf"
    slug: string; // "watchtower-falling-leaf-v1" (Unique Index)

    // Categorization
    category: 'CIVILIAN' | 'MILITARY' | 'RELIGIOUS' | 'NATURAL' | 'MAGIC';
    size_class: 'TINY' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HUGE' | 'MONUMENTAL';
    tags: string[]; // ["human", "ruin", "coastal", "path-snap"]

    // Procedural Rules
    biomes_whitelist: string[]; // If empty, allowed everywhere.
    biomes_blacklist: string[]; // e.g., ["ocean", "deep_ocean"]
    terrain_slope_tolerance: number; // 0.0 to 1.0. Max steepness allowed.
    foundation_depth: number; // How far to drill down (default 5).

    // Road Snapping
    snap_to_road: boolean; // Must be placed adjacent to a road?
    entry_points: {
      x: number;
      y: number;
      z: number;
      facing: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
    }[]; // Used to rotate the structure to align with the road.

    // The Data
    dimensions: { x: number; y: number; z: number };
    anchor: { x: number; y: number; z: number }; // Relative to origin (0,0,0)
    data_blob: string; // Base64 encoded RLE binary.

    // RAG/Lore
    lore_template: string; // "A watchtower built by {{faction}}. It smells of {{smell}}."
    poi_weight: number; // 0-100. Higher = Likely to be a "Point of Interest" in the Knowledge Graph.
  };
}
```

---

## 2. The Editor Utility: "Daicer Architect" (Deep Dive)

The frontend editor must be a robust CAD-like tool.

### 2.1. State Management (Zustand Store)

```typescript
interface ArchitectState {
  // Metadata
  meta: StructureMetadata;
  setMeta: (m: Partial<StructureMetadata>) => void;

  // Voxel Grid (Raw editing format, uncompressed)
  // Map<"x,y,z", BlockType> - Sparse storage for editing speed.
  voxels: Map<string, BlockType>;

  // Selection/Cursor
  cursorRef: { x: number; y: number; z: number };
  brush: { block: BlockType; mode: 'PLACE' | 'ERASE' | 'PICK' };

  // Layers
  viewMode: 'ALL' | 'SLICE';
  sliceY: number; // Only show levels <= Y for easier indoor editing.

  // Actions
  placeVoxel: (x, y, z, block) => void;
  floodFill: (x, y, z, block) => void; // BFS algorithm
  rotate: () => void; // Rotates the entire Map 90 degrees.
  optimize: () => void; // Runs the RLE compressor for export preview.
}
```

### 2.2. The "Ghost" & Raycasting

In R3F, we don't just raycast against meshes. We raycast against a **Virtual Grid Plane**.

1.  **Grid**: `Math.floor(point.x + 0.5)` logic to snap to integers.
2.  **Face Detection**: If raycasting against an existing voxel, we need the _normal_ to know if we are placing _on top_ or _replacing_.
3.  **Ghost Voxel**: Render a semi-transparent mesh of the current Brush Block at the snap coordinates.
    - _Visual Feedback_: Turn Red if placement is invalid (e.g., inside self, out of bounds).

### 2.3. The "Slice" View

Critical for editing interiors.

- **Implementation**: In the Shader or via `clippingPlanes` in Three.js.
- **Better Approach**: Simply _don't render_ generic Voxel Meshes above `sliceY`. React's mapping of `voxels` to `<InstancedMesh>` should filter `v.y <= sliceY`.

### 2.4. Validation Rules (The QC Layer)

Before saving, run checks:

1.  **Floating Voxels**: Run Union-Find or BFS from Z=0. Warn if blocks are disconnected (floating in air).
2.  **Entrances**: Check if `entry_points` actually lead to valid air blocks (not embedded in wall).
3.  **Complexity**: Warn if palette size > 128 (Texture atlas limits).

---

## 3. The "Injector" Engine: Algorithms & Math

This is where the magic happens. `TerrainGenerator.generate(chunk)` needs to be fast. We cannot parse Base64 strings every frame.

### 3.1. Startup: The "Baked Cache"

On server boot:

1.  Fetch ALL Blueprints from Strapi.
2.  Decode Base64 -> Raw IntArray `[x][y][z]`.
3.  Store in `StructureCache`:
    ```typescript
    const StructureCache = {
       byBiome: {
          forest: [BlueprintA, BlueprintB],
          plains: [BlueprintA, BlueprintC]
       },
       bySize: {
          SMALL: [...],
          LARGE: [...]
       }
    };
    ```

### 3.2. Macro-Grid Hashing (The Determinism)

We use a **Spatial Hash** that is independent of Chunk borders.

- **Structure Cell Size**: 32 (Approx 2 chunks).
- **Algorithm**:

```typescript
function getStructureAt(worldX: number, worldY: number, seed: string) {
  // 1. Quantize to Cell
  const cellX = Math.floor(worldX / 32);
  const cellY = Math.floor(worldY / 32);

  // 2. Hash
  const h = murmur3(seed, cellX, cellY); // 32-bit int

  // 3. Bits Extraction
  const chance = (h & 0xff) / 255.0; // 0-255 -> 0.0-1.0
  const rot = (h >> 8) & 0x03; // 0, 1, 2, 3 (Rotation)
  const variant = (h >> 10) & 0xffff; // Index for array selection

  if (chance > CONFIG.structure_density) return null;

  // ... Select structure using 'variant' index ...
}
```

### 3.3. The "Skirt" Algorithm (Slope Adaptation)

A square house on a hill looks bad (floating corners).
**Algorithm**:

1.  **Scan**: For every `(x, y)` in the blueprint footprint.
2.  **Measure**: `g = GetTerrainHeight(worldX + x, worldY + y)`.
3.  **Compare**: The Blueprint expects ground at `Z = anchor.z`.
4.  **Fill**:
    - If `g < targetZ`: Fill vertical column from `g` up to `targetZ` with `FOUNDATION_BLOCK` (e.g., Cobblestone).
    - If `g > targetZ`: This implies burial.
      - _Option A (Flatten)_: Force terrain at `(x,y)` to match `targetZ`.
      - _Option B (Reject)_: If `(g - targetZ) > terrain_slope_tolerance`, **ABORT** placement. The hill is too steep for this building.

### 3.4. Road Snapping (Vector Alignment)

If `snap_to_road: true`:

1.  Query `RoadNetwork` (Voronoi edges) for the nearest segment.
2.  Calculate **Normal Vector** of the road segment.
3.  Rotate the Blueprint (0, 90, 180, 270) such that its `entry_point.facing` vector opposes the road normal (faces the road).
4.  Shift the `(CellX, CellY)` center to strictly align the `entry_point` with the road edge.

---

## 4. Integration with RAG & Lore (The "Soul")

Procedural structures feel empty. We fix this with **Deterministic Lore Injection**.

### 4.1. The "Lore Seed"

Every placed structure has a unique `InstanceID` (e.g., `Struct-502-12-99`).
We derive a `LoreSeed` from this ID.

### 4.2. Template Hydration

Strapi Blueprint:
`lore_template`: "This is {{name}}, a {{adjective}} {{type}} founded by {{founder}}."

**Runtime Resolver**:

1.  **Name Gen**: Use Markov Chain or simple list based on Faction. -> "Blackwood Watch"
2.  **Adjective**: Pick from pool based on `EntropyState` (Is the world dark? "Crumbling". Is it prosperous? "Gleaming").
3.  **Founder**: Generate an NPC name deterministically. -> "Captain Thorne"

**Result**: "This is Blackwood Watch, a gleaming outpost founded by Captain Thorne."

### 4.3. RAG Injection

When a chunk with a structure is generated:

1.  We construct a **Knowledge Document** (Markdown snippet).
2.  **Content**: The hydrated lore + precise location coordinates.
3.  **Push**: Upsert this into the `VectorDB` (or the ephemeral semantic search index).
4.  **Effect**: If the user asks "Who founded the tower nearby?", the RAG retrieves this snippet _even though it was procedurally generated 5ms ago_.

---

## 5. Performance Strategy

### 5.1. The "Stamp" Method

We do not use `setBlock` for every voxel. That triggers 50,000 updates.
We implement `chunk.applyStamp(voxelArray, x, y, z)`.

- **Direct Buffer Access**: Modify the underlying `Int32Array` of the chunk directly.
- **Lighting Recalc**: defer lighting updates until _after_ the whole stamp is applied.

### 5.2. Instanced Mesh Merging (Frontend)

For massive cities:

- Do NOT render each structure as individual meshes.
- The chunk mesher already handles this. We treat structure voxels exactly like terrain voxels. They get greedy-meshed together.
- **Exception**: "Interactive" blocks (Doors, Chests) are extracted as Entity Objects.

### 5.3. Occlusion Culling (Fog of War)

Structures often have interiors.

- **Logic**: If the player is outside, do not render the interior furniture entities.
- **Trigger**: A simplified "Indoor Volume" box. If `PlayerPos` is inside, load interior details.

---

## 6. Implementation Roadmap

### Phase 1: The Foundation

1.  [Backend] Create `StructureBlueprint` Content Type.
2.  [Shared] Define `VoxelBlob` binary format and helper classes.
3.  [Frontend] Prototype "Daicer Architect" (Grid + Place Block).

### Phase 2: The Pipeline

4.  [Frontend] Implement Save/Load to Strapi.
5.  [Engine] Implement `StructureService` (Cache & Hash Logic).
6.  [Engine] Integrate `TerrainGenerator` override layer.

### Phase 3: The Polish

7.  [Engine] Implement "Skirt" foundation logic.
8.  [Engine] Implement Road Snapping.
9.  [LLM] Connect the "Lore Hydrator" to the Narrator API.

---

## 7. Edge Cases & "Gotchas"

| Scenario                      | Risk                            | Solution                                                                                                               |
| :---------------------------- | :------------------------------ | :--------------------------------------------------------------------------------------------------------------------- |
| **Structure spans 2 Chunks**  | Visual seams, generation order. | Structures are generated in a "Post-Terrain" pass that can write to neighbor chunks. We effectively "lock" the region. |
| **Structure overlaps a Tree** | Clipped geometry.               | `Structure` > `Tree`. The Structure Stamp erases all vegetation in its bounds using a 'Clear Air' pass first.          |
| **Structure placed on Water** | Flooding.                       | Check `biomes_blacklist`. If water allowed (e.g., Pier), handle water-logging logic (Columns go to sea floor).         |
| **Version Mismatch**          | Old blueprint, new format.      | `Version` byte in header. Write migration utility in `StructureService` to upgrade blobs on load.                      |
