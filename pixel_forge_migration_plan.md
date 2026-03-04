# The Great Migration: Image & Anchor Pivot

## Core Philosophy
We are fully deprecating the 2D grid `PixelForge` drawing tool. All assets (Entities, Terrains, Items) will now use a pure "Image + Anchors" model.
This means relying on SOTA Generative AI (Gemini 3.1 Flash Image Preview) to generate transparent PNGs natively, and using the Strapi admin simply to **Visualize** the asset and **Click** to define coordinate offsets (Anchors).

## 1. UI Component: `<ImageAnchors />`
We will create a new Custom Field component in Strapi replacing `PixelForge`.
- **Image Generation:** A "Generate Image" button that sends the Entity/Item data to the backend. The backend will prompt the AI: *"Create a pixel art of [Prompt], [Width]x[Height] aspect, strictly NO background/transparent..."*.
- **Image Upload:** Standard fallback to upload an image manually.
- **Anchor Definition:** Clicking anywhere on the loaded image triggers a modal to set an Anchor Point (`x, y`), tagged with slots (e.g., `main_hand`, `head`).
- **Data Payload:** The JSON payload saved to Strapi will contain:
  ```json
  {
    "imageId": "url_or_media_id",
    "anchors": {
      "main_hand": [x, y],
      "off_hand": [x, y],
      "head": [x, y]
    }
  }
  ```

## 2. Anchor Hierarchy (Blueprint vs Entity)
- **Blueprints:** Provide the *default* anchors for an archetype (e.g., Humanoids typically have hands at mid-height).
- **Entities:** Inherit blueprint anchors but can override them (e.g., a specific Goblin might hold their dagger lower).
- **Items:** Have a single "Handle" anchor (where the item is gripped / attached), which snaps to the Entity's corresponding socket.

## 3. Render Engine Overlay Logic
When the Canvas renderer draws an Entity and its equipped Item:
1. Retrieve Entity's `main_hand` anchor `(eX, eY)`.
2. Retrieve Item's `handle` anchor `(iX, iY)`.
3. Draw Item at `Entity_Screen_X + eX - iX`, `Entity_Screen_Y + eY - iY`.

## Implementation Strategy
- **Phase 7A:** Deprecate `PixelForge` and implement the simplified `<ImageAnchors />` React Component in the Map Explorer Plugin.
- **Phase 7B:** Update `src/plugins/map-explorer/server/src/controllers/forge-controller.ts` to execute pure Image generation (no Grid arrays).
- **Phase 7C:** Wire the Custom Field to the Content Types (Entity, Item, Terrain, Blueprint).
- **Phase 7D:** Update `render-engine.ts` to handle Anchor-based Item compositing.
