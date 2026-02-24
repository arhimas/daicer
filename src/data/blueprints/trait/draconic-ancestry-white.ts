import { defineTrait } from '../../../features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-white',
  name: 'Draconic Ancestry (White)',
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
  description:
    'You have draconic ancestry. Your breath weapon and damage resistance are determined by the dragon type. For the white dragon, your damage type is Cold and your breath weapon is a 15-foot cone. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can’t use it again until you complete a short or long rest. Additionally, you have resistance to cold damage.',
  proficiencies: [],
  races: ['dragonborn'],
});
