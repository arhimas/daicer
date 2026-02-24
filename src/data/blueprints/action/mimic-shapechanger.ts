import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Shapechanger',
  description:
    "The mimic can use its action to polymorph into an object or back into its true, amorphous form. Its statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'mimic-shapechanger',
});
