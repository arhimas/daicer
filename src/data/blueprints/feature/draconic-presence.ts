import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'draconic-presence',
  name: 'Draconic Presence',
  compilation_state: {
    status: 'Valid',
    summary: 'Feature successfully mapped from reference data.',
  },
  description:
    'Beginning at 18th level, you can channel the dread presence of your dragon ancestor, causing those around you to become awestruck or frightened. As an action, you can spend 5 sorcery points to draw on this power and exude an aura of awe or fear (your choice) to a distance of 60 feet. For 1 minute or until you lose your concentration (as if you were casting a concentration spell), each hostile creature that starts its turn in this aura must succeed on a Wisdom saving throw or be charmed (if you chose awe) or frightened (if you chose fear) until the aura ends. A creature that succeeds on this saving throw is immune to your aura for 24 hours.',
  embedding: {},
  image: '',
  level: 18,
  lore: 'The air thickens with the weight of ancient majesty as the sorcerer taps into their primal heritage, projecting the overwhelming charisma or terror of a true dragon.',
  tags: ['sorcerer', 'draconic-bloodline', 'class-feature'],
});
