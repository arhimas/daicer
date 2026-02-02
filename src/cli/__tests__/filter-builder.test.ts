import { describe, it, expect } from 'vitest';
import { FilterBuilder } from '../utils/filter-builder';

// Access private method for testing logic without UI prompts
// We can cast to any or export the logic separately.
// For this test, let's treat toStrapiFilter as accessible or test via a public helper if we refactor.
// Actually, `toStrapiFilter` is private. I should make it public or export it as a standalone helper function.
// Let's modify the file first to export the logic or test the class if I can mock the prompts.

// Better: Let's refactor filter-builder to separate Logic from UI.
// But since I just wrote it, let's just use @ts-ignore to access private method for unit testing logic.

describe('FilterBuilder Logic', () => {
  const builder = new FilterBuilder();
  // @ts-expect-error - Accessing private method for testing
  const toStrapi = (node) => builder.toStrapiFilter(node);

  it('should build simple $eq filter', () => {
    const filter = toStrapi({ field: 'name', operator: '$eq', value: 'Gandalf' });
    expect(filter).toEqual({
      name: { $eq: 'Gandalf' },
    });
  });

  it('should build nested filter (dot notation)', () => {
    const filter = toStrapi({ field: 'stats.hp', operator: '$gt', value: 100 });
    expect(filter).toEqual({
      stats: {
        hp: { $gt: 100 },
      },
    });
  });

  it('should build deep nested filter', () => {
    const filter = toStrapi({ field: 'inventory.primary.weapon.damage', operator: '$lt', value: 50 });
    expect(filter).toEqual({
      inventory: {
        primary: {
          weapon: {
            damage: { $lt: 50 },
          },
        },
      },
    });
  });

  it('should handle boolean values', () => {
    const filter = toStrapi({ field: 'isDead', operator: '$eq', value: true });
    expect(filter).toEqual({
      isDead: { $eq: true },
    });
  });
});
