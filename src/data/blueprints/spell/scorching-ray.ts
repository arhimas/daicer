import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'scorching-ray',
  name: 'Scorching Ray',
  level: 2,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Ranged Spell Attack',
    save_effect: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [],
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    'You create three rays of fire and hurl them at targets within range. You can hurl them at one target or several.\n\nMake a ranged spell attack for each ray. On a hit, the target takes 2d6 fire damage.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, you create one additional ray for each slot level above 2nd.',
  compilation_state: {
    status: 'Valid',
    summary: 'Scorching Ray successfully mapped from reference data.',
  },
  tags: ['sorcerer', 'wizard', 'lore', 'fiend'],
});
