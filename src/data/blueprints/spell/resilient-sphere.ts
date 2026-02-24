import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'resilient-sphere',
  name: 'Resilient Sphere',
  level: 4,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A hemispherical piece of clear crystal and a matching hemispherical piece of gum arabic.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
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
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Enclosed in a sphere of shimmering force. Immune to damage from outside, cannot damage anything outside. Movement restricted to rolling at half speed.',
      chance: 100,
    },
  ],
  description:
    "A sphere of shimmering force encloses a creature or object of Large size or smaller within range. An unwilling creature must make a dexterity saving throw. On a failed save, the creature is enclosed for the duration.\n\nNothing--not physical objects, energy, or other spell effects--can pass through the barrier, in or out, though a creature in the sphere can breathe there. The sphere is immune to all damage, and a creature or object inside can't be damaged by attacks or effects originating from outside, nor can a creature inside the sphere damage anything outside it.\n\nThe sphere is weightless and just large enough to contain the creature or object inside. An enclosed creature can use its action to push against the sphere's walls and thus roll the sphere at up to half the creature's speed. Similarly, the globe can be picked up and moved by other creatures.\n\nA disintegrate spell targeting the globe destroys it without harming anything inside it.",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully parsed from reference data.',
  },
});
