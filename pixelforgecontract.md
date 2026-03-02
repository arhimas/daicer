# Pixel Forge V2 Architecture Contract

This document outlines the strict scale, cardinality, and matrix of permutations necessary to refactor the `@daicer/llm-core` sprite generator for accurate D&D 5e mapping.

---

## 1. Content Cardinality & Scale Matrix

Based on our Strapi architecture, we have 334 Entities, 470 Items, and 50 Terrains. 

### A. Size -> Grid Dimension Mapping
D&D 5e uses specific spatial sizes. Our pixel generation `targetSize` constraint must perfectly match or contain these ratios:

| D&D Size Class | Game Engine Cells (5ft per cell) | Pixel Forge Grid (`targetSize`) |
|----------------|----------------------------------|----------------------------------|
| Fine / Diminutive / Tiny | 1x1 (visually sub-grid) | **32x32** (Rendered small inside) |
| Small / Medium | 1x1 | **32x32** |
| Large | 2x2 | **64x64** |
| Huge | 3x3 | **96x96** |
| Gargantuan | 4x4 | **128x128** |
| Colossal | 6x6+ | **128x128** (Hard-capped max scale) |

### B. Blueprint Cardinality Matrix
To ensure the LLM has strict DNA skeletons to trace over, we need procedural Blueprints for:

**Entity Blueprints (Archetype + Size):**
- Humanoid (Small/Medium, Large, Huge, Gargantuan)
- Quadruped/Beast (Small/Medium, Large, Huge, Gargantuan)
- Avian/Flying (Small/Medium, Large, Huge, Gargantuan)
- Amorphous/Ooze (Small/Medium, Large, Huge)
- Serpent/Worm (Large, Huge, Gargantuan)

**Item Blueprints (Type + Size):**
*Items default to Medium (32x32) unless specified.*
- Weapon (Melee - Sword/Axe/Mace, Ranged - Bow/Crossbow)
- Armor (Chest, Helm, Shield)
- Consumable (Potion, Food)
- Wondrous/Tool (Ring, Wand, Staff, Misc)
- Loot/Container (Chest, Bag, Gem)

**Terrain Blueprints (Always 32x32):**
- Floor/Path (Stone, Dirt, Grass)
- Wall/Obstacle (Brick, Wood, Iron)
- Environment (Tree, Bush, Rock, Liquid)

---

## 2. Core Socratic Discovery (RESOLVED)

1. **Grid Padding Override:** `Fine/Diminutive/Tiny` creatures share the standard `32x32` grid but are drawn taking up less space.
2. **RGBA4444 Hex vs Named Colors:** We are proceeding with pure RGBA4444 Hex processing.
3. **Colossal Scale Limit:** Hard-capped at Gargantuan (`128x128`).
4. **Transparent Symbol:** Best SOTA character will be used for negative space.
5. **Procedural vs Handcrafted Blueprints:** The LLM will auto-generate base blueprints programmatically behind the scenes for ALL CARDINALITY.
6. **Dynamic Zoning UI:** UI color palette strictly locks users *only* to the zones explicitly defined in the chosen Blueprint.
7. **Equipment Rendering Hierarchy:** V2 system preserves the visual "paper doll" layering.
8. **JSON Field Storage:** Dropping values columns and re-adding them is acceptable.
9. **Image Asset Caching:** JSON array format remains for now.
10. **Asynchronous Forging:** Triggered on-demand, with future batch considerations.

---

## 3. Phase 2: Deep Technical Implementation Planning (20 Questions)

Now that we have established the foundational laws of the V2 pipeline, we must explicitly define the exact implementation paths. Please answer these 20 technical questions to confirm the data flow, prompt schema, and edge-case handling.

### The Transformer Module (`pixel-transformer.ts`)
1. **ASCII Validation:** When the transformer parses a string like `"................................"`, and finds `"X"` (which maps to `#FF0000`), should it return the full standard hex `#FF0000FF` to the frontend, or stick to the 4-bit `f00f` natively everywhere?
2. **Cropping Anchor:** If an LLM generates a 34x34 grid and we must crop it to 32x32, should we crop symmetrically from all four sides (anchor center), or crop from the bottom-right (anchor top-left)?
3. **Padding Anchor:** If an LLM generates a 30x30 grid and we must pad it to 32x32, should we pad it symmetrically, centering the sprite, or pad it on the bottom/right?
4. **Palette Hallucination:** If the LLM uses the character `!` in the matrix, but forgets to define `!` in the `palette` JSON object, the system will fall back to `transparent`. Should the system also log a formal warning via the CLI when this happens?
5. **Malformed JSON Handling:** If the LLM returns text with trailing commas or broken syntax that fails `JSON.parse()`, should the transformer attempt a raw Regex extraction of the arrays, or instantly fail the job to BullMQ for a retry?

### The "All Cardinality" Blueprint Generator
6. **Blueprint Naming Schema:** When the system auto-generates blueprints, what should the `slug` format be? (e.g., `bp_entity_humanoid_medium` or just `humanoid_medium`)?
7. **Blueprint Color Zones:** What specific palette characters should the LLM use for standard procedural blueprints? (e.g., `M` for Main Body, `S` for Secondary, `A` for Accents, `E` for Eyes).
8. **Terrain Blueprint Variation:** If a user requests 10 different "Stone Floors", should the LLM use exactly ONE master `bp_terrain_stone` blueprint for all 10, or does each Terrain request dynamically generate its own fresh blueprint first?
9. **Automated Blueprint Injection:** When a user opens a brand-new entity (e.g., an Orc) in the Pixel Forge, should the backend *automatically* run the Blueprint LLM prompt if `bp_entity_humanoid_medium` doesn't exist yet, pausing the UI load until complete?
10. **Storage Destination:** Where will these auto-generated blueprints live? Strictly as entries in the `api::blueprint.blueprint` Strapi table, or as hardcoded JSON seed files in the genesis directory?

### The UI Restrictions & Zoning
11. **Zone Enforcer:** You mentioned locking users to the Blueprint zones. This means the UI color picker will disappear, replaced entirely by a dropdown of `Main Body`, `Secondary`, `Eyes`, etc. Is this strict restriction correct?
12. **Symbol Rendering:** In the UI Grid Viewer, when the raw format is just ASCII symbols (`M`, `S`, `E`), the front-end must color them. Should the UI fetch a designated color map from the Strapi `Entity Zones` collection to display them, or choose random distinct UI colors?
13. **Manual Override Tool:** If the user is locked to zones, do they get an "Eraser" tool to remove a pixel completely, or are they only allowed to change a pixel's Zone assignment?
14. **Custom Blueprint Edit:** If a user discovers the procedural "Humanoid" blueprint is badly proportioned, what is the exact flow for them to fix it? (e.g., Open Blueprint Editor, redraw, Save -> Does this invalidate/update all Orcs/Elves using it?).

### Data Payload & Model Flow
15. **Payload Replacement Strategy:** Since we are completely replacing the `[[ "transparent", "#0000" ]]` strings with the new compact format, should we rename the Strapi field from `pixels` or `pixelData` to `compactMatrix` on the schemas, or keep the existing field name?
16. **Token Cap on Prompts:** Will the "Golden Prompt" contain a dynamic injection of the target entity's `lore` and `description`, or strictly its mechanical properties (Name, Type, Size) to keep the context window lightning-fast?
17. **Model Designation:** You established `gemini-3-flash-preview` for generation previously. Are we enforcing Flash exclusively for this new ASCII logic, or moving to `gemini-3-pro-preview` for the Blueprint foundational logic?
18. **Temperature and Top-P:** Spatial ASCII generation works best at extremely low temperatures. Should we hardcode the generation parameters to `temperature: 0.1` and `topP: 0.1`?
19. **Paper Doll Compositing:** Because Weapon sprites (32x32) will be overlaid onto Huge Entities (96x96), how do we determine *where* on the 96x96 grid the 32x32 sword is placed? (e.g. "Weapon Sockets" defined in the Entity Blueprint?).
20. **Error Transparency:** When an on-demand UI request fails (e.g., Gemini timeouts), should the Pixel Forge UI display a generic "Generation Failed" toast, or the specific step failure ("Failed to generate Blueprint DNA")?

---
*Awaiting your answers. After this, we will execute the final `plan.md` tasks.*
