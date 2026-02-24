import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'divine-favor',
  name: 'Divine Favor',
  level: 1,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Bonus Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Radiant',
      dice_count: 1,
      dice_value: 4,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  description:
    'Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.',
  compilation_state: {
    status: 'Valid',
  },
});
