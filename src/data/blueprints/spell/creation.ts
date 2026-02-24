import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'creation',
  name: 'Creation',
  level: 5,
  school: 'Illusion',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A tiny piece of matter of the same type of the item you plan to create.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Special',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  scaling_config: {
    scales: true,
    type: 'Target',
    method: 'Per Slot Level',
  },
  description:
    "You pull wisps of shadow material from the Shadowfell to create a nonliving object of vegetable matter within range: soft goods, rope, wood, or something similar. You can also use this spell to create mineral objects such as stone, crystal, or metal. The object created must be no larger than a 5-foot cube, and the object must be of a form and material that you have seen before.\n\nThe duration depends on the object's material. If the object is composed of multiple materials, use the shortest duration.\n\n| Material | Duration |\n|---|---|\n| Vegetable matter | 1 day |\n| Stone or crystal | 12 hours |\n| Precious metals | 1 hour |\n| Gems | 10 minutes |\n| Adamantine or mithral | 1 minute |\n\nUsing any material created by this spell as another spell's material component causes that spell to fail.\n\nAt Higher Levels: When you cast this spell using a spell slot of 6th level or higher, the cube increases by 5 feet for each slot level above 5th.",
  compilation_state: {
    status: 'Valid',
  },
});
