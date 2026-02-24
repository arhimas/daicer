import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'geas',
  name: 'Geas',
  level: 5,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
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
    distance: 60,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 30,
    unit: 'Days',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Psychic',
      dice_count: 5,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: [
    {
      condition: 'Charmed',
      description: 'The target is charmed for the duration and takes psychic damage if it acts against instructions.',
      chance: 100,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Duration',
    method: 'Per Slot Level',
  },
  description:
    "You place a magical command on a creature that you can see within range, forcing it to carry out some service or refrain from some action or course of activity as you decide. If the creature can understand you, it must succeed on a wisdom saving throw or become charmed by you for the duration. While the creature is charmed by you, it takes 5d10 psychic damage each time it acts in a manner directly counter to your instructions, but no more than once each day. A creature that can't understand you is unaffected by the spell. You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends. You can end the spell early by using an action to dismiss it. A remove curse, greater restoration, or wish spell also ends it. At Higher Levels: When you cast this spell using a spell slot of 7th or 8th level, the duration is 1 year. When you cast this spell using a spell slot of 9th level, the spell lasts until it is ended by one of the spells mentioned above.",
  compilation_state: {
    status: 'Valid',
    summary: 'Spell successfully converted from reference data.',
  },
  tags: ['bard', 'cleric', 'druid', 'paladin', 'wizard'],
});
