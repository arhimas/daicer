import { describe, it, expect, vi, beforeEach } from 'vitest';
import spawnServiceFactory from '../spawn-service';

// Mock Dependencies
const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();

vi.stubGlobal('strapi', {
  documents: () => ({
    findOne: mockFindOne,
    findMany: mockFindMany,
    create: mockCreate,
  }),
});

vi.mock('../../../../engine', () => ({
  EntityDeriver: {
    derive: vi.fn((input) => ({
      hp: 10 + ((input.attributes.constitution ?? input.attributes.con) - 10), // Simple mock logic
      maxHp: 10 + ((input.attributes.constitution ?? input.attributes.con) - 10),
      speed: 30,
    })),
  },
}));

describe('Spawn Service Granularity', () => {
  const service = spawnServiceFactory({ strapi: (globalThis as unknown).strapi });

  beforeEach(() => {
    vi.clearAllMocks();
    mockFindOne.mockResolvedValue({ documentId: 'room-1' });
    mockFindMany.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ documentId: 'new-doc' });
  });

  const statVariations = [
    { str: 10, dex: 10, con: 10, expectedHp: 10 },
    { str: 18, dex: 14, con: 14, expectedHp: 14 },
    { str: 8, dex: 8, con: 8, expectedHp: 8 },
  ];

  it.each(statVariations)('should spawn character with stats %o', async (stats) => {
    mockFindOne.mockResolvedValueOnce({
      documentId: 'char-1',
      name: 'Hero',
      stats: { strength: stats.str, dexterity: stats.dex, constitution: stats.con },
      classes: [{ class: { hit_die: '1d8', documentId: 'cls-1' }, level: 1 }],
    });

    // 1. Room Lookup
    // 2. Collision Check
    mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1' }]).mockResolvedValueOnce([]); // Collision

    await service.spawnCharacter('room-1', 'char-1', { x: 0, y: 0, z: 0 });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          hp: stats.expectedHp,
        }),
      })
    );
  });

  const missingFields = [
    { field: 'classes', val: null },
    { field: 'race', val: null },
    { field: 'stats', val: null },
    { field: 'classes.0.class.hit_die', val: null },
  ];

  it.each(missingFields)('should handle missing %s gracefully', async (scenario) => {
    const charData: Record<string, unknown> = {
      documentId: 'char-1',
      name: 'Hero',
      stats: { strength: 10, constitution: 10 },
      classes: [{ class: { hit_die: '1d8', documentId: 'cls-1' }, level: 1 }],
    };

    if (scenario.field === 'classes') charData.classes = [];
    if (scenario.field === 'race') charData.race = null;
    if (scenario.field === 'stats') charData.stats = null;
    if (scenario.field === 'classes.0.class.hit_die')
      ((charData.classes as unknown as object[])[0] as { class: { hit_die: string | null } }).class.hit_die = null;

    mockFindOne.mockResolvedValueOnce(charData);

    mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1' }]).mockResolvedValueOnce([]); // Collision

    // It should not throw
    await expect(service.spawnCharacter('room-1', 'char-1', { x: 0, y: 0, z: 0 })).resolves.toBeDefined();
  });

  // Verify coordinate pass-through (simple extensive check)
  const coords = [
    { x: 0, y: 0, z: 0 },
    { x: 10, y: 10, z: 0 },
    { x: -5, y: -5, z: 1 },
    { x: 100, y: 100, z: 2 },
  ];

  it.each(coords)('should spawn at %o', async (pos) => {
    mockFindOne.mockResolvedValueOnce({ documentId: 'mon-1', name: 'M', hp: 5 });

    mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1' }]).mockResolvedValueOnce([]); // Collision

    await service.spawnMonster('room-1', 'mon-1', pos);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: pos }),
      })
    );
  });
});
