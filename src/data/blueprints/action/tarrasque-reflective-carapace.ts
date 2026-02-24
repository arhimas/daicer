import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Reflective Carapace',
  description:
    'Any time the tarrasque is targeted by a magic missile spell, a line spell, or a spell that requires a ranged attack roll, roll a d6. On a 1 to 5, the tarrasque is unaffected. On a 6, the tarrasque is unaffected, and the effect is reflected back at the caster as though it originated from the tarrasque, turning the caster into the target.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'tarrasque-reflective-carapace',
});
