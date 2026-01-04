# Study: Cities, Villages, and Structures

> **Goal**: Create realistic, granular, and "LLM-aware" structures in the Daicer Voxel Engine.

## 1. The Challenge of Scale

In Daicer, **1 Tile = 1 Foot**.
This extreme granularity means a "Small Village" is not just a few tiles; it is a massive area.

- A small house (20ft x 30ft): 600 tiles.
- A village (300ft x 300ft): 90,000 tiles.
- A city (1 mile x 1 mile): ~27,000,000 tiles (5280x5280).

**Current System**:

- `TerrainGenerator` uses pure Perlin noise for biomes.
- It has no concept of "Location" or "Context" (e.g., "I am inside a Castle").

**The Problem**:
If we rely solely on random noise for structures, we get disjointed, nonsensical buildings. We need **Coherence**.

## 2. Proposed Architecture: Two-Pass Generation

We split generation into **Macro (World)** and **Micro (Voxel)** layers.

### Phase 1: The Macro Grid (The "Atlas")

Before any voxel is generated, we generate an **Abstract World Atlas**.
This runs once for the whole map (or large regions).

1.  **Voronoi Regions**: Divide the infinite plane into "Provinces" or "Political Regions" using Voronoi cells.
2.  **Site Selection**:
    - Pick specific points to be "Cities", "Villages", "Ruins".
    - Store them in a `WorldStructureIndex` (Spatial Hash or Quadtree).
    - **Metadata**: Name ("Eldoria"), Type ("Capital"), Wealth ("Rich"), Seed.
3.  **Road Network**:
    - Connect Sites with A\* pathfinding on the Macro Grid.
    - Store "Road Segments" as vectors.

**Output**: A lightweight database Query: `getStructuresAt(worldX, worldY)`.

### Phase 2: Micro Generation (The "Blueprint")

When `TerrainGenerator.generate(chunkX, chunkY)` is called:

1.  **Check Context**: Query `WorldStructureIndex` for overlaps.
2.  **Apply Layers**:
    - **Base Terrain**: Standard Perlin noise (Grass, Dirt).
    - **Structure Overlay**: If inside a City, use the **City Layout Generator**.
    - **Road Overlay**: If near a Macro Road vector, rasterize paving stones.

### Phase 3: The City Layout Generator

Inside a City boundary, we don't just place blocks randomly. We use **Hierarchical Generation**.

1.  **Districts**:
    - Divide City loop into Districts (Castle, Market, Slums, Harbor).
    - Implementation: Weighted Voronoi or Binary Space Partitioning (BSP).
2.  **Plots**:
    - Divide Districts into "Plots" (House, Shop, Plaza) separated by "Streets".
3.  **Blueprints**:
    - Fill Plots with actual Voxels using **Architectural Grammars** (L-Systems) or Pre-fab templates.
    - _Example_: "Rich District House" = Stone walls, slate roof, 3 floors.
    - _Example_: "Slum" = Wood/cloth walls, dirt floor, 1 floor.

## 3. LLM Awareness

To make the LLM "know" what it sees, we introduce a **Context API**.

```typescript
interface LocationContext {
  biome: BiomeType;
  // Hierarchical location data
  location: {
    name: string; // "Eldoria"
    type: string; // "City"
    district?: string; // "Market District"
    building?: string; // "Blacksmith Shop"
  } | null;
  // Nearby features for navigation
  nearby: string[]; // ["City Gate (North)", "River"]
}
```

The LLM calls `get_location_context(entity.pos)` and receives this structured data, allowing it to narrate: _"You stand in the bustling Market District of Eldoria. To your north lies the City Gate..."_

## 4. Workflows & Visual Pipeline

```mermaid
graph TD
    subgraph "Phase 1: Macro World Gen"
        S[Seed] --> Regions[Voronoi Provinces]
        Regions --> Sites[Select City Sites]
        Sites --> Roads[Connect Roads (A*)]
        Sites --> Index[Spatial Index (Quadtree)]
    end

    subgraph "Phase 2: Chunk Gen (Runtime)"
        Req[Request Chunk X,Y] --> Query{Check Index}
        Query -- Outside City --> Nature[Perlin Terrain]
        Query -- Inside City --> CityGen[City Generator]

        CityGen --> Districts[District Partitioning]
        Districts --> Plots[Street/Plot Division]
        Plots --> LSystem[L-System Architecture]
        LSystem --> Voxel[Place Voxels]

        Nature --> Final[Chunk Data]
        Voxel --> Final
    end

    subgraph "Phase 3: LLM Context"
        Agent[LLM Agent] --> API[get_location_context]
        API --> Index
        Index --> Context[Return: "Market District"]
    end
```

## 5. Implementation Steps

1.  **Create `WorldAtlas` Module**:
    - Simple Voronoi implementation.
    - `Structure` definitions with bounds.
2.  **Integrate with `TerrainGenerator`**:
    - Inject `WorldAtlas` query into `generate()`.
    - Override Z-levels 0-10 with structure blocks inside bounds.
3.  **Implement `CityArchitect`**:
    - Simple L-System for "House" (Wall rect + Roof pyramid).
    - Basic "Road" rasterizer.
4.  **Expose `get_location_context` tool**:
    - For the LLM to use.
