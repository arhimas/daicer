import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'heroes-feast',
  name: "Heroes' Feast",
  level: 6,
  school: 'Conjuration',
  casting_config: {
    time_value: 10,
    time_unit: 'Minute',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 1000,
      material: true,
      material_description: 'A gem-encrusted bowl worth at least 1,000gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      dice_count: 2,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  condition_instances: [
    {
      condition: 'Poisoned',
      description: 'The creature is cured of poison and becomes immune to poison for 24 hours.',
      chance: 100,
    },
    {
      condition: 'Frightened',
      description: 'The creature becomes immune to being frightened for 24 hours.',
      chance: 100,
    },
  ],
  description:
    "You bring forth a great feast, including magnificent food and drink. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve other creatures can partake of the feast.\n\nA creature that partakes of the feast gains several benefits. The creature is cured of all diseases and poison, becomes immune to poison and being frightened, and makes all wisdom saving throws with advantage. Its hit point maximum also increases by 2d10, and it gains the same number of hit points. These benefits last for 24 hours.",
  compilation_state: {
    status: 'Valid',
  },
});
