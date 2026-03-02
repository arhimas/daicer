import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Weapon (Ranged)',
  slug: 'weapon-ranged',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/weapon-ranged.png',
  zones: ["core","details","hilt"],
  mapping: {
    "#CCFFCC": "core",
    "#f5a442": "details",
    "#f54242": "hilt"
},
  anchors: {
    "core": [
        16,
        16
    ],
    "details": [
        16,
        12
    ],
    "hilt": [
        16,
        24
    ]
}
});
