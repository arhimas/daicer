import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Heart Sight',
  description:
    "The sprite touches a creature and magically knows the creature's current emotional state. If the target fails a DC 10 Charisma saving throw, the sprite also knows the creature's alignment. Celestials, fiends, and undead automatically fail the saving throw.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: null,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Charisma Save',
    save_effect: null,
  },
  save: {
    dc: 10,
    attribute: 'cha',
  },
  damage_instances: null,
  condition_instances: null,
  slug: 'sprite-heart-sight',
});
