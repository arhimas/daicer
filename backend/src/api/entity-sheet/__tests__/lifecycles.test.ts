import { describe, it, expect, vi, beforeEach } from 'vitest';
import entitySheetLifecycles from '../content-types/entity-sheet/lifecycles';

// Mock dependencies
const mockFindOne = vi.fn();
const mockFindFirst = vi.fn();

vi.stubGlobal('strapi', {
  documents: (uid: string) => ({
    findOne: mockFindOne,
    findFirst: mockFindFirst,
  }),
});

vi.mock('../../../../services/mechanics/action-generator', () => ({
  ActionGenerator: {
    generateWeaponAction: vi.fn(() => ({ name: 'Mock Attack', type: 'attack' })),
  },
}));

vi.mock('../../../../services/mechanics/feature-hydrator', () => ({
  FeatureHydrator: {
    hydrateFeatures: vi.fn((input) => [{ name: 'Hydrated Feature' }]),
  },
}));

describe('Entity Sheet Lifecycles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateInventorySlots', () => {
    const { beforeUpdate } = entitySheetLifecycles;

    it('should pass with valid inventory', () => {
      const event = {
        params: {
          data: {
            inventory: [
              { slot: 'main_hand', item: 'Sword' },
              { slot: 'off_hand', item: 'Shield' },
            ],
          },
        },
      };
      expect(async () => await beforeUpdate(event as any)).not.toThrow();
    });

    it('should throw error on duplicate slots', async () => {
      const event = {
        params: {
          data: {
            inventory: [
              { slot: 'main_hand', item: 'Sword' },
              { slot: 'main_hand', item: 'Dagger' },
            ],
          },
        },
      };

      await expect(beforeUpdate(event as any)).rejects.toThrow('more than one item equipped in the main_hand slot');
    });

    it('should ignore backpack items', async () => {
      const event = {
        params: {
          data: {
            inventory: [
              { slot: 'backpack', item: 'Potion' },
              { slot: 'backpack', item: 'Scroll' },
            ],
          },
        },
      };
      await expect(beforeUpdate(event as any)).resolves.not.toThrow();
    });
  });

  describe('updateDerivedData', () => {
    const { beforeUpdate } = entitySheetLifecycles;

    it('should hydrate features and actions on relevant update', async () => {
      const event = {
        params: {
          where: { documentId: 'doc-1' },
          data: { level: 2 }, // Trigger update
        },
      };

      // Mock current state
      mockFindOne.mockResolvedValue({
        documentId: 'doc-1',
        level: 1,
        stats: { strength: 16 },
        inventory: [{ item: 'Longsword', slot: 'main_hand', isEquipped: true }],
        class: { features: [{ name: 'Sneak Attack' }] },
        race: { features: [{ name: 'Darkvision' }] },
      });

      // Mock equipment lookup
      mockFindFirst.mockResolvedValue({
        name: 'Longsword',
        type: 'weapon',
        damageDice: '1d8',
      });

      await beforeUpdate(event as any);

      // Check mutation
      expect(event.params.data).toHaveProperty('features');
      expect(event.params.data).toHaveProperty('structuredActions');
      expect(event.params.data.structuredActions).toHaveLength(1);
      expect(event.params.data.structuredActions[0]).toEqual(expect.objectContaining({ name: 'Longsword' }));
    });

    it('should re-fetch class if class ID changed', async () => {
      const event = {
        params: {
          where: { documentId: 'doc-1' },
          data: { class: 'new-class-id' },
        },
      };

      mockFindOne
        .mockResolvedValueOnce({
          // Current state
          documentId: 'doc-1',
          class: { documentId: 'old-class-id' },
        })
        .mockResolvedValueOnce({
          // New Class
          documentId: 'new-class-id',
          features: [],
        });

      await beforeUpdate(event as any);

      // Expect specific call for new class
      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({ documentId: 'new-class-id', populate: ['features'] })
      );
    });
  });
});
