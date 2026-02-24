import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'meteor-swarm',
  name: 'Meteor Swarm',
  level: 9,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Miles)',
    distance: 1,
    aoe_shape: 'Sphere',
    aoe_size: 40,
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
      damage_type: 'Fire',
      dice_count: 20,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 20,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
  ],
  description:
    "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius sphere centered on each point you choose must make a dexterity saving throw. The sphere spreads around corners. A creature takes 20d6 fire damage and 20d6 bludgeoning damage on a failed save, or half as much damage on a successful one. A creature in the area of more than one fiery burst is affected only once. The spell damages objects in the area and ignites flammable objects that aren't being worn or carried.",
  compilation_state: {
    status: 'Valid',
  },
});
