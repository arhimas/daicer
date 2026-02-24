import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'mage armor',
  description:
    "You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.",
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: "Target's base AC becomes 13 + its Dexterity modifier.",
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'mage-mage-armor',
});
