import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'cloudkill',
  name: 'Cloudkill',
  level: 5,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 120,
    aoe_shape: 'Sphere',
    aoe_size: 20,
  },
  duration_config: {
    type: 'Concentration',
    value: 10,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Half',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Poison',
      dice_count: 5,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  scaling_config: {
    scales: true,
    type: 'Dice',
    method: 'Per Slot Level',
    dice_count: 1,
    dice_value: 8,
  },
  description:
    "You create a 20-foot-radius sphere of poisonous, yellow-green fog centered on a point you choose within range. The fog spreads around corners. It lasts for the duration or until strong wind disperses the fog, ending the spell. Its area is heavily obscured. When a creature enters the spell's area for the first time on a turn or starts its turn there, that creature must make a constitution saving throw. The creature takes 5d8 poison damage on a failed save, or half as much damage on a successful one. Creatures are affected even if they hold their breath or don't need to breathe. The fog moves 10 feet away from you at the start of each of your turns, rolling along the surface of the ground. The vapors, being heavier than air, sink to the lowest level of the land, even pouring down openings. Higher Levels: When you cast this spell using a spell slot of 6th level or higher, the damage increases by 1d8 for each slot level above 5th.",
  compilation_state: {
    status: 'Valid',
  },
});
