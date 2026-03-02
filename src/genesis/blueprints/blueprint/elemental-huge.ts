import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Elemental (Huge)',
  slug: 'elemental-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/elemental-huge.png',
  zones: ["core","particles"],
  mapping: {
    "#f54242": "particles",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        48,
        39
    ],
    "particles": [
        48,
        39
    ]
}
});
