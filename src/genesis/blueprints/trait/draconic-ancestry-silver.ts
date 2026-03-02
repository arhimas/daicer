import { defineTrait } from '@/features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-silver',
  name: 'Draconic Ancestry (Silver)',
  compilation_state: {
    status: 'Valid',
    hash: '8f2e1a3b',
    last_run: '2023-10-27T12:00:00Z',
    summary: 'Successfully generated from reference data.',
  },
  description:
    "You have draconic ancestry. Your breath weapon and damage resistance are determined by the dragon type. As a Silver Dragonborn, your damage type is Cold. Your breath weapon is a 15-foot cone. When you use your breath weapon, each creature in the area of the exhalation must make a Dexterity saving throw. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can't use it again until you complete a short or long rest. You have resistance to cold damage.",
  embedding: {},
  image: '',
  proficiencies: [],
  races: ['dragonborn'],
});
