import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'divine-word',
  name: 'Divine Word',
  level: 7,
  school: 'Evocation',
  casting_config: {
    time_value: 1,
    time_unit: 'Bonus Action',
    is_ritual: false,
    is_concentration: false,
    components: {
      consumed: false,
      cost_gp: 0,
      material: false,
      somatic: false,
      verbal: true,
    },
  },
  range_config: {
    type: 'Ranged (Feet)',
    distance: 30,
  },
  duration_config: {
    type: 'Instantaneous',
    concentration: false,
  },
  mechanics_config: {
    action_type: 'Charisma Save',
    save_effect: 'Negate',
  },
  condition_instances: [
    {
      condition: 'Deafened',
      description: '50 hit points or fewer: deafened for 1 minute',
      chance: 100,
      duration_rounds: 10,
    },
    {
      condition: 'Blinded',
      description: '40 hit points or fewer: deafened and blinded for 10 minutes',
      chance: 100,
      duration_rounds: 100,
    },
    {
      condition: 'Stunned',
      description: '30 hit points or fewer: blinded, deafened, and stunned for 1 hour',
      chance: 100,
      duration_rounds: 600,
    },
    {
      condition: 'Special',
      description:
        '20 hit points or fewer: killed instantly. Also banishes celestials, elementals, fey, or fiends to their home plane for 24 hours.',
      chance: 100,
    },
  ],
  description:
    "You utter a divine word, imbued with the power that shaped the world at the dawn of creation. Choose any number of creatures you can see within range. Each creature that can hear you must make a Charisma saving throw. On a failed save, a creature suffers an effect based on its current hit points: 50 hit points or fewer: deafened for 1 minute; 40 hit points or fewer: deafened and blinded for 10 minutes; 30 hit points or fewer: blinded, deafened, and stunned for 1 hour; 20 hit points or fewer: killed instantly. Regardless of its current hit points, a celestial, an elemental, a fey, or a fiend that fails its save is forced back to its plane of origin (if it isn't there already) and can't return to your current plane for 24 hours by any means short of a wish spell.",
  compilation_state: {
    status: 'Valid',
    summary: 'Spell successfully converted from reference data.',
  },
});
