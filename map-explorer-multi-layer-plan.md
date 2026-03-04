# Multi-Layer Map Explorer UI

## Goal
Upgrade the Map Explorer Admin plugin to render a 3D-stacked data structure (Terrains, Entities, Items) on a 2D HTML Canvas, supporting multi-cell entities and an interactive hover inspector.

## Tasks
- [x] Task 1: Refactor MapRenderer draw loop into 3 explicit Z-indexed passes (Terrains=0, Entities=1, Items=2). -> Verify: Changing drawing order visually stacks components correctly on canvas.
- [x] Task 2: Implement multi-cell Entity rendering logic using the bounding box (width/height from size). -> Verify: "Large" entities occupy 2x2 cells, "Huge" occupy 3x3.
- [x] Task 3: Add `mousemove` event listener to canvas to track hovered Map Grid `(x,y)`. -> Verify: Redux/state accurately tracks hovered grid coordinates.
- [x] Task 4: Create a `<HoverInspector />` React component showing details. -> Verify: Component mounts and overlays the UI.
- [x] Task 5: Implement data intersection filtering logic to populate the Hover Inspector. -> Verify: Inspector lists the correct Terrain, overlapping Entity, and Items for the hovered cell.

## Done When
- [x] Multi-layer canvas successfully renders 1x1 Terrains, NxN Entities, and Stacked Items.
- [x] Hovering over any cell correctly identifies all objects present at that coordinate via the Inspector panel.
