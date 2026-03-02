import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Elemental (Large)',
  slug: 'elemental-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/elemental-large.png',
  zones: ["core","particles"],
  mapping: {
    "#f54242": "particles",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        32,
        26
    ],
    "particles": [
        32,
        26
    ]
}
});
