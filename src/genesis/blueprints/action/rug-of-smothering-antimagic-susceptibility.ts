import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Antimagic Susceptibility',
  description:
    "The rug is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the rug must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute.",
  type: 'ability',
  mechanics_config: {
    action_type: 'Constitution Save',
  },
  condition_instances: [
    {
      condition: 'Incapacitated',
      description: 'While in the area of an antimagic field',
      chance: 100,
    },
    {
      condition: 'Unconscious',
      description: 'On failed save against dispel magic',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  slug: 'rug-of-smothering-antimagic-susceptibility',
});
