import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'flesh-to-stone',
  name: 'Flesh to Stone',
  level: 6,
  school: 'Transmutation',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 0,
      material: true,
      material_description: 'A pinch of lime, water, and earth.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 60,
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Constitution Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Restrained',
      description: 'On a failed save, it is restrained as its flesh begins to harden.',
      chance: 100,
    },
    {
      condition: 'Petrified',
      description:
        'If it fails its saves three times, it is turned to stone and subjected to the petrified condition for the duration.',
      chance: 100,
    },
  ],
  description:
    "You attempt to turn one creature that you can see within range into stone. If the target's body is made of flesh, the creature must make a constitution saving throw. On a failed save, it is restrained as its flesh begins to harden. On a successful save, the creature isn't affected. A creature restrained by this spell must make another constitution saving throw at the end of each of its turns. If it successfully saves against this spell three times, the spell ends. If it fails its saves three times, it is turned to stone and subjected to the petrified condition for the duration. The successes and failures don't need to be consecutive; keep track of both until the target collects three of a kind. If the creature is physically broken while petrified, it suffers from similar deformities if it reverts to its original state. If you maintain your concentration on this spell for the entire possible duration, the creature is turned to stone until the effect is removed.",
  compilation_state: {
    status: 'Valid',
  },
});
