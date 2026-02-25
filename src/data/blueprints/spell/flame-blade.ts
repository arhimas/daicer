import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'flame-blade',
  name: 'Flame Blade',
  level: 2,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Bonus Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'Leaf of sumac.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Concentration',
    value: 10,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 3,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Every 2 Slot Levels',
    dice_count: 1,
    dice_value: 6,
  },
  description:
    'You evoke a fiery blade in your free hand. The blade is similar in size and shape to a scimitar, and it lasts for the duration. If you let go of the blade, it disappears, but you can evoke the blade again as a bonus action. You can use your action to make a melee spell attack with the fiery blade. On a hit, the target takes 3d6 fire damage. The flaming blade sheds bright light in a 10-foot radius and dim light for an additional 10 feet. At Higher Levels: When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for every two slot levels above 2nd.',
  compilation_state: {
    status: 'Valid',
  },
});
