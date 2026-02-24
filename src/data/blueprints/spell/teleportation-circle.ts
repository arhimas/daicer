import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'teleportation-circle',
  name: 'Teleportation Circle',
  level: 5,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Minute',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: true,
      cost_gp: 50,
      material: true,
      material_description: 'Rare chalks and inks infused with precious gems with 50 gp, which the spell consumes.',
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 10,
  },
  duration_config: {
    type: 'Time-Limited',
    value: 1,
    unit: 'Rounds',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'None',
  },
  description:
    'As you cast the spell, you draw a 10-foot-diameter circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied.\n\nMany major temples, guilds, and other important places have permanent teleportation circles inscribed somewhere within their confines. Each such circle includes a unique sigil sequence--a string of magical runes arranged in a particular pattern. When you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the GM. You can learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute.\n\nYou can create a permanent teleportation circle by casting this spell in the same location every day for one year. You need not use the circle to teleport when you cast the spell in this way.',
  compilation_state: {
    status: 'Valid',
  },
});
