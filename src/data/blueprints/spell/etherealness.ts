import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'etherealness',
  name: 'Etherealness',
  level: 7,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Time-Limited',
    value: 8,
    unit: 'Hours',
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
    "You step into the border regions of the Ethereal Plane, in the area where it overlaps with your current plane. You remain in the Border Ethereal for the duration or until you use your action to dismiss the spell. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can see and hear the plane you originated from, but everything there looks gray, and you can't see anything more than 60 feet away. While on the Ethereal Plane, you can only affect and be affected by other creatures on that plane. Creatures that aren't on the Ethereal Plane can't perceive you and can't interact with you, unless a special ability or magic has given them the ability to do so. You ignore all objects and effects that aren't on the Ethereal Plane, allowing you to move through objects you perceive on the plane you originated from. When the spell ends, you immediately return to the plane you originated from in the spot you currently occupy. If you occupy the same spot as a solid object or creature when this happens, you are immediately shunted to the nearest unoccupied space that you can occupy and take force damage equal to twice the number of feet you are moved. This spell has no effect if you cast it while you are on the Ethereal Plane or a plane that doesn't border it, such as one of the Outer Planes. At Higher Levels: When you cast this spell using a spell slot of 8th level or higher, you can target up to three willing creatures (including you) for each slot level above 7th. The creatures must be within 10 feet of you when you cast the spell.",
  compilation_state: {
    status: 'Valid',
  },
});
