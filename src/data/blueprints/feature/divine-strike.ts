import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'divine-strike',
  name: 'Divine Strike',
  compilation_state: {
    status: 'Valid',
    hash: 'f8d7e6c5b4a3',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Feature successfully generated from reference data.',
  },
  description:
    'At 8th level, you gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage to the target. When you reach 14th level, the extra damage increases to 2d8.',
  embedding: {},
  image: '',
  level: 8,
  lore: "The cleric's faith manifests as a physical force, imbuing their martial prowess with the holy light of their deity.",
  tags: ['cleric', 'life-domain', 'combat'],
});
