import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Change Shape',
  description:
    'The dragon magically polymorphs into a humanoid or beast that has a challenge rating no higher than its own, or back into its true form.',
  type: 'spell',
  slug: 'ancient-silver-dragon-change-shape',
});
