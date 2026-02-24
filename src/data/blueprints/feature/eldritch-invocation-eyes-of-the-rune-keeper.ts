import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'eldritch-invocation-eyes-of-the-rune-keeper',
  name: 'Eldritch Invocation: Eyes of the Rune Keeper',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully parsed from 2014 SRD reference.',
  },
  description: 'You can read all writing.',
  level: 2,
  lore: 'The secrets of ancient scripts and forgotten tongues are laid bare before your gaze, granted by the eldritch influence of your patron.',
  tags: ['warlock'],
});
