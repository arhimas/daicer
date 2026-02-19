import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSmartAnchor } from "../smart-anchors";
import { AssetStub } from "../types";

// Mock visual analysis
vi.mock('../visual-analysis', () => ({
  getVisualBounds: vi.fn(),
  getZoneCentroid: vi.fn(),
}));
import { getVisualBounds, getZoneCentroid } from "../visual-analysis";

describe('Smart Anchors Utils', () => {
    let mockAsset: AssetStub;

    beforeEach(() => {
        vi.clearAllMocks();
        mockAsset = {
            blueprint: [],
            pixelData: [
             [null, null, null],
             [null, '#fff', null], // Center pixel at 1,1
             [null, null, null]
            ]
        } as unknown as AssetStub;

        (getVisualBounds as any).mockReturnValue({
            minX: 0, maxX: 2,
            minY: 0, maxY: 2,
            cx: 1, cy: 1,
        });
    });

    it('should return center fallback if no visual bounds', () => {
        (getVisualBounds as any).mockReturnValue(null);
        mockAsset.pixelData = []; // empty
        
        const result = getSmartAnchor(mockAsset, 'body_center');
        expect(result.method).toBe('Empty Grid');
    });

    describe('primary_hand', () => {
        it('should use blueprint zone if available', () => {
            (getZoneCentroid as any).mockReturnValue({ x: 5, y: 5 });
            const result = getSmartAnchor(mockAsset, 'primary_hand');
            expect(result.point).toEqual({ x: 5, y: 5 });
            expect(result.method).toContain('Blueprint');
            expect(getZoneCentroid).toHaveBeenCalledWith(expect.anything(), 'hand_r');
        });

        it('should use visual extremity fallback', () => {
            (getZoneCentroid as any).mockReturnValue(null);
            // Setup pixel data for right extremity scan
            // 3x3 grid. Rightmost is x=2.
            mockAsset.pixelData = [
                [null, null, '#fff'], // x=2 active
                [null, null, null],
                [null, null, '#fff']  // x=2 active
            ];
            // Visual bounds mock needs to match
            (getVisualBounds as any).mockReturnValue({ maxX: 2, cy: 1 });

            const result = getSmartAnchor(mockAsset, 'primary_hand');
            
            // Expected: x = maxX - 1 = 1
            // y = average of active pixels at x=2. y=0 and y=2. Avg = 1.
            expect(result.point).toEqual({ x: 1, y: 1 });
            expect(result.method).toContain('Extremity');
        });
    });
    
    describe('off_hand', () => {
         it('should use blueprint zone', () => {
            (getZoneCentroid as any).mockReturnValue({ x: 2, y: 2 });
            const result = getSmartAnchor(mockAsset, 'off_hand');
            expect(result.point).toEqual({ x: 2, y: 2 });
            expect(getZoneCentroid).toHaveBeenCalledWith(expect.anything(), 'hand_l');
        });
        
        it('should fallback to visual left', () => {
             (getZoneCentroid as any).mockReturnValue(null);
             (getVisualBounds as any).mockReturnValue({ minX: 0, cy: 1 });
             
             const result = getSmartAnchor(mockAsset, 'off_hand');
             expect(result.point).toEqual({ x: 1, y: 1 }); // minX + 1
             expect(result.method).toContain('Visual Extremity');
        });
    });

    describe('head_top', () => {
        it('should use blueprint head min Y', () => {
             (getZoneCentroid as any).mockReturnValue({ x: 1, minY: 0 });
             const result = getSmartAnchor(mockAsset, 'head_top');
             expect(result.point).toEqual({ x: 1, y: 0 });
        });
        
        it('should fallback to visual top', () => {
             (getZoneCentroid as any).mockReturnValue(null);
             (getVisualBounds as any).mockReturnValue({ cx: 1, minY: 0 });
             const result = getSmartAnchor(mockAsset, 'head_top');
             expect(result.point).toEqual({ x: 1, y: 0 });
        });
    });

     describe('feet_bottom', () => {
        it('should use blueprint legs max Y', () => {
             (getZoneCentroid as any).mockReturnValue({ x: 1, maxY: 10 });
             const result = getSmartAnchor(mockAsset, 'feet_bottom');
             expect(result.point).toEqual({ x: 1, y: 10 });
        });
    });
    
    describe('item_grip', () => {
          it('should prioritize core', () => {
              (getZoneCentroid as any).mockImplementation((_, zone) => {
                  if (zone === 'core') return { x: 5, y: 5 };
                  return null;
              });
              const result = getSmartAnchor(mockAsset, 'item_grip');
              expect(result.point).toEqual({ x: 5, y: 5 });
          });

          it('should fallback to weapon zone', () => {
               (getZoneCentroid as any).mockImplementation((_, zone) => {
                  if (zone === 'weapon') return { x: 6, y: 6 };
                  return null;
              });
              const result = getSmartAnchor(mockAsset, 'item_grip');
              expect(result.point).toEqual({ x: 6, y: 6 });
          });
          
          it('should fallback to visual center', () => {
               (getZoneCentroid as any).mockReturnValue(null);
               const result = getSmartAnchor(mockAsset, 'item_grip');
               expect(result.method).toBe('Visual Center');
          });
    });
});
