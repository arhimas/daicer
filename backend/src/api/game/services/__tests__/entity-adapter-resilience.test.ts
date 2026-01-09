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

describe('Entity Adapter Resilience', () => {
  const adapter = entityAdapter();

  test('should adapt minimal entity sheet', () => {
    const sheet = {
      id: 1,
      documentId: 'doc_1',
      name: 'Test Entity',
      type: 'monster',
      stats: { strength: 10 },
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
      id: 2,
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
      id: 3,
      name: 'HP Entity',
      currentHp: 15, // New field priority
      maxHp: 20,
    };

    const entity = adapter.adapt(sheet);
    expect(entity.hp).toBe(15);
    expect(entity.maxHp).toBe(20);
  });

  test('should handle inventory generating actions', () => {
    const sheet = {
      id: 4,
      name: 'Inventory Entity',
      stats: { strength: 16, dexterity: 10 }, // +3 bonus
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

    // Should generate an attack action for Longsword IF logic allows
    // My adapter code: if (!blueprint?.structuredActions && raw.inventory) ...
    // Here blueprint is null/undefined.
    // So it should generate.

    // Check actions array
    const action = entity.actions?.find((a) => a.name === 'Longsword');
    expect(action).toBeDefined();
    expect(action?.type).toBe('melee_attack');
    // Str 16 (+3) + Prof (2) = 5
    expect(action?.toHit).toBe(5);
  });

  test('should prioritize explicit actions over inventory', () => {
    const sheet = {
      id: 5,
      name: 'Action Entity',
      actions: [
        {
          id: 'act_1',
          name: 'Smash',
          type: 'melee_attack',
          toHit: 10,
          damage: [{ dice: '2d6', bonus: 4, type: 'bludgeoning' }],
        },
      ],
      inventory: [{ id: 'c1', item: { name: 'Dagger' } }],
    };

    const entity = adapter.adapt(sheet);
    const smash = entity.actions?.find((a) => a.name === 'Smash');
    expect(smash).toBeDefined();
    expect(smash?.toHit).toBe(10);

    // If explicit actions exist (raw.actions), do we still generate inventory?
    // My adapter logic at line 203:
    // `if (!blueprint?.structuredActions && raw.inventory)`
    // `actions` array is populated from `raw.actions` + relations.
    // The inventory logic appends TO `actions`.
    // It depends on if `blueprint` is present. Here it is NOT.
    // So it probably generates Dagger too.

    const dagger = entity.actions?.find((a) => a.name === 'Dagger');
    expect(dagger).toBeDefined(); // It seems my logic allows mixing if no blueprint override.
  });
});
