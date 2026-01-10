import { describe, test, expect, vi } from 'vitest';
import entityAdapter from '../entity-adapter';

// Mock engine types
const mockEntityDeriver = {
  derive: vi.fn(() => ({
    hp: 10,
    maxHp: 10,
    ac: 10,
    speed: { walk: 30 },
    structuredActions: [],
  })),
};

vi.mock('../../../../engine', () => ({
  EntityDeriver: mockEntityDeriver,
}));

describe('Entity Adapter Resilience (Strict Mode)', () => {
  const adapter = entityAdapter();

  test('should adapt minimal entity sheet', () => {
    const sheet = {
      documentId: 'doc_1',
      name: 'Test Entity',
      type: 'monster',
      stats: { strength: 10 },
      maxHp: 10, // Explicitly set maxHp to avoid blueprint default variance
      inventory: [],
      actions: [],
    };

    const entity = adapter.adapt(sheet);

    expect(entity.id).toBe('doc_1');
    expect(entity.name).toBe('Test Entity');
    expect(entity.hp).toBe(10);
    expect(entity.maxHp).toBe(10);
    expect(entity.stats?.strength).toBe(10);
  });

  test('should handle missing stats gracefully', () => {
    const sheet = {
      documentId: 'doc_2',
      name: 'No Stats Entity',
      inventory: [],
      actions: [],
    };

    const entity = adapter.adapt(sheet);

    expect(entity.stats?.strength).toBe(10); // Default
    expect(entity.stats?.dexterity).toBe(10);
  });

  test('should handle partial HP data', () => {
    const sheet = {
      documentId: 'doc_3',
      name: 'HP Entity',
      currentHp: 15, // New field priority
      maxHp: 20,
    };

    const entity = adapter.adapt(sheet);
    expect(entity.hp).toBe(15);
    expect(entity.maxHp).toBe(20);
  });

  test('should NOT generate actions from inventory automatically (Strict Mode)', () => {
    const sheet = {
      documentId: 'doc_4',
      name: 'Inventory Entity',
      stats: { strength: 16, dexterity: 10 },
      inventory: [
        {
          id: 'comp_1',
          quantity: 1,
          isEquipped: true,
          item: {
            name: 'Longsword',
            documentId: 'item_1',
          },
        },
      ],
      actions: [], // Empty explicit actions
    };

    const entity = adapter.adapt(sheet);

    // Should NOT generate an attack action for Longsword automatically in strict mode
    const action = entity.actions?.find((a) => a.name === 'Longsword');
    expect(action).toBeUndefined();

    // Should have fallback Unarmed Strike
    const unarmed = entity.actions?.find((a) => a.name === 'Unarmed Strike');
    expect(unarmed).toBeDefined();
  });

  test('should ONLY use explicit actions', () => {
    const sheet = {
      documentId: 'doc_5',
      name: 'Action Entity',
      actions: [
        {
          documentId: 'act_1',
          name: 'Smash',
          type: 'melee_attack',
          toHit: 10,
          damage: [{ dice: '2d6', bonus: 4, type: 'bludgeoning' }],
        },
      ],
      inventory: [{ id: 'c1', item: { documentId: 'i1', name: 'Dagger' } }],
    };

    const entity = adapter.adapt(sheet);

    const smash = entity.actions?.find((a) => a.name === 'Smash');
    expect(smash).toBeDefined();
    expect(smash?.toHit).toBe(10);

    // Verify Dagger is NOT generated as action
    const dagger = entity.actions?.find((a) => a.name === 'Dagger');
    expect(dagger).toBeUndefined();
  });
});
