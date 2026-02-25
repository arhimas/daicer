import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'mage hand',
  description:
    "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again. You can use your action to control the hand. You can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. You can move the hand up to 30 feet each time you use it. The hand can't attack, activate magic items, or carry more than 10 pounds.",
  type: 'spell',
  toHit: null,
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description: 'Creates a spectral, floating hand that can manipulate objects.',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'mage-mage-hand',
});
