import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Elemental',
  slug: 'elemental',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/elemental.png',
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
