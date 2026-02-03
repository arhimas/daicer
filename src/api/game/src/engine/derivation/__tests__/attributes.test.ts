import { describe, it, expect } from 'vitest';
import { calculateModifier } from '@daicer/engine/derivation/attributes';

describe('Attributes Logic', () => {
  it('should calculate modifiers correctly', () => {
    expect(calculateModifier(1)).toBe(-5);
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(11)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(20)).toBe(5);
    expect(calculateModifier(30)).toBe(10);
  });
});
