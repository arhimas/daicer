import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid',
  slug: 'humanoid',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid.png',
  zones: ["head","core","arms","legs","accessory"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#f54242": "arms",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        16,
        11
    ]
}
});
