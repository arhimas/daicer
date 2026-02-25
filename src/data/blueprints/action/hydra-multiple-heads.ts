import { defineAction } from '@/features/genesis-core/blueprints';

export default defineAction({
  name: 'Multiple Heads',
  description:
    'The hydra has five heads. While it has more than one head, the hydra has advantage on saving throws against being blinded, charmed, deafened, frightened, stunned, and knocked unconscious. Whenever the hydra takes 25 or more damage in a single turn, one of its heads dies. If all its heads die, the hydra dies. At the end of its turn, it grows two heads for each of its heads that died since its last turn, unless it has taken fire damage since its last turn. The hydra regains 10 hit points for each head regrown in this way.',
  type: 'ability',
  mechanics_config: {
    action_type: 'None',
  },
  damage_instances: [
    {
      effect_type: 'Healing',
      damage_type: null,
      dice_count: 0,
      dice_value: 0,
      flat_bonus: 10,
      timing: 'End of Turn',
    },
  ],
  slug: 'hydra-multiple-heads',
});
