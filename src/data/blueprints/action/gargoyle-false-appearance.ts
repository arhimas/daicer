import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'False Appearance',
  description: 'While the gargoyle remains motion less, it is indistinguishable from an inanimate statue.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'gargoyle-false-appearance',
});
