import { SeedTrait } from '@/genesis/schemas/atoms';

export const TRAITS: SeedTrait[] = [
  {
    slug: 'darkvision',
    name: 'Darkvision',
    type: 'racial',
    description:
      "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.",
  },
  {
    slug: 'fey-ancestry',
    name: 'Fey Ancestry',
    type: 'racial',
    description: "You have advantage on saving throws against being charmed, and magic can't put you to sleep.",
  },
  {
    slug: 'trance',
    name: 'Trance',
    type: 'racial',
    description:
      'Elves don\'t need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day. (The Common word for such meditation is "trance.") While meditating, you can dream after a fashion; such dreams are actually mental exercises that have become reflexive through years of practice. After resting in this way, you gain the same benefit that a human does from 8 hours of sleep.',
  },
  {
    slug: 'keen-senses',
    name: 'Keen Senses',
    type: 'racial',
    description: 'You have proficiency in the Perception skill.',
  },
  {
    slug: 'dwarven-resilience',
    name: 'Dwarven Resilience',
    type: 'racial',
    description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.',
  },
];
