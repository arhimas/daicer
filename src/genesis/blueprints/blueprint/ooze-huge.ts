import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Amorphous (Huge)',
  slug: 'ooze-huge',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/ooze-huge.png',
  zones: ["core","details","gem"],
  mapping: {
    "#f5a442": "details",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        48,
        60
    ],
    "details": [
        48,
        72
    ],
    "gem": [
        48,
        48
    ]
}
});
