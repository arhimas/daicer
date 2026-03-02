import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'antilife-shell',
  name: 'Antilife Shell',
  level: 5,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    aoe_shape: 'Sphere',
    aoe_size: 10,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Hours',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Hedges out creatures other than undead and constructs. Affected creatures cannot pass or reach through the barrier.',
      chance: 100,
    },
  ],
  description:
    'A shimmering barrier extends out from you in a 10-foot radius and moves with you, remaining centered on you and hedging out creatures other than undead and constructs. The barrier lasts for the duration. The barrier prevents an affected creature from passing or reaching through. An affected creature can cast spells or make attacks with ranged or reach weapons through the barrier. If you move so that an affected creature is forced to pass through the barrier, the spell ends.',
  compilation_state: {
    status: 'Valid',
    summary: 'Spell compiled from reference data.',
  },
  tags: ['druid'],
});
