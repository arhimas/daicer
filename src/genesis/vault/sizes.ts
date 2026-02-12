import { Size } from '@/genesis/schemas/size';

export const SIZES: Size[] = [
  {
    name: 'Fine',
    slug: 'fine',
    order: 1,
    instruction: `
    SIZE: FINE
    - The entity is negligible in size (under 6 inches).
    - CONSTRAINT: You MUST confine the non-empty blueprint cells to the CENTER 20% of the grid.
    - LEAVE MASSIVE PADDING (transparent/none) around the edges.
    - Represents insects, tiny constructs, etc.
    `,
  },
  {
    name: 'Diminutive',
    slug: 'diminutive',
    order: 2,
    instruction: `
    SIZE: DIMINUTIVE
    - The entity is extremely small (6 inches to 1 ft).
    - CONSTRAINT: You MUST confine the non-empty blueprint cells to the CENTER 30% of the grid.
    - LEAVE SIGNIFICANT PADDING (transparent/none) around the edges.
    - Represents familiar-sized creatures, rats, etc.
    `,
  },
  {
    name: 'Tiny',
    slug: 'tiny',
    order: 3,
    instruction: `
    SIZE: TINY
    - The entity is very small (approx 1-2 ft).
    - CONSTRAINT: You MUST confine the non-empty blueprint cells to the CENTER 40% of the grid.
    - LEAVE WIDE PADDING (transparent/none) around the edges.
    - Represents cats, imps, sprites.
    `,
  },
  {
    name: 'Small',
    slug: 'small',
    order: 4,
    instruction: `
    SIZE: SMALL
    - The entity is small (approx 3-4 ft).
    - CONSTRAINT: You MUST confine the non-empty blueprint cells to the CENTER 60% of the grid.
    - LEAVE PADDING (transparent/none) around the edges.
    - Represents halflings, goblins, small dogs.
    `,
  },
  {
    name: 'Medium',
    slug: 'medium',
    order: 5,
    instruction: `
    SIZE: MEDIUM
    - The entity is Standard human-sized (5ft square).
    - CONSTRAINT: Fill the grid comfortably, leaving slight padding for aesthetics.
    - Represents humans, elves, orcs, dwarves.
    `,
  },
  {
    name: 'Large',
    slug: 'large',
    order: 6,
    instruction: `
    SIZE: LARGE
    - The entity is Large (10x10 ft space).
    - CONSTRAINT: FILL the grid significantly. Push towards the edges.
    - Represents ogres, horses, large trolls.
    `,
  },
  {
    name: 'Huge',
    slug: 'huge',
    order: 7,
    instruction: `
    SIZE: HUGE
    - The entity is Huge (15x15 ft space).
    - CONSTRAINT: FILL THE GRID COMPLETELY. Minimal padding.
    - Represents giants, young dragons, treants.
    `,
  },
  {
    name: 'Gargantuan',
    slug: 'gargantuan',
    order: 8,
    instruction: `
    SIZE: GARGANTUAN
    - The entity is Gargantuan (20x20 ft or larger).
    - CONSTRAINT: FILL THE GRID COMPLETELY. NO PADDING. TOUCH THE EDGES.
    - Represents ancient dragons, purple worms, kraken.
    `,
  },
  {
    name: 'Colossal',
    slug: 'colossal',
    order: 9,
    instruction: `
    SIZE: COLOSSAL
    - The entity is Colossal (64 ft+).
    - CONSTRAINT: ABSOLUTE CAPACITY. THE SPRITE SHOULD FEEL LIKE IT IS BURSTING OUT OF THE FRAME.
    - Represents tarrasques, titan-level constructs.
    `,
  },
];
