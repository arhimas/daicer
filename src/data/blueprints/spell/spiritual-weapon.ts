import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'spiritual-weapon',
  name: 'Spiritual Weapon',
  level: 2,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Bonus Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Melee Spell Attack',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Force',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Every 2 Slot Levels',
    dice_count: 1,
    dice_value: 8,
  },
  description:
    "You create a floating, spectral weapon within range that lasts for the duration or until you cast this spell again. When you cast the spell, you can make a melee spell attack against a creature within 5 feet of the weapon. On a hit, the target takes force damage equal to 1d8 + your spellcasting ability modifier.\n\nAs a bonus action on your turn, you can move the weapon up to 20 feet and repeat the attack against a creature within 5 feet of it.\n\nThe weapon can take whatever form you choose. Clerics of deities who are associated with a particular weapon (as St. Cuthbert is known for his mace and Thor for his hammer) make this spell's effect resemble that weapon.\n\n**At Higher Levels.** When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d8 for every two slot levels above the 2nd.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['cleric'],
});
