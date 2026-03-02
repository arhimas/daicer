import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Amorphous (Small)',
  slug: 'ooze-small',
  category: 'Creature',
  gridUrl: '/src/genesis/sprites/blueprints/ooze-small.png',
  zones: ["core","details","gem"],
  mapping: {
    "#f5a442": "details",
    "#CCFFCC": "core"
},
  anchors: {
    "core": [
        16,
        20
    ],
    "details": [
        16,
        24
    ],
    "gem": [
        16,
        16
    ]
}
});
