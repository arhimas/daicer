import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Blood Frenzy',
  description:
    "The quipper has advantage on melee attack rolls against any creature that doesn't have all its hit points.",
  type: 'ability',
  slug: 'quipper-blood-frenzy',
});
