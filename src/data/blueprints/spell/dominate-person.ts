import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'dominate-person',
  name: 'Dominate Person',
  level: 5,
  school: 'Enchantment',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Wisdom Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Charmed',
      description: 'The target is charmed and obeys telepathic commands. It makes a new save whenever it takes damage.',
      chance: 100,
      duration_rounds: 10,
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Duration',
    method: 'Specific Thresholds',
  },
  description:
    'You attempt to beguile a humanoid that you can see within range. It must succeed on a wisdom saving throw or be charmed by you for the duration. If you or creatures that are friendly to you are fighting it, it has advantage on the saving throw. While the target is charmed, you have a telepathic link with it as long as the two of you are on the same plane of existence. You can use this telepathic link to issue commands to the creature while you are conscious (no action required), which it does its best to obey. You can specify a simple and general course of action, such as "Attack that creature," "Run over there," or "Fetch that object." If the creature completes the order and doesn\'t receive further direction from you, it defends and preserves itself to the best of its ability. You can use your action to take total and precise control of the target. Until the end of your next turn, the creature takes only the actions you choose, and doesn\'t do anything that you don\'t allow it to do. During this time you can also cause the creature to use a reaction, but this requires you to use your own reaction as well. Each time the target takes damage, it makes a new wisdom saving throw against the spell. If the saving throw succeeds, the spell ends. At Higher Levels: When you cast this spell using a 6th-level spell slot, the duration is concentration, up to 10 minutes. When you use a 7th-level spell slot, the duration is concentration, up to 1 hour. When you use a spell slot of 8th level or higher, the duration is concentration, up to 8 hours.',
  compilation_state: {
    status: 'Valid',
  },
  tags: ['Bard', 'Sorcerer', 'Wizard'],
});
