import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: 'Helm',
  slug: 'helm',
  category: 'Item',
  gridUrl: '/src/genesis/sprites/blueprints/helm.png',
  zones: ["core","details","trim"],
  mapping: {
    "#CCFFCC": "core",
    "#f5a442": "details",
    "#f54242": "trim"
},
  anchors: {
    "core": [
        16,
        16
    ],
    "details": [
        16,
        16
    ],
    "trim": [
        16,
        28
    ]
}
});
