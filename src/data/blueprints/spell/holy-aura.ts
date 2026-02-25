import { defineSpell } from '@/features/genesis-core/blueprints';

export default defineSpell({
  slug: 'holy-aura',
  name: 'Holy Aura',
  level: 8,
  school: 'Abjuration',
  casting_config: {
    time_value: 1,
    time_unit: 'Action',
    is_ritual: false,
    is_concentration: true,
    components: {
      consumed: false,
      cost_gp: 1000,
      material: true,
      material_description:
        "A tiny reliquary worth at least 1,000gp containing a sacred relic, such as a scrap of cloth from a saint's robe or a piece of parchment from a religious text.",
      somatic: true,
      verbal: true,
    },
  },
  range_config: {
    type: 'Self',
    aoe_shape: 'Sphere',
    aoe_size: 30,
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
  damage_instances: [],
  condition_instances: [
    {
      condition: 'Blinded',
      description:
        'If a fiend or an undead hits an affected creature with a melee attack, the attacker must succeed on a constitution saving throw or be blinded until the spell ends.',
      chance: 100,
    },
  ],
  description:
    'Divine light washes out from you and coalesces in a soft radiance in a 30-foot radius around you. Creatures of your choice in that radius when you cast this spell shed dim light in a 5-foot radius and have advantage on all saving throws, and other creatures have disadvantage on attack rolls against them until the spell ends. In addition, when a fiend or an undead hits an affected creature with a melee attack, the aura flashes with brilliant light. The attacker must succeed on a constitution saving throw or be blinded until the spell ends.',
  compilation_state: {
    status: 'Valid',
  },
});
