"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeItemBlueprint = exports.generateItemGrid = void 0;
const entity_geometry_1 = require("../../../utils/entity-geometry");
const grid_utils_1 = require("../grid-utils");
const generateItemGrid = (config) => {
    const size = config.size || 'Medium';
    const gridSize = (0, entity_geometry_1.getPixelDimensions)(size);
    const grid = (0, grid_utils_1.createEmptyGrid)(gridSize);
    const color = '#c0c0c0'; // Silver default
    // Full Frame Drawing (0.0 - 1.0 is full grid)
    const px = (p) => Math.floor(gridSize * p);
    const py = (p) => Math.floor(gridSize * p);
    const sw = (p) => Math.max(1, Math.floor(gridSize * p));
    const sh = (p) => Math.max(1, Math.floor(gridSize * p));
    // Basic Item Shapes
    if (config.itemType === 'weapon') {
        // Simple Sword Shape
        (0, grid_utils_1.fillBox)(grid, px(0.42), py(0.05), sw(0.16), sh(0.55), color); // Blade
        (0, grid_utils_1.fillBox)(grid, px(0.25), py(0.55), sw(0.5), sh(0.1), '#8b4513'); // Guard
        (0, grid_utils_1.fillBox)(grid, px(0.45), py(0.6), sw(0.1), sh(0.25), '#8b4513'); // Handle
    }
    else if (config.itemType === 'armor') {
        // Chestplate
        (0, grid_utils_1.fillBox)(grid, px(0.2), py(0.15), sw(0.6), sh(0.6), color);
    }
    else {
        // Generic Loot Box
        (0, grid_utils_1.fillBox)(grid, px(0.25), px(0.25), sw(0.5), sh(0.5), '#ffd700');
    }
    return grid;
};
exports.generateItemGrid = generateItemGrid;
const synthesizeItemBlueprint = (pixels, type) => {
    const gridSize = pixels.length; // Infer from input
    const grid = (0, grid_utils_1.createEmptyGrid)(gridSize);
    // Simple heuristic: If pixel exists, mark as type
    const zone = type === 'weapon' ? 'weapon' : 'accessory';
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (pixels[y][x] && pixels[y][x] !== 'transparent') {
                (0, grid_utils_1.markBox)(grid, x, y, 1, 1, zone);
            }
        }
    }
    return grid;
};
exports.synthesizeItemBlueprint = synthesizeItemBlueprint;
