import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'light',
  description:
    'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light is yellow-white and resembles sunlight. If you target an object held or worn by a hostile creature, that creature must succeed on a Dexterity saving throw to avoid the spell. This spell has no effect on an object that is already magically lit.',
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Object sheds bright light in a 20-foot radius and dim light for an additional 20 feet.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'mage-light',
});
