import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Stunning Screech',
  description:
    "The vrock emits a horrific screech. Each creature within 20 feet of it that can hear it and that isn't a demon must succeed on a DC 14 Constitution saving throw or be stunned until the end of the vrock's next turn.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 20,
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
      condition: 'Stunned',
      description: null,
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'vrock-stunning-screech',
});
