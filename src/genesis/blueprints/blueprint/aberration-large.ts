import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Aberration (Large)',
  slug: 'aberration-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/aberration-large.png',
  zones: ["core","eye","tentacles"],
  mapping: {
    "#f54242": "tentacles",
    "#CCFFCC": "core",
    "#f5a442": "eye"
},
  anchors: {
    "core": [
        32,
        36
    ],
    "eye": [
        32,
        36
    ],
    "tentacles": [
        32,
        36
    ]
}
});
