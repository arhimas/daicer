import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Phantasms',
  description:
    "The cloaker magically creates three illusory duplicates of itself if it isn't in bright light. The duplicates move with it and mimic its actions, shifting position so as to make it impossible to track which cloaker is the real one. If the cloaker is ever in an area of bright light, the duplicates disappear. Whenever any creature targets the cloaker with an attack or a harmful spell while a duplicate remains, that creature rolls randomly to determine whether it targets the cloaker or one of the duplicates. A creature is unaffected by this magical effect if it can't see or if it relies on senses other than sight. A duplicate has the cloaker's AC and uses its saving throws. If an attack hits a duplicate, or if a duplicate fails a saving throw against an effect that deals damage, the duplicate disappears.",
  type: 'spell',
  mechanics_config: {
    action_type: 'None',
  },
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Creates three illusory duplicates. Whenever any creature targets the cloaker with an attack or a harmful spell while a duplicate remains, that creature rolls randomly to determine whether it targets the cloaker or one of the duplicates.',
      chance: 100,
    },
  ],
  slug: 'cloaker-phantasms',
});
