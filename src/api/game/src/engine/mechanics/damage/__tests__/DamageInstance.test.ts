import { describe, it, expect } from 'vitest';
import { DamageInstance } from '../DamageInstance';
import { Entity } from '../../types'; // Adjust imports if needed based on relative path structure

// Assuming Entity is a type, we can mock it as a plain object
describe('DamageInstance', () => {
    const mockTarget: Entity = {
        name: 'Target',
        // Mocking only necessary fields
        immunities: [],
        resistances: [],
        vulnerabilities: [],
    } as unknown as Entity;

    it('should initialize correctly', () => {
        const dmg = new DamageInstance(10, 'fire', 'Spell');
        expect(dmg.amount).toBe(10);
        expect(dmg.type).toBe('fire');
        expect(dmg.isMagic).toBe(false);
    });

    it('should apply full damage to normal target', () => {
        const dmg = new DamageInstance(10, 'slashing');
        const result = dmg.resolveAgainst(mockTarget);
        expect(result.finalAmount).toBe(10);
        expect(result.logic).toHaveLength(0);
    });

    it('should be 0 against immunity', () => {
        const dmg = new DamageInstance(10, 'fire');
        const immuneTarget = { ...mockTarget, immunities: ['fire'] };
        const result = dmg.resolveAgainst(immuneTarget);
        expect(result.finalAmount).toBe(0);
        expect(result.logic[0]).toContain('Immune');
    });

    it('should be halved against resistance', () => {
        const dmg = new DamageInstance(10, 'cold');
        const resistantTarget = { ...mockTarget, resistances: ['cold'] };
        const result = dmg.resolveAgainst(resistantTarget);
        expect(result.finalAmount).toBe(5);
        expect(result.logic[0]).toContain('Resistant');
    });

    it('should be doubled against vulnerability', () => {
        const dmg = new DamageInstance(10, 'radiant');
        const vulnTarget = { ...mockTarget, vulnerabilities: ['radiant'] };
        const result = dmg.resolveAgainst(vulnTarget);
        expect(result.finalAmount).toBe(20);
        expect(result.logic[0]).toContain('Vulnerable');
    });

    it('should apply resistance then vulnerability (math check)', () => {
        // Logic check: Floor(10 / 2) * 2 = 10? Or standard order?
        // Code says: current = floor(current / 2) -> then current = floor(current * 2)
        // 10 / 2 = 5.   5 * 2 = 10.
        // 15 / 2 = 7.   7 * 2 = 14. (Lost precision floor test)

        const dmg = new DamageInstance(15, 'complex');
        const complexTarget = { ...mockTarget, resistances: ['complex'], vulnerabilities: ['complex'] };
        const result = dmg.resolveAgainst(complexTarget);
        
        expect(result.finalAmount).toBe(14); // 7.5 -> 7 -> 14
        expect(result.logic).toHaveLength(2);
    });
});
