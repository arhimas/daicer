import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'overchannel',
  name: 'Overchannel',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully imported from reference data.',
  },
  description:
    'Starting at 14th level, you can increase the power of your simpler spells. When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage with that spell. The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a long rest, you take 2d12 necrotic damage for each level of the spell, immediately after you cast it. Each time you use this feature again before finishing a long rest, the necrotic damage per spell level increases by 1d12. This damage ignores resistance and immunity.',
  level: 14,
  lore: 'Pushing your magical limits allows for devastating power at a physical cost.',
  tags: ['wizard', 'evocation'],
});
