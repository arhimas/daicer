import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Blasphemous Word',
  description:
    "The mummy lord utters a blasphemous word. Each non-undead creature within 10 feet of the mummy lord that can hear the magical utterance must succeed on a DC 16 Constitution saving throw or be stunned until the end of the mummy lord's next turn.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 10,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'None',
  },
  save: {
    dc: 16,
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
  slug: 'mummy-lord-blasphemous-word',
});
