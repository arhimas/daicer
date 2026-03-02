import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'storm-of-vengeance',
  name: 'Storm of Vengeance',
  level: 9,
  school: 'Conjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      material: false,
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Sight',
    aoe_shape: 'Sphere',
    aoe_size: 360,
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
  damage_instances: [
    {
      effect_type: 'Damage',
      damage_type: 'Thunder',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Instant',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Acid',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Lightning',
      dice_count: 10,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Bludgeoning',
      dice_count: 2,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'One Time Trigger',
    },
    {
      effect_type: 'Damage',
      damage_type: 'Cold',
      dice_count: 1,
      dice_value: 6,
      flat_bonus: 0,
      timing: 'Start of Turn',
    },
  ],
  condition_instances: [
    {
      condition: 'Deafened',
      description: 'Creatures that fail the initial Constitution save are deafened for 5 minutes.',
      chance: 100,
      duration_rounds: 50,
    },
  ],
  description:
    "A churning storm cloud forms, centered on a point you can see and spreading to a radius of 360 feet. Lightning flashes in the area, thunder booms, and strong winds roar. Each creature under the cloud (no more than 5,000 feet beneath the cloud) when it appears must make a constitution saving throw. On a failed save, a creature takes 2d6 thunder damage and becomes deafened for 5 minutes.\n\nEach round you maintain concentration on this spell, the storm produces additional effects on your turn.\n\n**Round 2.** Acidic rain falls from the cloud. Each creature and object under the cloud takes 1d6 acid damage.\n\n**Round 3.** You call six bolts of lightning from the cloud to strike six creatures or objects of your choice beneath the cloud. A given creature or object can't be struck by more than one bolt. A struck creature must make a dexterity saving throw. The creature takes 10d6 lightning damage on a failed save, or half as much damage on a successful one.\n\n**Round 4.** Hailstones rain down from the cloud. Each creature under the cloud takes 2d6 bludgeoning damage.\n\n**Round 5-10.** Gusts and freezing rain assail the area under the cloud. The area becomes difficult terrain and is heavily obscured. Each creature there takes 1d6 cold damage. Ranged weapon attacks in the area are impossible. The wind and rain count as a severe distraction for the purposes of maintaining concentration on spells. Finally, gusts of strong wind (ranging from 20 to 50 miles per hour) automatically disperse fog, mists, and similar phenomena in the area, whether mundane or magical.",
  compilation_state: {
    status: 'Valid',
    summary: 'Mapped Storm of Vengeance from reference data.',
  },
  tags: ['druid'],
});
