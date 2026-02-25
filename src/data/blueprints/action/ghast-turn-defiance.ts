import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Turn Defiance',
  description:
    'The ghast and any ghouls within 30 ft. of it have advantage on saving throws against effects that turn undead.',
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 30,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'ghast-turn-defiance',
});
