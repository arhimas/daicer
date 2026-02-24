import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'death-ward',
  name: 'Death Ward',
  level: 4,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 8,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'You touch a creature and grant it a measure of protection from death.\n\nThe first time the target would drop to 0 hit points as a result of taking damage, the target instead drops to 1 hit point, and the spell ends.\n\nIf the spell is still in effect when the target is subjected to an effect that would kill it instantaneously without dealing damage, that effect is instead negated against the target, and the spell ends.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['cleric', 'paladin', 'life'],
});
