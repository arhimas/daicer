# Study: Dynamic Engine Registries & Cardinality

> **Goal**: Move Engine constants (Biomes, Materials) from hardcoded TypeScript Enums to a Data-Driven Strapi Architecture, while maintaining strict determinism and "Cardinality Rigidity".

## 1. The Problem: Hardcoded Limits

Currently, `BlockType` and `BiomeType` are Zod Enums in `voxel.ts`.

- **Limit**: Adding "Marble Floor" requires a code deploy + rebuild.
- **Gap**: The "Daicer Architect" editor needs to know _what colors_ to render. We don't want to hardcode hex codes in the frontend code either.

## 2. The Solution: The "Registry" Pattern

We introduce a **Global Registry Singleton** in the Engine.
This Registry is populated by data fetched from Strapi at **Server Startup** (Bootstrap phase).

### 2.1. New Strapi Schemas

#### A. `WorldMaterial` (Collection Type)

Represents a Voxel Type (was `BlockType`).

| Field          | Type    | Description                                                         |
| :------------- | :------ | :------------------------------------------------------------------ |
| `name`         | String  | Display Name ("Ancient Stone Wall").                                |
| `slug`         | UID     | **The Cardinal Key** ("wall_stone_ancient"). Immutable.             |
| `numeric_id`   | Integer | (Optional) Optimized ID for binary formats.                         |
| `texture_data` | JSON    | `{ "color": "#7a7a7a", "roughness": 0.8, "metalness": 0.1 }`        |
| `physics`      | JSON    | `{ "isWalkable": false, "isTransparent": false, "light_level": 0 }` |
| `tags`         | JSON    | `["stone", "manufactured", "wall"]`                                 |

#### B. `WorldBiome` (Collection Type)

Represents a climate zone (was `BiomeType`).

| Field              | Type     | Description                                    |
| :----------------- | :------- | :--------------------------------------------- |
| `name`             | String   | "Misty Forest"                                 |
| `slug`             | UID      | "forest_misty"                                 |
| `temperature`      | Float    | 0.0 - 1.0 (For generation placement).          |
| `moisture`         | Float    | 0.0 - 1.0 (For generation placement).          |
| `elevation_range`  | JSON     | `{ "min": 0.2, "max": 0.6 }`                   |
| `sky_color`        | String   | Hex Code ("#a0bbaa").                          |
| `materials`        | Relation | **One-Way Mapping** to `WorldMaterial`.        |
| `vegetation_rules` | JSON     | Spawning rules for trees/cactus in this biome. |

**Relation: Biome -> Material Mapping**
Instead of hardcoding "Forest has `BlockType.GRASS`", the Biome entity has a JSON field or Component:

```json
// Field: surface_palette
{
  "top_block": "grass_emerald",
  "soil_block": "dirt_dark",
  "beach_block": "sand_white"
}
```

## 3. "Cardinality Rigid": The Safety Layer

The user asked for **"Cardinality Rigid"**. This means:
_We must improve things later (edit properties) without breaking existing saves/blueprints._

**The "Slug" is King.**

- In the database/blueprints, we store the **Slug** (e.g., `wall_stone`).
- We NEVER store the Strapi `id` (1, 2, 3) because deleting/re-creating an entry changes the ID.
- We can create a lightweight translation map for binary compression:
  - `Map<Slug, TemporaryRuntimeID>`
  - Inside a Blueprint Blob, we use the Palette to map local ID -> Slug.

### 3.1. The "Unknown Material" Fallback

If we load a blueprint that asks for `wall_obsidian` but that entry was deleted from Strapi:

- **Runtime Fallback**: The Registry must return a `ERROR_BLOCK` (Hot Pink Cube) or a `FALLBACK_BLOCK` (Generic Stone) defined in the Global Config.
- **Strict Mode**: The Engine logs a warning but does not crash.

## 4. Implementation: The Bootstrap Flow

1.  **Strapi Boot**:
    - Load `api::world-material` definitions.
    - Load `api::world-biome` definitions.
2.  **Engine Hydration**:
    - `Registry.registerMaterials(strapi_materials)`
    - `Registry.registerBiomes(strapi_biomes)`
3.  **Frontend Sync**:
    - When the Client connects, it requests `GET /api/engine/registry`.
    - The Client receives the FULL list of Materials (with Colors/Textures) and Biomes.
    - React Three Fiber uses this to build the Texture Array / Color Map dynamically.

## 5. Visual Deep Dive (Frontend)

Previously:

```typescript
const COLOR_MAP = {
  [BlockType.GRASS]: '#567d46',
};
```

Future (Dynamic):

```typescript
// Received from API
const materials = registry.materials; // Map<Slug, MaterialData>

function VoxelMesh() {
  // Use 'materials' to generate the InstanceColor buffer
}
```

## 6. Functional Flow Diagram

```mermaid
graph TD
    subgraph "Strapi Backend"
        M[WorldMaterial Collection] -->|Fetch All| API[Registry API]
        B[WorldBiome Collection] -->|Fetch All| API
    end

    subgraph "Engine Runtime"
        API -->|Hydrate| Reg[Global Registry (Singleton)]
        Reg -->|Provide Config| Gen[TerrainGenerator]
        Gen -->|Lookup 'grass_misty'| Reg
    end

    subgraph "Frontend Client"
        Client -->|GET /registry| API
        API -->|JSON Definition| R3F[React Three Fiber]
        R3F -->|Dynamic Materials| Mesh[InstancedMesh]
    end
```

## 7. Migration Strategy

1.  **Audit**: Identify all usages of `BlockType` enum in `terrain-generator.ts`.
2.  **Seed**: Create a script to populate Strapi with the initial 18 legacy blocks (Dirt, Stone, etc.) to ensure parity.
3.  **Refactor**: Change `TerrainGenerator` to accept `BiomesRegistry` in its constructor.
4.  **Codegen**: Generate TypeScript types from Strapi Schemas to replace the Zod Enums eventually (or keep Zod Enums as the "Core Interface" and map Strapi to them).

> **Note**: For type safety, we can generate a `materials.d.ts` from the Database content during the build step, effectively giving us "Dynamic Strong Typing".
