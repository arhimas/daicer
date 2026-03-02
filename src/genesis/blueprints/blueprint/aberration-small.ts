import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Aberration (Small)',
  slug: 'aberration-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/aberration-small.png',
  zones: ["core","eye","tentacles"],
  mapping: {
    "#f54242": "tentacles",
    "#CCFFCC": "core",
    "#f5a442": "eye"
},
  anchors: {
    "core": [
        16,
        18
    ],
    "eye": [
        16,
        18
    ],
    "tentacles": [
        16,
        18
    ]
}
});
