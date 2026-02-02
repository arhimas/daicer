"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const EntityGeometry_1 = require("../EntityGeometry");
(0, vitest_1.describe)('EntityGeometry Compression', () => {
    (0, vitest_1.it)('should compress a transparent row', () => {
        const row = Array(32).fill('transparent');
        const compressed = EntityGeometry_1.EntityGeometry.compressRow(row);
        // Expect format: ["32xT"]
        (0, vitest_1.expect)(compressed).toEqual(['32xT']);
    });
    (0, vitest_1.it)('should compress mixed content', () => {
        const row = ['red', 'red', 'transparent', 'transparent', 'blue'];
        const compressed = EntityGeometry_1.EntityGeometry.compressRow(row);
        // Expect: ["2xred", "2xT", "1xblue"]
        (0, vitest_1.expect)(compressed).toEqual(['2xred', '2xT', '1xblue']);
    });
    (0, vitest_1.it)('should decompress correctly', () => {
        const compressed = ['2xred', '3xT', '1xblue'];
        const decompressed = EntityGeometry_1.EntityGeometry.decompressRow(compressed);
        (0, vitest_1.expect)(decompressed).toEqual(['red', 'red', 'transparent', 'transparent', 'transparent', 'blue']);
    });
    (0, vitest_1.it)('should handle full grid compression', () => {
        const grid = [
            Array(32).fill('transparent'),
            Array(32).fill('black')
        ];
        const compressed = EntityGeometry_1.EntityGeometry.compressGrid(grid);
        (0, vitest_1.expect)(compressed).toEqual([
            ['32xT'],
            ['32xblack']
        ]);
        (0, vitest_1.expect)(EntityGeometry_1.EntityGeometry.decompressGrid(compressed)).toEqual(grid);
    });
});
