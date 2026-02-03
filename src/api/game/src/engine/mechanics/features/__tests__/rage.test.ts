import { describe, it, expect } from 'vitest';
import { Rage } from '@daicer/engine/mechanics/features/rage';
import { Entity, EntityAction } from '@/api/game/src/types'; // Adjust

describe('Rage Feature', () => {
  const ragingEntity: Entity = {
    conditions: [{ name: 'Rage' }],
  } as any;

  const normalEntity: Entity = {
    conditions: [],
  } as any;

  const meleeAction: EntityAction = { type: 'melee_weapon', name: 'Axe' } as any;
  const rangedAction: EntityAction = { type: 'ranged_weapon', name: 'Bow' } as any;

  it('should NOT apply if not raging', () => {
    expect(Rage.canApply(normalEntity, meleeAction, {} as any)).toBe(false);
  });

  it('should NOT apply if not melee', () => {
    expect(Rage.canApply(ragingEntity, rangedAction, {} as any)).toBe(false);
  });

  it('should apply if raging and melee', () => {
    expect(Rage.canApply(ragingEntity, meleeAction, {} as any)).toBe(true);
  });

  it('should provide +2 damage bonus', () => {
    const bonus = Rage.applyDamageBonus!(ragingEntity, {} as any);
    expect(bonus.amount).toBe(2);
    expect(bonus.type).toBe('force'); // Or logic based on weapon? Code says 'force' hardcoded
  });
});
