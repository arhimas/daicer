import { describe, it, expect } from 'vitest';
import { hasCondition, getConditionModifiers, ConditionType } from '../conditions';

describe('Condition Rules', () => {

    describe('hasCondition', () => {
        const bearer = {
            conditions: [
                { name: 'Prone' },
                { name: 'Poisoned' }
            ]
        };

        it('should return true for existing condition', () => {
            expect(hasCondition(bearer, ConditionType.Prone)).toBe(true);
            expect(hasCondition(bearer, 'poisoned')).toBe(true);
        });

        it('should return false for missing condition', () => {
            expect(hasCondition(bearer, ConditionType.Blinded)).toBe(false);
        });

        it('should return false if no conditions present', () => {
            expect(hasCondition({}, 'Prone')).toBe(false);
        });
    });

    describe('getConditionModifiers', () => {
        it('should aggregate modifiers from multiple conditions', () => {
             // Blinded: Disadv Attack, Grant Adv
             // Prone: Disadv Attack (generic flag set in registry?), No Grant Adv in generic registry for prone to avoid range conflict.
             
             const bearer = {
                 conditions: [
                     { name: 'Blinded' },
                     // Add Invisible: Adv Attack, Grant Disadv
                     { name: 'Invisible' }
                 ]
             };
             
             const mods = getConditionModifiers(bearer);
             
             // Conflicting flags should both be present, resolution logic handles cancellation
             expect(mods.hasDisadvantageOnAttack).toBe(true); // From Blinded
             expect(mods.hasAdvantageOnAttack).toBe(true); // From Invisible
             
             expect(mods.grantAdvantageToAttacker).toBe(true); // From Blinded
             expect(mods.grantDisadvantageToAttacker).toBe(true); // From Invisible
        });

        it('should handle speed zero conditions', () => {
            const bearer = { conditions: [{ name: 'Grappled' }] };
            const mods = getConditionModifiers(bearer);
            expect(mods.speedZero).toBe(true);
        });

        it('should be case insensitive', () => {
            const bearer = { conditions: [{ name: 'paralyzed' }] }; // lowercase
            const mods = getConditionModifiers(bearer);
            expect(mods.autoCritReceived).toBe(true);
        });
    });
});
