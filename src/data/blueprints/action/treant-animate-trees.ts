import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Animate Trees',
  description:
    "The treant magically animates one or two trees it can see within 60 feet of it. These trees have the same statistics as a treant, except they have Intelligence and Charisma scores of 1, they can't speak, and they have only the Slam action option. An animated tree acts as an ally of the treant. The tree remains animate for 1 day or until it dies; until the treant dies or is more than 120 feet from the tree; or until the treant takes a bonus action to turn it back into an inanimate tree. The tree then takes root if possible.",
  type: 'spell',
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'treant-animate-trees',
});
