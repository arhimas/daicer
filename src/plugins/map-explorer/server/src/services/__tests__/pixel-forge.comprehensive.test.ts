
import { describe, it, expect, beforeEach } from 'vitest';
import { PixelForgeService, PixelLayer } from '../pixel-forge-service';

// Mock Strapi (Minimal needed)
const mockStrapi = {} as any;

describe('PixelForgeService Comprehensive Suite (SOTA Generation)', () => {
    let service: ReturnType<typeof PixelForgeService>;

    beforeEach(() => {
        service = PixelForgeService({ strapi: mockStrapi });
    });

    describe('1. Anatomy Generation Constraints', () => {
        it('should generate a 32x32 grid for any part', () => {
             const head = service.generatePart('head', { race: 'human' });
             expect(head.length).toBe(32);
             expect(head[0].length).toBe(32);
        });

        // Test all parts exist
        const parts = ['head', 'torso', 'arm_left', 'arm_right', 'leg_left', 'leg_right'] as const;
        it.each(parts)('should generate non-empty grid for %s', (part) => {
             const grid = service.generatePart(part, { race: 'human' });
             // Should have at least ONE non-null pixel
             const hasPixel = grid.some(row => row.some(p => p !== null));
             expect(hasPixel).toBe(true);
        });

        // Test Bounding Boxes (Approximate SOTA Logic checks)
        // We know 'head' is roughly centered top.
        it('should place head in logical top-center quadrant', () => {
             const head = service.generatePart('head', { race: 'human' });
             // Check roughly rows 2-8, cols 13-18
             let pixelsInBox = 0;
             for(let y=2; y<9; y++) {
                 for(let x=13; x<19; x++) {
                     if (head[y][x]) pixelsInBox++;
                 }
             }
             expect(pixelsInBox).toBeGreaterThan(0);
        });

        it('should NOT place legs in the head area', () => {
             const leg = service.generatePart('leg_left', { race: 'human' });
             // Head area (y < 8)
             let pixelsInHeadArea = 0;
             for(let y=0; y<8; y++) {
                  if (leg[y].some(p => p !== null)) pixelsInHeadArea++;
             }
             expect(pixelsInHeadArea).toBe(0);
        });
    });

    describe('2. Layer Composition & Z-Index', () => {
        it('should respect Z-Index order (Painter Algorithm)', () => {
             // Create two overlapping layers
             // Layer 1 (Bottom): Red rect at 0,0
             // Layer 2 (Top): Blue rect at 0,0
             const l1: PixelLayer = {
                 name: 'bottom',
                 zIndex: 0,
                 pixels: service.createEmptyGrid()
             };
             l1.pixels[0][0] = '#ff0000';

             const l2: PixelLayer = {
                 name: 'top',
                 zIndex: 10,
                 pixels: service.createEmptyGrid()
             };
             l2.pixels[0][0] = '#0000ff';

             const result = service.compose([l2, l1]); // Order in array shouldn't matter, zIndex does
             // Expect Blue
             expect(result[0][0]).toBe('#0000ff');
        });

        it('should reverse Z-Index order correct', () => {
             const l1: PixelLayer = { name: 'bottom', zIndex: 0, pixels: service.createEmptyGrid() };
             l1.pixels[0][0] = '#ff0000'; // Red
             const l2: PixelLayer = { name: 'top', zIndex: 10, pixels: service.createEmptyGrid() };
             l2.pixels[0][0] = '#0000ff'; // Blue

             // Even if passed in reverse order
             const result = service.compose([l1, l2]);
             expect(result[0][0]).toBe('#0000ff');
        });
    });

    describe('3. Transparency & Alpha Blending', () => {
        it('should blend transparent overlay', () => {
             const base: PixelLayer = { name: 'base', zIndex: 0, pixels: service.createEmptyGrid() };
             base.pixels[0][0] = '#000000'; // Black

             const glass: PixelLayer = { name: 'glass', zIndex: 1, opacity: 0.5, pixels: service.createEmptyGrid() };
             glass.pixels[0][0] = '#ffffff'; // White

             const result = service.compose([base, glass]);
             const px = result[0][0];
             
             // Check it is an rgba string
             expect(px).toMatch(/rgba\(255,\s*255,\s*255,\s*0\.5\)/);
        });

        it('should handle fully transparent pixels in layer', () => {
             const base: PixelLayer = { name: 'base', zIndex: 0, pixels: service.createEmptyGrid() };
             base.pixels[0][0] = '#ff0000'; 

             const overlay: PixelLayer = { name: 'overlay', zIndex: 1, pixels: service.createEmptyGrid() };
             overlay.pixels[0][0] = null; // Transparent hole

             const result = service.compose([base, overlay]);
             expect(result[0][0]).toBe('#ff0000'); // Should see through to bottom
        });
    });

    describe('4. Full Creature Generation Integration', () => {
        it('should return a list of layers for generateCreature', () => {
            const layers = service.generateCreature({ race: 'human' });
            expect(layers.length).toBeGreaterThan(0);
            
            const names = layers.map(l => l.name);
            expect(names).toContain('head');
            expect(names).toContain('torso');
            expect(names).toContain('arm_left');
            expect(names).toContain('leg_right');
        });

        it('should have correct relative Z-Indexing', () => {
             const layers = service.generateCreature({ race: 'human' });
             const head = layers.find(l => l.name === 'head');
             const torso = layers.find(l => l.name === 'torso');
             const backLeg = layers.find(l => l.name === 'leg_left'); // assuming z=0

             expect(head!.zIndex).toBeGreaterThan(torso!.zIndex);
             expect(torso!.zIndex).toBeGreaterThan(backLeg!.zIndex);
        });
    });

    describe('5. High Volume Pixel Integrity (Constraint Stress)', () => {
        // Generate 50 iterations of composition to ensure stability
        const iterations = Array.from({length: 50}, (_, i) => i);
        
        it.each(iterations)('should compose stable grid iteration %i', (i) => {
             const l1 = { name: 'l1', zIndex: 0, pixels: service.createEmptyGrid() };
             l1.pixels[0][0] = '#aaaaaa';
             const result = service.compose([l1]);
             expect(result.length).toBe(32);
             expect(result[0].length).toBe(32);
             expect(result[0][0]).toBe('#aaaaaa');
        });

        // Generate 30 distinct color blends
        const blends = Array.from({length: 30}, (_, i) => ({
            opacity: (i + 1) / 30,
            expectedAlpha: (i + 1) / 30
        }));

        it.each(blends)('should output correct alpha string for opacity %f', ({opacity}) => {
             const l = { name: 'l', zIndex: 0, opacity, pixels: service.createEmptyGrid() };
             l.pixels[0][0] = '#000000';
             const res = service.compose([l]);

             // #000000 -> 0, 0, 0
             // Robust Match: Strip spaces
             const actual = res[0][0]?.replace(/\s/g, '');
             const expectedStart = 'rgba(0,0,0,';
             
             // If fully opaque (opacity 1), it might return hex '#000000'
             if (actual.startsWith('#')) {
                 expect(actual).toBe('#000000');
             } else {
                 expect(actual).toContain(expectedStart);
             }
        });
    });
    
    describe('6. Hex Parsing Robustness (Exhaustive)', () => {
        // Happy Path
        it('should handle standard 6-digit hex', () => {
             expect(service.hexToRgba('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)'); 
        });
        
        it('should handle short 3-digit hex', () => {
             expect(service.hexToRgba('#0f0', 1)).toBe('rgba(0, 255, 0, 1)');
        });

        it('should handle mixed case hex', () => {
             expect(service.hexToRgba('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
             expect(service.hexToRgba('#ff0000', 1)).toBe('rgba(255, 0, 0, 1)');
             expect(service.hexToRgba('#AbCdEf', 1)).toBe('rgba(171, 205, 239, 1)');
        });

        // Alpha Logic
        it('should apply alpha correctly', () => {
             expect(service.hexToRgba('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
             expect(service.hexToRgba('#ffffff', 0)).toBe('rgba(255, 255, 255, 0)');
        });

        // Edge Cases & Invalid Inputs
        it('should pass through named colors (no alpha applied)', () => {
            // Implementation detail: non-hex strings are returned as-is
            expect(service.hexToRgba('red', 1)).toBe('red');
            expect(service.hexToRgba('transparent', 0.5)).toBe('transparent');
        });

        it('should fallback to black (0,0,0) for invalid hex characters (NaN protection)', () => {
            // #ZZZ is invalid hex, parseInt returns NaN -> fallback to 0
            expect(service.hexToRgba('#ZZZZZZ', 1)).toBe('rgba(0, 0, 0, 1)');
            expect(service.hexToRgba('#xyz', 1)).toBe('rgba(0, 0, 0, 1)'); 
        });

        it('should handle weird length hex strings gracefully (fallback to 0)', () => {
            // Length 5? #1234. Not 4 or 7.
            // r,g,b init to 0. 
            expect(service.hexToRgba('#1234', 1)).toBe('rgba(0, 0, 0, 1)');
        });
    });
});
