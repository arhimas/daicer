import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Death Throes',
  description:
    "When the balor dies, it explodes, and each creature within 30 feet of it must make a DC 20 Dexterity saving throw, taking 70 (20d6) fire damage on a failed save, or half as much damage on a successful one. The explosion ignites flammable objects in that area that aren't being worn or carried, and it destroys the balor's weapons.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Self',
    distance: null,
    aoe_shape: 'Sphere',
    aoe_size: 30,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  save: {
    dc: 20,
    attribute: 'dex',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 20,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  condition_instances: null,
  slug: 'balor-death-throes',
});
