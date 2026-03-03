# Multi-Layer Map Rendering

## Goal
Implement a 3-layer map rendering system (Terrains -> Entities -> Items) with support for multi-cell entities and an interactive hover inspector that works over frozen map snapshots with pan/zoom mathematically translated.

## Tasks
- [ ] Task 1: Update `render-engine.ts` draw loop to render in 3 strict Z-index passes: Terrains, then Entities, then Items. -> Verify: Visually confirm items render on top of entities, which render on top of terrains.
- [ ] Task 2: Implement multi-cell entity rendering logic inside the Entities pass, expanding drawing bounds based on entity size (e.g., 1x1, 2x2, 3x3) starting from their origin cell. -> Verify: Large entities correctly span multiple visually rendered cells without clipping.
- [ ] Task 3: Implement stack rendering for items, drawing up to 5 overlapping item sprites on a single base coordinate. -> Verify: A cell with 5 dropped items visually stacks all 5 sprites sequentially.
- [ ] Task 4: Implement mathematical translation of `pointermove` Mouse (X,Y) to Grid (X,Y), accounting for canvas pan and zoom offsets. -> Verify: Hovering specific map cells accurately logs the corresponding logical grid coordinate in the console, regardless of zoom level.
- [ ] Task 5: Build a `HoverInspector` tooltip component that reads the frozen snapshot state to display the base names of the Terrain, Entity (checking if hovered cell falls within a multi-cell entity's bounds), and Items at the current Grid (X,Y). -> Verify: Hovering a 3x3 dragon with a sword on it displays "Lava Floor | Dragon | Steel Sword".

## Done When
- [ ] The Map Explorer renders all 3 layers correctly without z-fighting.
- [ ] Hover detection maps pixel coordinates to grid logic identically at any zoom scale.
- [ ] The Hover Inspector accurately lists all elements occupying the hovered cell, successfully resolving multi-cell entity overlaps.
