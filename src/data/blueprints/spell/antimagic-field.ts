import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'antimagic-field',
  name: 'Antimagic Field',
  level: 8,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A pinch of powdered iron or iron filings.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    aoe_shape: 'Sphere',
    aoe_size: 10,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Hours',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Special',
      description: 'Magical effects and spells are suppressed within the sphere.',
      chance: 100,
    },
  ],
  scaling_config: {
    scales: false,
    type: 'Dice',
    method: 'Per Slot Level',
  },
  description:
    "A 10-foot-radius invisible sphere of antimagic surrounds you. This area is divorced from the magical energy that suffuses the multiverse. Within the sphere, spells can't be cast, summoned creatures disappear, and even magic items become mundane. Until the spell ends, the sphere moves with you, centered on you.\n\nSpells and other magical effects, except those created by an artifact or a deity, are suppressed in the sphere and can't protrude into it. A slot expended to cast a suppressed spell is consumed. While an effect is suppressed, it doesn't function, but the time it spends suppressed counts against its duration.\n\n***Targeted Effects.*** Spells and other magical effects, such as magic missile and charm person, that target a creature or an object in the sphere have no effect on that target.\n\n***Areas of Magic.*** The area of another spell or magical effect, such as fireball, can't extend into the sphere. If the sphere overlaps an area of magic, the part of the area that is covered by the sphere is suppressed. For example, the flames created by a wall of fire are suppressed within the sphere, creating a gap in the wall if the overlap is large enough.\n\n***Spells.*** Any active spell or other magical effect on a creature or an object in the sphere is suppressed while the creature or object is in it.\n\n***Magic Items.*** The properties and powers of magic items are suppressed in the sphere. For example, a +1 longsword in the sphere functions as a nonmagical longsword.\n\nA magic weapon's properties and powers are suppressed if it is used against a target in the sphere or wielded by an attacker in the sphere. If a magic weapon or a piece of magic ammunition fully leaves the sphere (for example, if you fire a magic arrow or throw a magic spear at a target outside the sphere), the magic of the item ceases to be suppressed as soon as it exits.\n\n***Magical Travel.*** Teleportation and planar travel fail to work in the sphere, whether the sphere is the destination or the departure point for such magical travel. A portal to another location, world, or plane of existence, as well as an opening to an extradimensional space such as that created by the rope trick spell, temporarily closes while in the sphere.\n\n***Creatures and Objects.*** A creature or object summoned or created by magic temporarily winks out of existence in the sphere. Such a creature instantly reappears once the space the creature occupied is no longer within the sphere.\n\n***Dispel Magic.*** Spells and magical effects such as dispel magic have no effect on the sphere. Likewise, the spheres created by different antimagic field spells don't nullify each other.",
  compilation_state: {
    status: 'Valid',
  },
  tags: ['Cleric', 'Wizard'],
});
