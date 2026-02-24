import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Two Heads',
  description:
    'The ettin has advantage on Wisdom (Perception) checks and on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'ettin-two-heads',
});
