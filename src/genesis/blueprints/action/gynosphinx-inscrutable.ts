import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Inscrutable',
  description:
    "The sphinx is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the sphinx's intentions or sincerity have disadvantage.",
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  slug: 'gynosphinx-inscrutable',
});
