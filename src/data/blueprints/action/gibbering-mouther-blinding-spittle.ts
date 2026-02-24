import { defineAction } from '../../../features/genesis-core/blueprints';

export default defineAction({
  name: 'Blinding Spittle',
  description:
    "The mouther spits a chemical glob at a point it can see within 15 feet of it. The glob explodes in a blinding flash of light on impact. Each creature within 5 feet of the flash must succeed on a DC 13 Dexterity saving throw or be blinded until the end of the mouther's next turn.",
  type: 'ranged',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 15,
    aoe_shape: 'Sphere',
    aoe_size: 5,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 13,
    attribute: 'dex',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Blinded',
      description: null,
      chance: 100,
      duration_rounds: 1,
    },
  ],
  slug: 'gibbering-mouther-blinding-spittle',
});
