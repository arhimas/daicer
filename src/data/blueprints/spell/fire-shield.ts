import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'fire-shield',
  name: 'Fire Shield',
  level: 4,
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
      material_description: 'A little phosphorus or a firefly.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 10,
    unit: 'Minutes',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Auto-Hit',
    save_effect: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Fire',
      dice_count: 2,
      dice_value: 8,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
  ],
  description:
    'Thin and vaporous flame surround your body for the duration of the spell, radiating a bright light bright light in a 10-foot radius and dim light for an additional 10 feet. You can end the spell using an action to make it disappear. The flames are around you a heat shield or cold, your choice. The heat shield gives you cold damage resistance and the cold resistance to fire damage. In addition, whenever a creature within 5 feet of you hits you with a melee attack, flames spring from the shield. The attacker then suffers 2d8 points of fire damage or cold, depending on the model.',
  compilation_state: {
    status: 'Valid',
  },
});
