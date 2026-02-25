import { defineBackground } from '@/features/genesis-core/blueprints';

export default defineBackground({
  slug: 'hermit',
  name: 'Hermit',
  compilation_state: {
    status: 'Valid',
    hash: 'b2d8e9a1c3f4g5h6',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Successfully parsed Hermit background from SRD/PHB source.',
  },
  description:
    'You lived in seclusion—either in a sheltered community such as a monastery, or entirely alone—for a formative part of your life. In your time apart from the clamor of society, you found quiet, solitude, and perhaps some of the answers you were looking for.',
  equipment: [
    {
      isEquipped: false,
      item: 'scroll-case',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'winter-blanket',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: true,
      item: 'common-clothes',
      quantity: 1,
      slot: 'armor',
    },
    {
      isEquipped: false,
      item: 'herbalism-kit',
      quantity: 1,
      slot: 'backpack',
    },
    {
      isEquipped: false,
      item: 'gold-piece',
      quantity: 5,
      slot: 'backpack',
    },
  ],
  feature: {
    name: 'Discovery',
    description:
      'The quiet seclusion of your hermitage gave you access to a unique and powerful discovery. The exact nature of this revelation depends on the nature of your seclusion. It might be a great truth about the cosmos, the deities, the powerful beings of the outer planes, or the forces of nature. It could be a site that no one else has ever seen. You might have uncovered a fact that has long been forgotten, or unearthed some relic of the past that could rewrite history. It might be information that would be damaging to the people who or force that consigned you to exile, and hence the reason for your return to society.',
    source: 'other',
  },
  proficiencies: [
    {
      type: 'Skill',
      name: 'Medicine',
    },
    {
      type: 'Skill',
      name: 'Religion',
    },
    {
      type: 'Tool',
      name: 'Herbalism kit',
    },
    {
      type: 'Language',
      name: 'Any one language',
    },
  ],
});
