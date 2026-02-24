import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'commune',
  name: 'Commune',
  level: 5,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'Incense and a vial of holy or unholy water.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "You contact your deity or a divine proxy and ask up to three questions that can be answered with a yes or no. You must ask your questions before the spell ends. You receive a correct answer for each question. Divine beings aren't necessarily omniscient, so you might receive \"unclear\" as an answer if a question pertains to information that lies beyond the deity's knowledge. In a case where a one-word answer could be misleading or contrary to the deity's interests, the GM might offer a short phrase as an answer instead. If you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get no answer. The GM makes this roll in secret.",
  compilation_state: {
    status: 'Valid',
  },
});
