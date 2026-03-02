import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Legendary Resistance (3/Day)',
  description: 'If the dragon fails a saving throw, it can choose to succeed instead.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'adult-black-dragon-legendary-resistance-3-day',
});
