import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    "The tyrannosaurus makes two attacks: one with its bite and one with its tail. It can't make both attacks against the same target.",
  type: 'utility',
  slug: 'tyrannosaurus-rex-multiattack',
});
