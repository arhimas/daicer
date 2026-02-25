import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'potent-cantrip',
  name: 'Potent Cantrip',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  description:
    "Starting at 6th level, your damaging cantrips affect even creatures that avoid the brunt of the effect. When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip's damage (if any) but suffers no additional effect from the cantrip.",
  level: 6,
  lore: "A wizard's basic incantations are refined to the point where they become nearly impossible to fully evade, ensuring that even a partial resistance results in injury.",
  tags: ['wizard', 'evocation'],
});
