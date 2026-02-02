"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markBox = exports.fillBox = exports.createEmptyGrid = void 0;
const createEmptyGrid = (size = 32) => {
    return Array(size).fill(null).map(() => Array(size).fill(null));
};
exports.createEmptyGrid = createEmptyGrid;
const fillBox = (grid, x, y, w, h, color) => {
    const gridSize = grid.length;
    for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
            if (iy >= 0 && iy < gridSize && ix >= 0 && ix < gridSize) {
                grid[iy][ix] = color;
            }
        }
    }
};
exports.fillBox = fillBox;
const markBox = (grid, x, y, w, h, type) => {
    const gridSize = grid.length;
    for (let iy = y; iy < y + h; iy++) {
        for (let ix = x; ix < x + w; ix++) {
            if (iy >= 0 && iy < gridSize && ix >= 0 && ix < gridSize) {
                grid[iy][ix] = type;
            }
        }
    }
};
exports.markBox = markBox;
