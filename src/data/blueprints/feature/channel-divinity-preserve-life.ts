import { defineFeature } from '../../../features/genesis-core/blueprints';

export default defineFeature({
  slug: 'channel-divinity-preserve-life',
  name: 'Channel Divinity: Preserve Life',
  compilation_state: {
    status: 'Valid',
    hash: '7b8c9d0e1f2a3b4c5d6e7f8g9h0i1j2k',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    "Starting at 2nd level, you can use your Channel Divinity to heal the badly injured. As an action, you present your holy symbol and evoke healing energy that can restore a number of hit points equal to five times your cleric level. Choose any creatures within 30 feet of you, and divide those hit points among them. This feature can restore a creature to no more than half of its hit point maximum. You can't use this feature on an undead or a construct.",
  level: 2,
  tags: ['cleric', 'life-domain'],
});
