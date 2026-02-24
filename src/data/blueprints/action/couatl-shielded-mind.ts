import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Shielded Mind',
  description:
    'The couatl is immune to scrying and to any effect that would sense its emotions, read its thoughts, or detect its location.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'couatl-shielded-mind',
});
