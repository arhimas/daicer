import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'gust-of-wind',
  name: 'Gust of Wind',
  level: 2,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A legume seed.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    distance: 60,
    aoe_shape: 'Line',
    aoe_size: 10,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Strength Save',
    save_effect: 'Negate',
  },
  description:
    "A line of strong wind 60 feet long and 10 feet wide blasts from you in a direction you choose for the spell's duration. Each creature that starts its turn in the line must succeed on a strength saving throw or be pushed 15 feet away from you in a direction following the line. Any creature in the line must spend 2 feet of movement for every 1 foot it moves when moving closer to you. The gust disperses gas or vapor, and it extinguishes candles, torches, and similar unprotected flames in the area. It causes protected flames, such as those of lanterns, to dance wildly and has a 50 percent chance to extinguish them. As a bonus action on each of your turns before the spell ends, you can change the direction in which the line blasts from you.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['druid', 'sorcerer', 'wizard', 'lore'],
});
