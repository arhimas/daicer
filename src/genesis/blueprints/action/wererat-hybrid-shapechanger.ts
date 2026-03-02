import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Shapechanger',
  description:
    "The wererat can use its action to polymorph into a rat-humanoid hybrid or into a giant rat, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'wererat-hybrid-shapechanger',
});
