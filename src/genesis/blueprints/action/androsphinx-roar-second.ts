import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Roar (Second)',
  description:
    'The sphinx emits a magical roar. Each time it roars before finishing a long rest, the roar is louder and the effect is different. Second Roar: DC 18 Wisdom saving throw or deafened and frightened (and paralyzed) for 1 minute.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 18,
    attribute: 'wis',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Deafened',
      description: null,
      chance: 100,
      duration_rounds: 10,
    },
    {
      condition: 'Frightened',
      description: null,
      chance: 100,
      duration_rounds: 10,
    },
    {
      condition: 'Paralyzed',
      description: null,
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'androsphinx-roar-second',
});
