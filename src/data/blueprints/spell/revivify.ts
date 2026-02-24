import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'revivify',
  name: 'Revivify',
  level: 3,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 300,
      material: true,
      material_description: 'Diamonds worth 300gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
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
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 1,
      timing: 'Instant',
    },
  ],
  description:
    "You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can't return to life a creature that has died of old age, nor can it restore any missing body parts.",
  compilation_state: {
    status: 'Valid',
  },
});
