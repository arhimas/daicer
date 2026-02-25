import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'contact-other-plane',
  name: 'Contact Other Plane',
  level: 5,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Intelligence Save',
    save_effect: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Psychic',
      dice_count: 6,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Special',
      description:
        "Insane until you finish a long rest. While insane, you can't take actions, can't understand what other creatures say, can't read, and speak only in gibberish.",
      chance: 100,
    },
  ],
  description:
    'You mentally contact a demigod, the spirit of a long-dead sage, or some other mysterious entity from another plane. Contacting this extraplanar intelligence can strain or even break your mind. When you cast this spell, make a DC 15 intelligence saving throw. On a failure, you take 6d6 psychic damage and are insane until you finish a long rest. While insane, you can\'t take actions, can\'t understand what other creatures say, can\'t read, and speak only in gibberish. A greater restoration spell cast on you ends this effect.\n\nOn a successful save, you can ask the entity up to five questions. You must ask your questions before the spell ends. The GM answers each question with one word, such as "yes," "no," "maybe," "never," "irrelevant," or "unclear" (if the entity doesn\'t know the answer to the question). If a one-word answer would be misleading, the GM might instead offer a short phrase as an answer.',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully parsed from reference data.',
  },
  tags: ['warlock', 'wizard'],
});
