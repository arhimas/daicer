import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'hide-in-plain-sight',
  name: 'Hide in Plain Sight',
  compilation_state: {
    status: 'Valid',
    summary: 'Standard Ranger class feature from 5e SRD.',
  },
  description:
    'Starting at 10th level, you can spend 1 minute creating camouflage for yourself. You must have access to fresh mud, dirt, plants, soot, and other naturally occurring materials with which to create your camouflage. Once you are camouflaged in this way, you can try to hide by pressing yourself up against a solid surface, such as a tree or wall, that is at least as tall and wide as you are. You gain a +10 bonus to Dexterity (Stealth) checks as long as you remain there without moving or taking actions. Once you move or take an action or a reaction, you must camouflage yourself again to gain this benefit.',
  embedding: {},
  image: 'https://www.dndbeyond.com/attachments/thumbnails/0/0/ranger.png',
  level: 10,
  lore: 'The ranger blends into the environment, becoming part of the landscape itself through mastercraft camouflage.',
  tags: ['ranger', 'stealth', 'utility'],
});
