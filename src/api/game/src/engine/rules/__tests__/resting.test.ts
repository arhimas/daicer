import { shortRest, longRest } from '../resting';
import { z } from 'zod';
import { EntitySheetSchema } from '../schemas/entity-sheet';

// Helper to create valid Zod-inferred sheet
type EntitySheet = z.infer<typeof EntitySheetSchema>;

const createSheet = (overrides: Partial<EntitySheet> = {}): EntitySheet =>
  ({
    hp: 10,
    maxHp: 20,
    attributes: { Constitution: 14 }, // +2 Mod
    hitDice: { current: 2, total: 3, die: '1d10' },
    resources: [
      { name: 'Ki Points', current: 0, max: 5, refresh: 'short-rest' },
      { name: 'Daily Power', current: 0, max: 1, refresh: 'long-rest' },
    ],
    features: [
      { name: 'Action Surge', usage: { current: 0, max: 1, per: 'short_rest' } },
      { name: 'Indomitable', usage: { current: 0, max: 1, per: 'long_rest' } },
    ],
    // ... minimal required fields ...
    stats: {},
    skills: {},
    saves: {},
    ...overrides,
  }) as unknown as EntitySheet;

describe('Resting Rules', () => {
  describe('Short Rest', () => {
    it('should heal using hit dice', () => {
      const sheet = createSheet({ hp: 5, maxHp: 20 });
      // Spend 1 die. 1d10 + 2 (Con). Range: 3-12.
      const result = shortRest(sheet, 1);

      expect(result.hitDiceSpent).toBe(1);
      expect(result.hpHealed).toBeGreaterThanOrEqual(3);
      expect(sheet.hp).toBeGreaterThan(5);
      expect(sheet.hitDice.current).toBe(1); // Started with 2
    });

    it('should cap healing at maxHp', () => {
      const sheet = createSheet({ hp: 19, maxHp: 20 });
      shortRest(sheet, 1);
      expect(sheet.hp).toBe(20);
    });

    it('should recover short-rest resources', () => {
      const sheet = createSheet();
      sheet.resources[0].current = 0; // Ki

      const result = shortRest(sheet, 0); // No healing

      expect(sheet.resources[0].current).toBe(5);
      expect(result.resourcesRecovered).toContain('Ki Points');
    });

    it('should NOT recover long-rest resources', () => {
      const sheet = createSheet();
      shortRest(sheet, 0);
      expect(sheet.resources[1].current).toBe(0); // Daily Power
    });

    it('should recover short-rest features', () => {
      const sheet = createSheet();
      shortRest(sheet, 0);
      expect(sheet.features[0].usage.current).toBe(1); // Action Surge
      expect(sheet.features[1].usage.current).toBe(0); // Indomitable (Long)
    });
  });

  describe('Long Rest', () => {
    it('should fully heal HP', () => {
      const sheet = createSheet({ hp: 1, maxHp: 50 });
      longRest(sheet);
      expect(sheet.hp).toBe(50);
    });

    it('should recover half max hit dice', () => {
      const sheet = createSheet({
        hitDice: { current: 0, total: 4, die: '1d8' },
      });
      // Recover floor(4/2) = 2.
      longRest(sheet);
      expect(sheet.hitDice.current).toBe(2);
    });

    it('should recover all resources (short and long)', () => {
      const sheet = createSheet();
      longRest(sheet);
      expect(sheet.resources[0].current).toBe(5); // Ki
      expect(sheet.resources[1].current).toBe(1); // Daily
      expect(sheet.features[0].usage.current).toBe(1); // Action Surge
      expect(sheet.features[1].usage.current).toBe(1); // Indomitable
    });
  });
});
