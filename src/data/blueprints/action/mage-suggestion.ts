import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'suggestion',
  description:
    "You suggest a course of activity (limited to a sentence or two) and magically influence up to twelve creatures of your choice that you can see within range and that can hear and understand you. Creatures that can't be charmed are immune to this effect. Each target must make a Wisdom saving throw. On a failed save, it pursues the course of action you described to the best of its ability. The suggested course of action can continue for the entire duration. If the suggested activity would directly harm the creature, it automatically succeeds on the saving throw.",
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 14,
    attribute: 'wis',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Charmed',
      description: 'Target pursues the suggested course of action.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'mage-suggestion',
});
