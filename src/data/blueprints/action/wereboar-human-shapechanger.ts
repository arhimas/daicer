import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Shapechanger',
  description:
    "The wereboar can use its action to polymorph into a boar-humanoid hybrid or into a boar, or back into its true form, which is humanoid. Its statistics, other than its AC, are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'wereboar-human-shapechanger',
});
