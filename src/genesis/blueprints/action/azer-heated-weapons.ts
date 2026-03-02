import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Heated Weapons',
  description:
    'When the azer hits with a metal melee weapon, it deals an extra 3 (1d6) fire damage (included in the attack).',
  type: 'ability',
  slug: 'azer-heated-weapons',
});
