import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'dimension-door',
  name: 'Dimension Door',
  level: 4,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 500,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Force',
      dice_count: 4,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  description:
    'You teleport yourself from your current location to any other spot within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as "200 feet straight downward" or "upward to the northwest at a 45-degree angle, 300 feet."\n\nYou can bring along objects as long as their weight doesn\'t exceed what you can carry. You can also bring one willing creature of your size or smaller who is carrying gear up to its carrying capacity. The creature must be within 5 feet of you when you cast this spell.\n\nIf you would arrive in a place already occupied by an object or a creature, you and any creature traveling with you each take 4d6 force damage, and the spell fails to teleport you.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['bard', 'sorcerer', 'warlock', 'wizard'],
});
