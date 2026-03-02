import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Rampage',
  description:
    'When the gnoll reduces a creature to 0 hit points with a melee attack on its turn, the gnoll can take a bonus action to move up to half its speed and make a bite attack.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'gnoll-rampage',
});
