import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'flaming-sphere',
  name: 'Flaming Sphere',
  level: 2,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A bit of tallow, a pinch of brimstone, and a dusting of powdered iron.',
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
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'End of Turn',
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
    "A 5-foot-diameter sphere of fire appears in an unoccupied space of your choice within range and lasts for the duration. Any creature that ends its turn within 5 feet of the sphere must make a dexterity saving throw. The creature takes 2d6 fire damage on a failed save, or half as much damage on a successful one. As a bonus action, you can move the sphere up to 30 feet. If you ram the sphere into a creature, that creature must make the saving throw against the sphere's damage, and the sphere stops moving this turn. When you move the sphere, you can direct it over barriers up to 5 feet tall and jump it across pits up to 10 feet wide. The sphere ignites flammable objects not being worn or carried, and it sheds bright light in a 20-foot radius and dim light for an additional 20 feet. Higher Level: When you cast this spell using a spell slot of 3rd level or higher, the damage increases by 1d6 for each slot level above 2nd.",
  compilation_state: {
    status: 'Valid',
  },
});
