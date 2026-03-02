import { defineFeature } from '@/features/genesis-core/blueprints';

export default defineFeature({
  slug: 'cutting-words',
  name: 'Cutting Words',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from SRD reference data.',
  },
  description:
    "At 3rd level, you learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of you makes an attack roll, an ability check, or a damage roll, you can use your reaction to expend one of your uses of Bardic Inspiration, rolling a Bardic Inspiration die and subtracting the number rolled from the creature's roll. You can choose to use this feature after the creature makes its roll, but before the GM determines whether the attack roll or ability check succeeds or fails, or before the creature deals its damage. The creature is immune if it can't hear you or if it's immune to being charmed.",
  level: 3,
  lore: "A sharp tongue can be more dangerous than any blade, especially when timed perfectly to shatter an opponent's resolve.",
  tags: ['bard', 'college-of-lore'],
});
