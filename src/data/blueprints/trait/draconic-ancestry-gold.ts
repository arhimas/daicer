import { defineTrait } from '../../../features/genesis-core/blueprints';

export default defineTrait({
  slug: 'draconic-ancestry-gold',
  name: 'Draconic Ancestry (Gold)',
  compilation_state: {
    status: 'Valid',
    hash: 'f62b8a9c123d',
    last_run: '2023-10-27T10:00:00Z',
    summary: 'Parsed from 5e SRD reference for Gold Dragonborn ancestry.',
  },
  description:
    "You have draconic ancestry. Your breath weapon and damage resistance are determined by the dragon type. For a Gold dragon, your Damage Type is Fire and your Breath Weapon is a 15 ft. cone. When you use your breath weapon, each creature in the area of the exhalation must make a Dexterity saving throw. The DC for this saving throw equals 8 + your Constitution modifier + your proficiency bonus. A creature takes 2d6 damage on a failed save, and half as much damage on a successful one. The damage increases to 3d6 at 6th level, 4d6 at 11th level, and 5d6 at 16th level. After you use your breath weapon, you can't use it again until you complete a short or long rest. Additionally, you have resistance to fire damage.",
  embedding: {},
  image: '',
  proficiencies: [],
  races: ['dragonborn'],
});
