import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Corrode Metal',
  description:
    'Any nonmagical weapon made of metal that hits the ooze corrodes. After dealing damage, the weapon takes a permanent and cumulative -1 penalty to damage rolls. If its penalty drops to -5, the weapon is destroyed. Nonmagical ammunition made of metal that hits the ooze is destroyed after dealing damage. The ooze can eat through 2-inch-thick, nonmagical metal in 1 round.',
  type: 'ability',
  toHit: null,
  range_config: null,
  mechanics_config: null,
  save: null,
  damage_instances: null,
  condition_instances: null,
  slug: 'gray-ooze-corrode-metal',
});
