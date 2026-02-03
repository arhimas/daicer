import { describe, it, expect } from 'vitest';
import { createValidationContext } from '@daicer/engine/derivation/types';

describe('Derivation Types', () => {
  describe('createValidationContext', () => {
    it('should return a valid default context', () => {
      const ctx = createValidationContext();

      expect(ctx.level).toBe(1);
      expect(ctx.stats.strength).toBe(10);
      expect(ctx.proficiencyBonus).toBe(2);
      expect(ctx.equipment).toEqual([]);
    });

    it('should have matching attributes and stats alias', () => {
      const ctx = createValidationContext();
      expect(ctx.attributes).toEqual(ctx.stats);
    });
  });
});
