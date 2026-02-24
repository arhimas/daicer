import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Amphibious',
  description: 'The dragon can breathe air and water.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'black-dragon-wyrmling-amphibious',
});
