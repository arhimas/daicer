import { describe, it, expect, vi } from 'vitest';
import {
  serializeEntity,
  serializeItem,
  serializeTerrain,
} from '@/plugins/map-explorer/server/src/services/pixel-forge/serializers/index'; // Relative path check

// Mock dependencies
vi.mock('../../../utils/entity-geometry', () => ({
  getPixelDimensions: vi.fn((size) => (size === 'Large' ? 64 : 32)),
}));

describe('PixelForge Serializers', () => {
  it('should serialize entity with defaults', () => {
    const input = { documentId: 'ent-1', name: 'Orc', type: 'humanoid' };
    const res = serializeEntity(input);

    expect(res.kind).toBe('entity');
    expect(res.width).toBe(32);
    expect(res.archetype).toBe('Humanoid');
    expect(res.skinTone).toBeDefined();
  });

  it('should serialize entity with custom data', () => {
    const input = {
      documentId: 'ent-2',
      name: 'Dragon',
      size: 'Large',
      type: 'beast',
      appearance: { skin: '#00ff00' },
      equipment: [{ documentId: 'item-1', name: 'Claw' }],
    };
    const res = serializeEntity(input);

    expect(res.width).toBe(64);
    expect(res.archetype).toBe('Quadruped');
    expect(res.skinTone).toBe('#00ff00');
    expect(res.equipment).toHaveLength(1);
    expect(res.equipment[0].kind).toBe('item');
  });

  it('should serialize item', () => {
    const input = {
      documentId: 'item-1',
      name: 'Sword',
      type: 'weapon',
      rarity: 'rare',
      equipment_data: { properties: [{ slug: 'slash' }] },
    };
    const res = serializeItem(input);

    expect(res.kind).toBe('item');
    expect(res.rarity).toBe('rare');
    expect(res.subType).toBe('slash');
  });

  it('should serialize item with missing data', () => {
    const input = { documentId: 'item-2', name: 'Junk' };
    const res = serializeItem(input);
    expect(res.subType).toBe('generic');
    expect(res.rarity).toBe('common');
  });

  it('should serialize terrain defaults', () => {
    const input = { documentId: 't-1', name: 'Grass' };
    const res = serializeTerrain(input);

    expect(res.kind).toBe('terrain');
    expect(res.isWalkable).toBe(true);
    expect(res.isLiquid).toBe(false);
    expect(res.noiseConfig).toBeUndefined();
  });

  it('should serialize terrain with config', () => {
    const input = {
      documentId: 't-2',
      name: 'Water',
      isLiquid: true,
      isWalkable: false,
      texture: { width: 64, height: 64 },
      noise_config: { algorithm: 'perlin', scale: 20 },
    };
    const res = serializeTerrain(input);

    expect(res.isLiquid).toBe(true);
    expect(res.width).toBe(64);
    expect(res.noiseConfig).toBeDefined();
    expect(res.noiseConfig?.algorithm).toBe('perlin');
  });
});
