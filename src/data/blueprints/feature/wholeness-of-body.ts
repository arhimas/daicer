import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'wholeness-of-body',
  name: 'Wholeness of Body',
  compilation_state: {
    status: 'Valid',
    hash: '8e54c3309a6369f6e6f6f96798e8e6e5',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully mapped from SRD 5.1 reference.',
  },
  description:
    'At 6th level, you gain the ability to heal yourself. As an action, you can regain hit points equal to three times your monk level. You must finish a long rest before you can use this feature again.',
  level: 6,
  lore: 'By channeling ki into the physical form, a practitioner of the Open Hand can knit together wounds and soothe internal injuries through sheer force of will.',
  tags: ['monk', 'way-of-the-open-hand', 'healing'],
});
