import { describe, it, expect } from 'vitest';
import { SneakAttack } from '../sneak-attack';
import { Entity, EntityAction } from '../../../../types'; // Adjust path
import { CombatContext } from '../../registry/FeatureRegistry';

describe('SneakAttack Feature', () => {
    const mockAttacker: Entity = { level: 3 } as any;
    const finesseAction: EntityAction = { type: 'melee_weapon', properties: ['finesse'], name: 'Dagger' } as any;
    const rangedAction: EntityAction = { type: 'ranged_weapon', name: 'Shortbow' } as any;
    const strengthAction: EntityAction = { type: 'melee_weapon', properties: [], name: 'Mace' } as any;

    it('should NOT apply if not finesse/ranged', () => {
        const ctx: CombatContext = { hasAdvantage: true, hasDisadvantage: false, isCritical: false };
        expect(SneakAttack.canApply(mockAttacker, strengthAction, ctx)).toBe(false);
    });

    it('should apply if advantage + finesse', () => {
        const ctx: CombatContext = { hasAdvantage: true, hasDisadvantage: false, isCritical: false };
        expect(SneakAttack.canApply(mockAttacker, finesseAction, ctx)).toBe(true);
    });

    it('should apply if ally adjacent + no disadvantage', () => {
        const ctx: CombatContext = { hasAdvantage: false, hasDisadvantage: false, allyAdjacent: true, isCritical: false };
        expect(SneakAttack.canApply(mockAttacker, rangedAction, ctx)).toBe(true);
    });

    it('should NOT apply if disadvantage', () => {
        const ctx: CombatContext = { hasAdvantage: true, hasDisadvantage: true, isCritical: false }; // Adv + Dis -> Normalize? 
        // Logic says "if (context.hasDisadvantage) return false".
        // In 5e, if you have both, they cancel out. The Context should reflect the *net* state?
        // Or pure flags?
        // SneakAttack.ts: "if (context.hasDisadvantage) return false;"
        // So strict check.
        expect(SneakAttack.canApply(mockAttacker, finesseAction, ctx)).toBe(false);
    });

    it('should scale damage with level', () => {
        // Level 3 -> ceil(3/2) = 2d6
        const bonus = SneakAttack.applyDamageBonus!(mockAttacker, {} as any);
        expect(bonus.dice).toBe('2d6');

        // Level 5 -> ceil(5/2) = 3d6
        const bonus5 = SneakAttack.applyDamageBonus!({ level: 5 } as any, {} as any);
        expect(bonus5.dice).toBe('3d6');
    });
});
