import { SeedRace } from '@/genesis/schemas/atoms';

export const RACES: SeedRace[] = [
  {
    name: 'Dwarf',
    slug: 'dwarf',
    description: 'Bold and hardy, dwarves are known for their skilled warfare, mining, and stonecrafting.',
    speed: 25,
    size: 'Medium',
    traits: ['darkvision', 'dwarven-resilience'],
  },
  {
    name: 'Elf',
    slug: 'elf',
    description: 'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    speed: 30,
    size: 'Medium',
    traits: ['darkvision', 'fey-ancestry', 'trance', 'keen-senses'],
  },
  {
    name: 'Human',
    slug: 'human',
    description: 'Humans are the most adaptable and ambitious people among the common races.',
    speed: 30,
    size: 'Medium',
    traits: [],
  },
  {
    name: 'Halfling',
    slug: 'halfling',
    description: 'The modest halflings love peace and quiet and good tilled earth.',
    speed: 25,
    size: 'Small',
    traits: [],
  },
];
