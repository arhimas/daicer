import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Spell Scroll',
  slug: 'spell-scroll',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/spell-scroll.png',
  zones: ["roll","paper","text"],
  mapping: {
    "#f54242": "roll",
    "#f5a442": "paper",
    "#f5f542": "text"
},
  anchors: {
    "roll": [
        16,
        6
    ],
    "paper": [
        16,
        16
    ],
    "text": [
        16,
        16
    ]
}
});
