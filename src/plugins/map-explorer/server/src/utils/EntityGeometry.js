"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityGeometry = exports.EntitySpaceFeet = exports.PIXELS_PER_FOOT = exports.EntitySize = void 0;
var EntitySize;
(function (EntitySize) {
    EntitySize["Fine"] = "Fine";
    EntitySize["Diminutive"] = "Diminutive";
    EntitySize["Tiny"] = "Tiny";
    EntitySize["Small"] = "Small";
    EntitySize["Medium"] = "Medium";
    EntitySize["Large"] = "Large";
    EntitySize["Huge"] = "Huge";
    EntitySize["Gargantuan"] = "Gargantuan";
    EntitySize["Colossal"] = "Colossal";
})(EntitySize || (exports.EntitySize = EntitySize = {}));
// 32x32 pixels per 5ft square (Standard D&D / Pixel Art Scale)
// Means 1ft = 6.4 pixels. 
// Fine (0.5ft) -> 3.2px (round to 4 or 8)
// Tiny (2.5ft) -> 16px
// Small (5ft) -> 32px
// Medium (5ft) -> 32px
// Large (10ft) -> 64px
// Huge (15ft) -> 96px
// Gargantuan (20ft) -> 128px
// Colossal (30ft) -> 192px
exports.PIXELS_PER_FOOT = 6.4; // Was 32, which resulted in Medium=160px (too big for JSON)
exports.EntitySpaceFeet = {
    [EntitySize.Fine]: 0.5,
    [EntitySize.Diminutive]: 1,
    [EntitySize.Tiny]: 2.5,
    [EntitySize.Small]: 5,
    [EntitySize.Medium]: 5,
    [EntitySize.Large]: 10,
    [EntitySize.Huge]: 15,
    [EntitySize.Gargantuan]: 20,
    [EntitySize.Colossal]: 30, // 30+ actually
};
exports.EntityGeometry = {
    /**
     * Returns the pixel dimensions (width/height) for a given size category.
     * Assumes square aspect ratio for the base footprint.
     */
    getPixelDimensions(size) {
        const spaceFeet = exports.EntitySpaceFeet[size] || exports.EntitySpaceFeet[EntitySize.Medium];
        const pixels = Math.ceil(spaceFeet * exports.PIXELS_PER_FOOT);
        return { width: pixels, height: pixels };
    },
    /**
     * Returns the number of grid cells (1ft x 1ft) occupied by the entity.
     * Since cells are 1ft, this is purely spaceFeet^2 for area, or spaceFeet for linear dimension.
     */
    getGridOccupancy(size) {
        const spaceFeet = exports.EntitySpaceFeet[size] || exports.EntitySpaceFeet[EntitySize.Medium];
        return Math.ceil(spaceFeet);
    },
    /**
     * Helper to validate if a size string is a valid EntitySize
     */
    isValidSize(size) {
        return Object.values(EntitySize).includes(size);
    },
    /**
     * Run-Length Encoding (RLE) to minimize grid storage.
     * Format: "count" + "x" + "color".
     * Special Case: "transparent" -> "T".
     * Example: ["transparent", "transparent", "red"] -> ["2xT", "1xred"]
     */
    compressRow(row) {
        const compressed = [];
        if (!row || row.length === 0)
            return compressed;
        let currentColor = row[0];
        let count = 0;
        for (const color of row) {
            if (color === currentColor) {
                count++;
            }
            else {
                const code = currentColor === 'transparent' ? 'T' : currentColor;
                compressed.push(`${count}x${code}`);
                currentColor = color;
                count = 1;
            }
        }
        // Push last segment
        const code = currentColor === 'transparent' ? 'T' : currentColor;
        compressed.push(`${count}x${code}`);
        return compressed;
    },
    decompressRow(compressedRow) {
        const row = [];
        for (const segment of compressedRow) {
            const [countStr, ...colorParts] = segment.split('x');
            const count = parseInt(countStr, 10);
            let color = colorParts.join('x'); // Rejoin if color had 'x' (rare but safe)
            if (color === 'T')
                color = 'transparent';
            for (let i = 0; i < count; i++) {
                row.push(color);
            }
        }
        return row;
    },
    compressGrid(grid) {
        return grid.map(row => this.compressRow(row));
    },
    decompressGrid(grid) {
        return grid.map(row => this.decompressRow(row));
    }
};
