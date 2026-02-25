import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Antennae',
  description:
    "The rust monster corrodes a nonmagical ferrous metal object it can see within 5 feet of it. If the object isn't being worn or carried, the touch destroys a 1-foot cube of it. If the object is being worn or carried by a creature, the creature can make a DC 11 Dexterity saving throw to avoid the rust monster's touch. If the object touched is either metal armor or a metal shield being worn or carried, its takes a permanent and cumulative -1 penalty to the AC it offers. Armor reduced to an AC of 10 or a shield that drops to a +0 bonus is destroyed. If the object touched is a held metal weapon, it rusts as described in the Rust Metal trait.",
  type: 'ability',
  toHit: null,
  range_config: {
    type: 'Touch',
    distance: 5,
    aoe_shape: null,
    aoe_size: null,
  },
  mechanics_config: {
    action_type: 'Dexterity Save',
    save_effect: 'Negate',
  },
  save: {
    dc: 11,
    attribute: 'dex',
  },
  damage_instances: null,
  condition_instances: [
    {
      condition: 'Special',
      description:
        'Metal armor or shield takes a permanent and cumulative -1 penalty to the AC it offers. Armor reduced to an AC of 10 or a shield that drops to a +0 bonus is destroyed.',
      chance: 100,
      duration_rounds: null,
    },
    {
      condition: 'Special',
      description:
        'Held metal weapon rusts as described in the Rust Metal trait (permanent and cumulative -1 penalty to damage rolls, destroyed at -5).',
      chance: 100,
      duration_rounds: null,
    },
  ],
  slug: 'rust-monster-antennae',
});
