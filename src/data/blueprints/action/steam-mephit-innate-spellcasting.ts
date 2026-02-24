import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Innate Spellcasting',
  description:
    'The mephit can innately cast blur, requiring no material components. Its innate spellcasting ability is Charisma.',
  type: 'utility',
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
      condition: 'Special',
      description: 'Can cast blur',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'steam-mephit-innate-spellcasting',
});
