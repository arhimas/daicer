import { defineTrait } from '@/features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-bronze',
  name: 'Draconic Ancestry (Bronze)',
  compilation_state: {
    status: 'Valid',
  },
  description:
    'You have draconic ancestry. Your breath weapon and damage resistance are determined by the dragon type. As a Bronze dragonborn, you have resistance to lightning damage and your breath weapon is a 5 by 30 ft. line of lightning. When you use your breath weapon, each creature in the area of the exhalation must make a Dexterity saving throw. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can’t use it again until you complete a short or long rest.',
  proficiencies: [],
  races: ['dragonborn'],
});
