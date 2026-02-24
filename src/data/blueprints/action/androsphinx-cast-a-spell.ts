import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Cast a Spell',
  description: 'The sphinx casts a spell from its list of prepared spells, using a spell slot as normal.',
  type: 'spell',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'androsphinx-cast-a-spell',
});
