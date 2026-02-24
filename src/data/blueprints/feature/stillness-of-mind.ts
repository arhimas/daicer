import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'stillness-of-mind',
  name: 'Stillness of Mind',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'Starting at 7th level, you can use your action to end one effect on yourself that is causing you to be charmed or frightened.',
  level: 7,
  tags: ['monk'],
});
