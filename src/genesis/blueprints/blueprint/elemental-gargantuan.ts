import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Elemental (Gargantuan)',
  slug: 'elemental-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/elemental-gargantuan.png',
  zones: ["core","particles"],
  mapping: {
    "#f54242": "particles",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        64,
        52
    ],
    "particles": [
        64,
        52
    ]
}
});
