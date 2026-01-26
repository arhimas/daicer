
import { calculateModifier } from '../attributes';

describe('Attributes Derivation', () => {
    it('should calculate modifiers correctly', () => {
        expect(calculateModifier(10)).toBe(0);
        expect(calculateModifier(12)).toBe(1);
        expect(calculateModifier(13)).toBe(1);
        expect(calculateModifier(8)).toBe(-1);
        expect(calculateModifier(9)).toBe(-1);
        expect(calculateModifier(1)).toBe(-5);
        expect(calculateModifier(20)).toBe(5);
        expect(calculateModifier(30)).toBe(10);
    });
});
