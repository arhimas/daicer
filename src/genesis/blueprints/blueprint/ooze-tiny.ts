import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Amorphous (Tiny)',
  slug: 'ooze-tiny',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/ooze-tiny.png',
  zones: ["core","details","gem"],
  mapping: {
    "#f5a442": "details",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        16,
        16
    ],
    "details": [
        16,
        20
    ],
    "gem": [
        16,
        12
    ]
}
});
