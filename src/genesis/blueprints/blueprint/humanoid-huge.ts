import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Humanoid (Huge)',
  slug: 'humanoid-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/humanoid-huge.png',
  zones: ["head","core","legs","hand-l","hand-r"],
  mapping: {
    "#FFCCCC": "head",
    "#CCFFCC": "core",
    "#FFCCFF": "hand-l",
    "#CCFFFF": "hand-r",
    "#CCCCFF": "legs"
},
  anchors: {
    "head": [
        45,
        9
    ],
    "core": [
        45,
        36
    ],
    "legs": [
        45,
        72
    ],
    "hand-l": [
        18,
        33
    ],
    "hand-r": [
        75,
        33
    ]
}
});
