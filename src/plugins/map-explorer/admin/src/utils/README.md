# Map Explorer Frontend Utilities

Client-side utilities used by the `map-explorer` plugin admin interface. These handle the core visualization and interaction logic for the voxel editor.

## Key Modules

### `render-engine.ts`

A high-performance HTML5 Canvas rendering engine for isometric and top-down voxel map visualization.

- **Layers**: Supports multi-z-level rendering with ghosting for lower layers.
- **Sub-Pixel Textures**: Renders complex textures from `TerrainType` assets.
- **Fallbacks**: Robust color fallback system if assets are missing.

### `shape-tools.ts`

Mathematical helpers for generating pixel coordinates for drawing tools.

- **Rect**: Generates filled rectangles.
- **Circle**: Generates filled ellipses/circles using normalized coordinates.
