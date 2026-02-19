
import { describe, it, expect, vi } from 'vitest';
import { compositeLoadout } from '../layer-blending';
import { AssetStub } from '../types';
import { getSmartAnchor } from '../smart-anchors';

// Mock dependencies
vi.mock('../smart-anchors', () => ({
  getSmartAnchor: vi.fn(() => ({ point: {x: 0, y: 0}, method: 'mock' }))
}));

vi.mock('../../pixel-math', () => ({
  blendPixels: vi.fn((bg, fg) => fg === 'transparent' ? bg : fg)
}));

describe('Layer Blending', () => {
  const baseAsset: AssetStub = {
    id: 'base',
    archetype: 'Humanoid',
    pixelData: [
        ['#000', '#000'],
        ['#000', '#000']
    ]
  } as any;

  it('should composite simple loadout', () => {
    const item: AssetStub = {
        id: 'item',
        archetype: 'Headwear',
        pixelData: [
            ['#fff']
        ]
    } as any;
    
    const res = compositeLoadout(baseAsset, [item]);
    expect(res.grid[0][0]).toBe('#fff');
    expect(res.status).toContain('Headwear');
  });

  it('should sort z-index correctly', () => {
    const legs: AssetStub = { id: 'l', archetype: 'Legwear', pixelData: [['#111']] } as any;
    const armor: AssetStub = { id: 'a', archetype: 'Body Armor', pixelData: [['#222']] } as any;
    
    const res = compositeLoadout(baseAsset, [armor, legs]);
    expect(res.grid[0][0]).toBe('#222');
  });

   it('should handle offsets', () => {
        vi.mocked(getSmartAnchor).mockImplementation((asset, type) => {
            if (type === 'head_top') return { point: {x: 1, y: 1}, method: 'mock' };
            if (type === 'head_bottom') return { point: {x: 0, y: 0}, method: 'mock' };
            return { point: {x: 0, y: 0}, method: 'mock' };
        });

        const item: AssetStub = {
            id: 'item-off',
            archetype: 'Headwear',
            pixelData: [['#f00']]
        } as any;

        const res = compositeLoadout(baseAsset, [item]);
        
        expect(res.grid[1][1]).toBe('#f00');
        expect(res.grid[0][0]).toBe('#000');
   });
});
