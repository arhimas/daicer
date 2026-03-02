import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Antimagic Susceptibility',
  description:
    "The sword is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the sword must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Unconscious',
      description: null,
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'flying-sword-antimagic-susceptibility',
});
