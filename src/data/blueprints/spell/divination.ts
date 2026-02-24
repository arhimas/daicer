import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'divination',
  name: 'Divination',
  level: 4,
  school: 'Divination',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 25,
      material: true,
      material_description:
        'Incense and a sacrificial offering appropriate to your religion, together worth at least 25gp, which the spell consumes.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    "Your magic and an offering put you in contact with a god or a god's servants. You ask a single question concerning a specific goal, event, or activity to occur within 7 days. The GM offers a truthful reply. The reply might be a short phrase, a cryptic rhyme, or an omen. The spell doesn't take into account any possible circumstances that might change the outcome, such as the casting of additional spells or the loss or gain of a companion. If you cast the spell two or more times before finishing your next long rest, there is a cumulative 25 percent chance for each casting after the first that you get a random reading. The GM makes this roll in secret.",
  compilation_state: {
    status: 'Valid',
  },
});
