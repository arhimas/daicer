import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Water Susceptibility',
  description:
    'For every 5 ft. the elemental moves in water, or for every gallon of water splashed on it, it takes 1 cold damage.',
  type: 'ability',
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Cold',
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 1,
      timing: 'One Time Trigger',
    },
  ],
  slug: 'fire-elemental-water-susceptibility',
});
