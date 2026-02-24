import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Labyrinthine Recall',
  description: 'The minotaur can perfectly recall any path it has traveled.',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'minotaur-labyrinthine-recall',
});
