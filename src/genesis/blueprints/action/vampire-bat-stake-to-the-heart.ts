import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Stake to the Heart',
  description:
    "If a piercing weapon made of wood is driven into the vampire's heart while the vampire is incapacitated in its resting place, the vampire is paralyzed until the stake is removed.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Paralyzed',
      description: 'until the stake is removed',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'vampire-bat-stake-to-the-heart',
});
