import { defineRace } from '../../../features/genesis-core/blueprints';

export default defineRace({
  slug: 'elf',
  name: 'Elf',
  description:
    "Elves love freedom, variety, and self-expression, so they lean strongly toward the gentler aspects of chaos. They value and protect others' freedom as well as their own, and they are more often good than not. Although elves reach physical maturity at about the same age as humans, the elven understanding of adulthood goes beyond physical growth to encompass worldly experience. An elf typically claims adulthood and an adult name around the age of 100 and can live to be 750 years old. Elves range from under 5 to over 6 feet tall and have slender builds. You can speak, read, and write Common and Elvish. Elvish is fluid, with subtle intonations and intricate grammar. Elven literature is rich and varied, and their songs and poems are famous among other races. Ability Score Bonus: Dexterity +2.",
  size: 'Medium',
  speed: {},
  traits: ['darkvision', 'fey-ancestry', 'trance', 'keen-senses'],
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully mapped from reference data.',
  },
});
