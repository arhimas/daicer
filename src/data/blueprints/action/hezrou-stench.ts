import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Stench',
  description:
    "Any creature that starts its turn within 10 feet of the hezrou must succeed on a DC 14 Constitution saving throw or be poisoned until the start of its next turn. On a successful saving throw, the creature is immune to the hezrou's stench for 24 hours.",
  type: 'utility',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: null,
    aoe_size: 10,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 14,
    attribute: 'con',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Poisoned',
      description: null,
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'hezrou-stench',
});
