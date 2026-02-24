import { defineSpell } from '../../../features/genesis-core/blueprints';

export default defineSpell({
  slug: 'dispel-evil-and-good',
  name: 'Dispel Evil and Good',
  level: 5,
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
      material_description: 'Holy water or powdered silver and iron.',
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
  },
  duration_config: {
    type: 'Concentration',
    value: 1,
    unit: 'Minutes',
    concentration: true,
  },
  mechanics_config: {
    action_type: 'Charisma Save',
    save_effect: 'Negate',
  },
  damage_instances: [],
  condition_instances: [],
  description:
    "Shimmering energy surrounds and protects you from fey, undead, and creatures originating from beyond the Material Plane. For the duration, celestials, elementals, fey, fiends, and undead have disadvantage on attack rolls against you.\n\nYou can end the spell early by using either of the following special functions.\n\n***Break Enchantment.*** As your action, you touch a creature you can reach that is charmed, frightened, or possessed by a celestial, an elemental, a fey, a fiend, or an undead. The creature you touch is no longer charmed, frightened, or possessed by such creatures.\n\n***Dismissal.*** As your action, make a melee spell attack against a celestial, an elemental, a fey, a fiend, or an undead you can reach. On a hit, you attempt to drive the creature back to its home plane. The creature must succeed on a charisma saving throw or be sent back to its home plane (if it isn't there already). If they aren't on their home plane, undead are sent to the Shadowfell, and fey are sent to the Feywild.",
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped Dispel Evil and Good from SRD data.',
  },
  tags: ['cleric', 'paladin'],
});
