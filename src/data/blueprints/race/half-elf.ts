import { defineRace } from '@/features/genesis-core/blueprints';

export default defineRace({
  slug: 'half-elf',
  name: 'Half-Elf',
  description:
    "Half-elves mature at the same rate humans do and reach adulthood around the age of 20. They live much longer than humans, however, often exceeding 180 years. Half-elves share the chaotic bent of their elven heritage. They value both personal freedom and creative expression, demonstrating neither love of leaders nor desire for followers. They chafe at rules, resent others' demands, and sometimes prove unreliable, or at least unpredictable. Half-elves are about the same size as humans, ranging from 5 to 6 feet tall. Your Charisma score increases by 2. You can speak, read, and write Common, Elvish, and one extra language of your choice.",
  size: 'Medium',
  speed: {},
  traits: ['darkvision', 'fey-ancestry', 'skill-versatility'],
  proficiencies: [],
  compilation_state: {
    status: 'Valid',
    summary: 'Successfully generated from reference data.',
  },
  embedding: {},
  image: '',
});
