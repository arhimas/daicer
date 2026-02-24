import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Shapechanger',
  description:
    "The weretiger can use its action to polymorph into a tiger-humanoid hybrid or into a tiger, or back into its true form, which is humanoid. Its statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.",
  type: 'utility',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'weretiger-human-shapechanger',
});
