import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'hurl-through-hell',
  name: 'Hurl Through Hell',
  compilation_state: {
    status: 'Valid',
    summary: 'Warlock Fiend subclass feature.',
  },
  description:
    "Starting at 14th level, when you hit a creature with an attack, you can use this feature to instantly transport the target through the lower planes. The creature disappears and hurtles through a nightmare landscape. At the end of your next turn, the target returns to the space it previously occupied, or the nearest unoccupied space. If the target is not a fiend, it takes 10d10 psychic damage as it reels from its horrific experience. Once you use this feature, you can't use it again until you finish a long rest.",
  embedding: {},
  image: '',
  level: 14,
  lore: 'The warlock briefly banishes a foe to the nightmare realms of the Lower Planes, inflicting psychic trauma through horrific visions.',
  tags: ['warlock', 'fiend', 'class-feature'],
});
