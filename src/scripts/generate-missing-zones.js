const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../data/blueprints/zone');

const zones = [
  { slug: 'eye', name: 'Eye', symbol: 'E', color: '#E74C3C', category: 'Creature' },
  { slug: 'tentacles', name: 'Tentacles', symbol: 't', color: '#9B59B6', category: 'Creature' },
  { slug: 'halo', name: 'Halo', symbol: 'O', color: '#F1C40F', category: 'Creature' },
  { slug: 'power-core', name: 'Power Core', symbol: 'p', color: '#3498DB', category: 'Creature' },
  { slug: 'stopper', name: 'Stopper', symbol: 'S', color: '#7E5109', category: 'Item' },
  { slug: 'glass', name: 'Glass', symbol: 'g', color: '#D6EAF8', category: 'Item' },
  { slug: 'wood', name: 'Wood', symbol: 'W', color: '#A04000', category: 'Item' },
  { slug: 'lock', name: 'Lock', symbol: 'L', color: '#F39C12', category: 'Item' },
  { slug: 'particles', name: 'Particles', symbol: 'p', color: '#5DADE2', category: 'Creature' },
  { slug: 'gem-shine', name: 'Gem Shine', symbol: 'G', color: '#FDFEFE', category: 'Item' },
  { slug: 'coin', name: 'Coin', symbol: '.', color: '#F4D03F', category: 'Item' },
  { slug: 'coin-edge', name: 'Coin Edge', symbol: 'C', color: '#D4AC0D', category: 'Item' },
  { slug: 'eyes', name: 'Eyes', symbol: 'E', color: '#E74C3C', category: 'Creature' },
  { slug: 'limbs', name: 'Limbs', symbol: 'l', color: '#717D7E', category: 'Creature' },
  { slug: 'stalk', name: 'Stalk', symbol: 's', color: '#27AE60', category: 'Creature' },
  { slug: 'petals', name: 'Petals', symbol: 'p', color: '#E91E63', category: 'Creature' },
  { slug: 'vines', name: 'Vines', symbol: 'v', color: '#58D68D', category: 'Creature' },
  { slug: 'base', name: 'Base', symbol: 'b', color: '#797D7F', category: 'Item' },
  { slug: 'tip', name: 'Tip', symbol: 't', color: '#3498DB', category: 'Item' },
  { slug: 'roll', name: 'Roll', symbol: 'R', color: '#935116', category: 'Item' },
  { slug: 'paper', name: 'Paper', symbol: 'p', color: '#FAE5D3', category: 'Item' },
  { slug: 'text', name: 'Text', symbol: 't', color: '#17202A', category: 'Item' },
  { slug: 'focus-frame', name: 'Focus Frame', symbol: 'f', color: '#F1C40F', category: 'Item' },
  { slug: 'crystal', name: 'Crystal', symbol: 'c', color: '#85C1E9', category: 'Item' },
  { slug: 'grip', name: 'Grip', symbol: '.', color: '#6E2C00', category: 'Item' },
  { slug: 'skull', name: 'Skull', symbol: 's', color: '#E5E7E9', category: 'Creature' },
  { slug: 'ribcage', name: 'Ribcage', symbol: 'r', color: '#D0D3D4', category: 'Creature' },
  { slug: 'chain', name: 'Chain', symbol: 'c', color: '#BDC3C7', category: 'Item' },
  { slug: 'metal', name: 'Metal', symbol: 'M', color: '#95A5A6', category: 'Item' }
];

const generateZone = (zone) => {
  const content = `import { defineEntityZone } from '@/features/genesis-core/blueprints';

export default defineEntityZone({
  name: '${zone.name}',
  slug: '${zone.slug}',
  symbol: '${zone.symbol}',
  color: '${zone.color}',
  description: 'Color palette definition for ${zone.name}',
  category: '${zone.category}'
});
`;

  const filePath = path.join(targetDir, zone.slug + '.ts');
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Created zone " + filePath);
  } else {
    console.log("Zone already exists: " + filePath);
  }
};

zones.forEach(zone => generateZone(zone));
