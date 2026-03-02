import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Elemental (Small)',
  slug: 'elemental-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/elemental-small.png',
  zones: ["core","particles"],
  mapping: {
    "#f54242": "particles",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        16,
        13
    ],
    "particles": [
        16,
        13
    ]
}
});
