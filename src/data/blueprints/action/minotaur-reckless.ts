import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Reckless',
  description:
    'At the start of its turn, the minotaur can gain advantage on all melee weapon attack rolls it makes during that turn, but attack rolls against it have advantage until the start of its next turn.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'minotaur-reckless',
});
