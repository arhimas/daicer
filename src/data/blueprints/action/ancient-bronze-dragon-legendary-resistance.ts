import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Legendary Resistance',
  description: 'If the dragon fails a saving throw, it can choose to succeed instead. (3/Day)',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'ancient-bronze-dragon-legendary-resistance',
});
