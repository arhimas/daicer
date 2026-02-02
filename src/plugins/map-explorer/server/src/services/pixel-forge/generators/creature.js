"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthesizeBlueprint = exports.composeLayers = exports.generateCreatureLayers = exports.generatePart = void 0;
const entity_geometry_1 = require("../../../utils/entity-geometry");
const grid_utils_1 = require("../grid-utils");
const generatePart = (type, config) => {
    const size = config.size || 'Medium';
    const gridSize = (0, entity_geometry_1.getPixelDimensions)(size);
    const grid = (0, grid_utils_1.createEmptyGrid)(gridSize);
    const color = config.skinTone || '#dcb097';
    // Full Frame Drawing
    const px = (p) => Math.floor(gridSize * p);
    const py = (p) => Math.floor(gridSize * p);
    const sw = (p) => Math.max(1, Math.floor(gridSize * p));
    const sh = (p) => Math.max(1, Math.floor(gridSize * p));
    const isSmall = ['halfling', 'gnome', 'goblin'].includes(config.race || '') || ['Tiny', 'Small', 'Fine', 'Diminutive'].includes(size);
    const isLarge = ['orc', 'dragonborn'].includes(config.race || '') || ['Large', 'Huge', 'Gargantuan', 'Colossal'].includes(size);
    let wModPct = 0;
    if (isSmall)
        wModPct = -0.05;
    if (isLarge)
        wModPct = 0.05;
    switch (type) {
        case 'head':
            (0, grid_utils_1.fillBox)(grid, px(0.35 - wModPct), py(0.05), sw(0.3 + (wModPct * 2)), sh(0.2), color);
            break;
        case 'torso':
            (0, grid_utils_1.fillBox)(grid, px(0.25 - wModPct), py(0.25), sw(0.5 + (wModPct * 2)), sh(0.4), color);
            break;
        case 'arm_left':
            (0, grid_utils_1.fillBox)(grid, px(0.1), py(0.25), sw(0.15), sh(0.35), color);
            break;
        case 'arm_right':
            (0, grid_utils_1.fillBox)(grid, px(0.75), py(0.25), sw(0.15), sh(0.35), color);
            break;
        case 'leg_left':
            (0, grid_utils_1.fillBox)(grid, px(0.3), py(0.65), sw(0.15), sh(0.35), color);
            break;
        case 'leg_right':
            (0, grid_utils_1.fillBox)(grid, px(0.55), py(0.65), sw(0.15), sh(0.35), color);
            break;
    }
    return grid;
};
exports.generatePart = generatePart;
const generateCreatureLayers = (config) => {
    const layers = [];
    // 1. Generate Anatomy Parts
    const torso = (0, exports.generatePart)('torso', config);
    const head = (0, exports.generatePart)('head', config);
    const lArm = (0, exports.generatePart)('arm_left', config);
    const rArm = (0, exports.generatePart)('arm_right', config);
    const lLeg = (0, exports.generatePart)('leg_left', config);
    const rLeg = (0, exports.generatePart)('leg_right', config);
    // 2. Add to Layers (Z-Ordered)
    layers.push({ name: 'leg_left', pixels: lLeg, zIndex: 0 });
    layers.push({ name: 'leg_right', pixels: rLeg, zIndex: 0 });
    layers.push({ name: 'torso', pixels: torso, zIndex: 1 });
    layers.push({ name: 'head', pixels: head, zIndex: 2 });
    layers.push({ name: 'arm_left', pixels: lArm, zIndex: 3 });
    layers.push({ name: 'arm_right', pixels: rArm, zIndex: 3 });
    return layers;
};
exports.generateCreatureLayers = generateCreatureLayers;
const composeLayers = (layers) => {
    if (layers.length === 0)
        return (0, grid_utils_1.createEmptyGrid)(32); // Default fallback
    // Assume all layers match the dimensions of the first layer (which came from Generate)
    const gridSize = layers[0].pixels.length;
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const finalGrid = (0, grid_utils_1.createEmptyGrid)(gridSize);
    for (const layer of sorted) {
        const layerSize = layer.pixels.length;
        for (let y = 0; y < Math.min(gridSize, layerSize); y++) {
            for (let x = 0; x < Math.min(gridSize, layerSize); x++) {
                const srcPixel = layer.pixels[y][x];
                if (srcPixel && srcPixel !== 'transparent') {
                    finalGrid[y][x] = srcPixel;
                }
            }
        }
    }
    return finalGrid;
};
exports.composeLayers = composeLayers;
const synthesizeBlueprint = (config) => {
    const size = config.size || 'Medium';
    const gridSize = (0, entity_geometry_1.getPixelDimensions)(size);
    const grid = (0, grid_utils_1.createEmptyGrid)(gridSize);
    const px = (p) => Math.floor(gridSize * p);
    const py = (p) => Math.floor(gridSize * p);
    const sw = (p) => Math.max(1, Math.floor(gridSize * p));
    const sh = (p) => Math.max(1, Math.floor(gridSize * p));
    // Mark zones roughly where we drew parts
    // Head
    (0, grid_utils_1.markBox)(grid, px(0.35), py(0.05), sw(0.3), sh(0.2), 'head');
    // Torso
    (0, grid_utils_1.markBox)(grid, px(0.25), py(0.25), sw(0.5), sh(0.4), 'core');
    // Hands
    (0, grid_utils_1.markBox)(grid, px(0.1), py(0.25), sw(0.15), sh(0.35), 'hand_l');
    (0, grid_utils_1.markBox)(grid, px(0.75), py(0.25), sw(0.15), sh(0.35), 'hand_r');
    // Legs
    (0, grid_utils_1.markBox)(grid, px(0.3), py(0.65), sw(0.15), sh(0.35), 'legs');
    (0, grid_utils_1.markBox)(grid, px(0.55), py(0.65), sw(0.15), sh(0.35), 'legs');
    return grid;
};
exports.synthesizeBlueprint = synthesizeBlueprint;
