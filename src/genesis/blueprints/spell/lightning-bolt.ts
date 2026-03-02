import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'lightning-bolt',
  name: 'Lightning Bolt',
  level: 3,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A bit of fur and a rod of amber, crystal, or glass.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    distance: 0,
    aoe_shape: 'Line',
    aoe_size: 100,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Lightning',
      dice_count: 8,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
    dice_count: 1,
    dice_value: 6,
  },
  description:
    "A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose. Each creature in the line must make a dexterity saving throw. A creature takes 8d6 lightning damage on a failed save, or half as much damage on a successful one. The lightning ignites flammable objects in the area that aren't being worn or carried. Higher Level: When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.",
  compilation_state: {
    status: 'Valid',
  },
});
