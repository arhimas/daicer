const fs = require('fs');
const path = require('path');

const entities = [
  'aberration', 'celestial', 'construct', 'dragon', 'elemental',
  'fey', 'fiend', 'giant', 'monstrosity', 'plant', 'undead'
];

const items = [
  'consumable', 'tool', 'loot', 'spell-scroll', 'feature', 'container',
  'wondrous-item', 'rod', 'staff'
];

const targetDir = path.join(__dirname, '../data/blueprints/blueprint');

const gridTemplate = `[
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "             XXXXXX             ",
  "            XXXXXXXX            ",
  "           XXXXXXXXXX           ",
  "          XXXXXXXXXXXX          ",
  "          XXXXXXXXXXXX          ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "         XXXXXXXXXXXXXX         ",
  "          XXXXXXXXXXXX          ",
  "          XXXXXXXXXXXX          ",
  "           XXXXXXXXXX           ",
  "            XXXXXXXX            ",
  "             XXXXXX             ",
  "                                ",
  "                                ",
  "                                ",
  "                                ",
  "                                "
].map(row => row.split(''))`;

const generateBlueprint = (slug, category) => {
  const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const content = `import { defineBlueprint } from '@/features/genesis-core/blueprints';

export default defineBlueprint({
  name: '${name}',
  slug: '${slug}',
  category: '${category}',
  grid: ${gridTemplate},
  zones: ["core"],
  mapping: {
    "X": "core"
  },
  anchors: {
    "core": [16, 16]
  }
});
`;

  const filePath = path.join(targetDir, slug + '.ts');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Created " + filePath);
  }
};

entities.forEach(type => generateBlueprint(type, 'Creature'));
items.forEach(type => generateBlueprint(type, 'Item'));
