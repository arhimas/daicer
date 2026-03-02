import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Vampire Weaknesses',
  description:
    "The vampire has the following flaws: Forbiddance. The vampire can't enter a residence without an invitation from one of the occupants. Harmed by Running Water. The vampire takes 20 acid damage when it ends its turn in running water. Stake to the Heart. The vampire is destroyed if a piercing weapon made of wood is driven into its heart while it is incapacitated in its resting place. Sunlight Hypersensitivity. The vampire takes 20 radiant damage when it starts its turn in sunlight. While in sunlight, it has disadvantage on attack rolls and ability checks.",
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: {
    action_type: 'None',
    save_effect: null,
  },
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'vampire-spawn-vampire-weaknesses',
});
