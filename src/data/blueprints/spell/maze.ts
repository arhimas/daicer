import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'maze',
  name: 'Maze',
  level: 8,
  school: 'Conjuration',
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
    value: 10,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
  },
  condition_instances: [
    {
      condition: 'Special',
      description: 'Target is banished into a labyrinthine demiplane.',
      chance: 100,
    },
  ],
  description:
    'You banish a creature that you can see within range into a labyrinthine demiplane. The target remains there for the duration or until it escapes the maze.\n\nThe target can use its action to attempt to escape. When it does so, it makes a DC 20 Intelligence check. If it succeeds, it escapes, and the spell ends (a minotaur or goristro demon automatically succeeds).\n\nWhen the spell ends, the target reappears in the space it left or, if that space is occupied, in the nearest unoccupied space.',
  compilation_state: {
    status: 'Valid',
  },
});
