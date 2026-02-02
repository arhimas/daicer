# Map Explorer & Pixel Forge

> [!NOTE]
> **SOTA Visual Engine for Daicer v2**

This plugin provides the **World Map Visualization** and the **Pixel Forge** asset generation engine.

## Pixel Forge

The **Pixel Forge** is an embedded AI-powered pixel art studio. It allows designers to generate, edit, and assign 32x32 sprites directly to Game Entities (Monsters, Items, Terrain).

### Key Features

- **Generative AI**: Uses `gemini-1.5-flash` to hallucinate pixel grids based on entity naming and description.
- **Blueprint System**: Uses ASCII-based anatomy maps to guide the AI (ensuring heads are at the top, legs at the bottom).
- **Self-Healing Data**: The backend service assumes the AI will output broken JSON and aggressively repairs it (Padding, Truncation, JSON Repair).
- **SOTA Editor**: A full-screen modal editor with Pencil, Eraser, and Picker tools.

### Architecture

1.  **Input**: User clicks "Forge Sprite" in Admin Panel.
2.  **Dispatch**: `PixelForge` component sends job to `ForgeController`.
3.  **Queue**: Job is pushed to `pixel-forge-queue` (BullMQ/Redis).
4.  **Worker**:
    - Retrieves Entity Context.
    - Selects Archetype Blueprint.
    - Calls `GeminiService.generatePixelData`.
5.  **Result**: Polling component receives new 32x32 grid and updates the UI.

## Components

### `PixelForge` (Admin)

The primary interface.

- **Location**: `src/plugins/map-explorer/admin/src/components/PixelForge`
- **State**: Local React State + Polling Hook.
- **Integration**: Registered as a Custom Field (`plugin::map-explorer.sprite-grid`).

### `GeminiService` (Backend)

The brain.

- **Location**: `src/plugins/map-explorer/server/src/services/gemini-service.ts`
- **Responsibilities**: Prompt Engineering, API Communication, Data Sanitation.

## Testing Strategy

We employ a **Property-Based Testing** approach for the robust voxel engine.

- **Generative Tests**: 300+ random scenarios run on every build to ensure the "Self-Healing" logic never crashes, even with garbage input.
- **Integration Tests**: Verify the full Dispatch -> Queue -> Result flow.
