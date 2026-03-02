import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Aberration (Gargantuan)',
  slug: 'aberration-gargantuan',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/aberration-gargantuan.png',
  zones: ["core","eye","tentacles"],
  mapping: {
    "#f54242": "tentacles",
    "#CCFFCC": "core",
    "#f5a442": "eye"
},
  anchors: {
    "core": [
        64,
        72
    ],
    "eye": [
        64,
        72
    ],
    "tentacles": [
        64,
        72
    ]
}
});
