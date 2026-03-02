import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Aberration (Huge)',
  slug: 'aberration-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/aberration-huge.png',
  zones: ["core","eye","tentacles"],
  mapping: {
    "#f54242": "tentacles",
    "#CCFFCC": "core",
    "#f5a442": "eye"
},
  anchors: {
    "core": [
        48,
        54
    ],
    "eye": [
        48,
        54
    ],
    "tentacles": [
        48,
        54
    ]
}
});
