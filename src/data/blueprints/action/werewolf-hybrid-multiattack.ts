import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiattack',
  description:
    'The werewolf makes two attacks: two with its spear (humanoid form) or one with its bite and one with its claws (hybrid form).',
  type: 'utility',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'werewolf-hybrid-multiattack',
});
