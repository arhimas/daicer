import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Transparent',
  description:
    "Even when the cube is in plain sight, it takes a successful DC 15 Wisdom (Perception) check to spot a cube that has neither moved nor attacked. A creature that tries to enter the cube's space while unaware of the cube is surprised by the cube.",
  type: 'ability',
  slug: 'gelatinous-cube-transparent',
});
