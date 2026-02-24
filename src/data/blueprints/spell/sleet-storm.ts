import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'sleet-storm',
  name: 'Sleet Storm',
  level: 3,
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
      material_description: 'A pinch of dust and a few drops of water.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 150,
    aoe_shape: 'Cylinder',
    aoe_size: 40,
    aoe_height: 20,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Prone',
      description: 'On a failed dexterity saving throw, the creature falls prone.',
      chance: 100,
    },
  ],
  description:
    "Until the spell ends, freezing rain and sleet fall in a 20-foot-tall cylinder with a 40-foot radius centered on a point you choose within range. The area is heavily obscured, and exposed flames in the area are doused.\\n\\nThe ground in the area is covered with slick ice, making it difficult terrain. When a creature enters the spell's area for the first time on a turn or starts its turn there, it must make a dexterity saving throw. On a failed save, it falls prone.\\n\\nIf a creature is concentrating in the spell's area, the creature must make a successful constitution saving throw against your spell save DC or lose concentration.",
  compilation_state: {
    status: 'Valid',
  },
});
