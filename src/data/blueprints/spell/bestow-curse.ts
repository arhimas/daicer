import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'bestow-curse',
  name: 'Bestow Curse',
  level: 3,
  school: 'Necromancy',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Necrotic',
      dice_count: 1,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description:
        'The target is cursed. Depending on the curse chosen: disadvantage on ability checks and saving throws of one ability score; disadvantage on attack rolls against the caster; must fail a Wisdom save or waste its action; or takes extra necrotic damage.',
      chance: 100,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Duration',
    method: 'Per Slot Level',
  },
  description:
    "You touch a creature, and that creature must succeed on a wisdom saving throw or become cursed for the duration of the spell. When you cast this spell, choose the nature of the curse from the following options:\n- Choose one ability score. While cursed, the target has disadvantage on ability checks and saving throws made with that ability score.\n- While cursed, the target has disadvantage on attack rolls against you.\n- While cursed, the target must make a wisdom saving throw at the start of each of its turns. If it fails, it wastes its action that turn doing nothing.\n- While the target is cursed, your attacks and spells deal an extra 1d8 necrotic damage to the target.\nA remove curse spell ends this effect. At the GM's option, you may choose an alternative curse effect, but it should be no more powerful than those described above. The GM has final say on such a curse's effect.\n\nAt Higher Levels: If you cast this spell using a spell slot of 4th level or higher, the duration is concentration, up to 10 minutes. If you use a spell slot of 5th level or higher, the duration is 8 hours. If you use a spell slot of 7th level or higher, the duration is 24 hours. If you use a 9th level spell slot, the spell lasts until it is dispelled. Using a spell slot of 5th level or higher grants a duration that doesn't require concentration.",
  compilation_state: {
    status: 'Valid',
  },
});
