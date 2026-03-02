import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Beast',
  slug: 'beast',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/beast.png',
  zones: ["head","core","legs","tail","accessory"],
  mapping: {
    "#FFCCCC": "head",
    "#FFFFCC": "tail",
    "#CCFFCC": "core",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        14,
        11
    ]
}
});
