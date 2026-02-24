import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'forbiddance',
  name: 'Forbiddance',
  level: 6,
  school: 'Abjuration',
  casting_config: {
    time_value: 10,
    time_unit: 'Minute',
    is_ritual: true,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 1000,
      material: true,
      material_description: 'A sprinkling of holy water, rare incense, and powdered ruby worth at least 1,000 gp.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Touch',
    aoe_shape: 'Cube',
    aoe_size: 200,
    aoe_height: 30,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 24,
    unit: 'Hours',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
    save_effect: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Radiant',
      dice_count: 5,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Necrotic',
      dice_count: 5,
      dice_value: 10,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [],
  description:
    "You create a ward against magical travel that protects up to 40,000 square feet of floor space to a height of 30 feet above the floor. For the duration, creatures can't teleport into the area or use portals, such as those created by the gate spell, to enter the area. The spell proofs the area against planar travel, and therefore prevents creatures from accessing the area by way of the Astral Plane, Ethereal Plane, Feywild, Shadowfell, or the plane shift spell.\n\nIn addition, the spell damages types of creatures that you choose when you cast it. Choose one or more of the following: celestials, elementals, fey, fiends, and undead. When a chosen creature enters the spell's area for the first time on a turn or starts its turn there, the creature takes 5d10 radiant or necrotic damage (your choice when you cast this spell).\n\nWhen you cast this spell, you can designate a password. A creature that speaks the password as it enters the area takes no damage from the spell.\n\nThe spell's area can't overlap with the area of another forbiddance spell. If you cast forbiddance every day for 30 days in the same location, the spell lasts until it is dispelled, and the material components are consumed on the last casting.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['cleric'],
});
