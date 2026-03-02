import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Staff',
  slug: 'staff',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/staff.png',
  zones: ["shaft","focus-frame","crystal"],
  mapping: {
    "#f54242": "focus-frame",
    "#f5a442": "shaft"
},
  anchors: {
    "shaft": [
        16,
        22
    ],
    "focus-frame": [
        16,
        9
    ],
    "crystal": [
        16,
        9
    ]
}
});
