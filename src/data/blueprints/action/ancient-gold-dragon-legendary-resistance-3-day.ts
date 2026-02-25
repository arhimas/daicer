import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Legendary Resistance (3/Day)',
  description: 'If the dragon fails a saving throw, it can choose to succeed instead.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'ancient-gold-dragon-legendary-resistance-3-day',
});
