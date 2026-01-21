import { Entity, EntityAction } from '../../types';
import { CombatContext, FeatureHandler, FeatureRegistry } from '../registry/FeatureRegistry';

/**
 * Barbarian Rage Implementation.
 * Adds +2 damage to melee Strength attacks if raging.
 */
export const Rage: FeatureHandler = {
  name: 'Rage',

  canApply: (attacker: Entity, action: EntityAction, _context: CombatContext): boolean => {
    // 1. Must be Raging (Condition)
    const isRaging = attacker.conditions?.some((c) => c.name === 'Rage');

    // 2. Must be Melee Weapon Attack using Strength
    const isMelee = ['melee', 'melee_attack'].includes(action.type);

    return !!(isRaging && isMelee);
  },

  applyDamageBonus: (_attacker: Entity, _context: CombatContext) => {
    return {
      amount: 2,
      dice: '0',
      type: 'force',
    };
  },
};

FeatureRegistry.register(Rage);
