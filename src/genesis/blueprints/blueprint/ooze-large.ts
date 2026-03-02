import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Amorphous (Large)',
  slug: 'ooze-large',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/ooze-large.png',
  zones: ["core","details","gem"],
  mapping: {
    "#f5a442": "details",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        32,
        40
    ],
    "details": [
        32,
        48
    ],
    "gem": [
        32,
        32
    ]
}
});
