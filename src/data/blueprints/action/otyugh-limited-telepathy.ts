import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Limited Telepathy',
  description:
    "The otyugh can magically transmit simple messages and images to any creature within 120 ft. of it that can understand a language. This form of telepathy doesn't allow the receiving creature to telepathically respond.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'otyugh-limited-telepathy',
});
