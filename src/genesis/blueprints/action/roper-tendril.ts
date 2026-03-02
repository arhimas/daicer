import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Tendril',
  description:
    "Melee Weapon Attack: +7 to hit, reach 50 ft., one creature. Hit: The target is grappled (escape DC 15). Until the grapple ends, the target is restrained and has disadvantage on Strength checks and Strength saving throws, and the roper can't use the same tendril on another target.",
  type: 'melee',
  toHit: 7,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 50,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Grappled',
      description: 'escape DC 15',
      chance: 100,
    },
    {
      condition: 'Restrained',
      chance: 100,
    },
    {
      condition: 'Special',
      description: 'disadvantage on Strength checks and Strength saving throws',
      chance: 100,
    },
  ],
  slug: 'roper-tendril',
});
