import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Cast a Spell',
  description: 'The sphinx casts a spell from its list of prepared spells, using a spell slot as normal.',
  type: 'spell',
  toHit: 8,
  mechanics_config: {
    action_type: 'None',
  },
  save: {
    dc: 16,
    attribute: 'int',
  },
  slug: 'gynosphinx-cast-a-spell',
});
