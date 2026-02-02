const { createStrapi } = require('@strapi/strapi');

// 1. Definition of Entity Zones with Categories
const ENTITY_ZONES = [
  // Creature Zones
  { name: 'Core', slug: 'core', color: '#FFFFFF', description: 'The central body mass.', category: 'Creature' },
  { name: 'Head', slug: 'head', color: '#FFFF00', description: 'The sensory or command unit.', category: 'Creature' },
  { name: 'Weapon', slug: 'weapon', color: '#FF0000', description: 'Held offensive tool.', category: 'Creature' },
  { name: 'Legs', slug: 'legs', color: '#0000FF', description: 'Locomotion components.', category: 'Creature' },
  { name: 'Hand (L)', slug: 'hand_l', color: '#00FF00', description: 'Left manipulator.', category: 'Creature' },
  { name: 'Hand (R)', slug: 'hand_r', color: '#00FF00', description: 'Right manipulator.', category: 'Creature' },
  { name: 'Accessory', slug: 'accessory', color: '#FF00FF', description: 'Attachments.', category: 'Creature' },
  
  // Item Zones
  { name: 'Blade', slug: 'blade', color: '#C0C0C0', description: 'Sharp cutting surface.', category: 'Item' },
  { name: 'Hilt', slug: 'hilt', color: '#8B4513', description: 'Handle or geometric grip.', category: 'Item' },
  { name: 'Container', slug: 'container', color: '#ADD8E6', description: 'Fluid or storage vessel.', category: 'Item' },
  { name: 'Liquid', slug: 'liquid', color: '#32CD32', description: 'Consumable fluid.', category: 'Item' },

  // Terrain/Structure Zones
  { name: 'Wall', slug: 'wall', color: '#808080', description: 'Impassable barrier.', category: 'Structure' },
  { name: 'Floor', slug: 'floor', color: '#2E8B57', description: 'Walkable surface.', category: 'Terrain' }, // Renamed Ground->Floor
  
  // Special
  { name: 'None', slug: 'none', color: 'transparent', description: 'Empty space.', category: 'Effect' },
];

// Characters used in procedural generation logic
const CHARS = {
  EMPTY: '.',
  // Creature Maps
  CORE: '#',
  HEAD: 'O',
  LEGS: 'L',
  LIMB_L: 'l',
  LIMB_R: 'r',
  WEAPON: 'X',
  ACCESSORY: '+',
  // Item Maps
  BLADE: 'B',
  HILT: 'H',
  CONTAINER: 'U',
  LIQUID: '~',
  // Terrain Maps
  WALL: 'W',
  FLOOR: '_', // Renamed
};

// Map Chars to Hex Colors (Must match ENTITY_ZONES colors for consistency)
const CHAR_TO_COLOR = {
  [CHARS.EMPTY]: 'transparent',
  ' ': 'transparent',
  [CHARS.CORE]: '#FFFFFF',
  [CHARS.HEAD]: '#FFFF00',
  [CHARS.LEGS]: '#0000FF',
  [CHARS.LIMB_L]: '#00FF00',
  [CHARS.LIMB_R]: '#00FF00',
  [CHARS.WEAPON]: '#FF0000',
  [CHARS.ACCESSORY]: '#FF00FF',
  
  [CHARS.BLADE]: '#C0C0C0',
  [CHARS.HILT]: '#8B4513',
  [CHARS.CONTAINER]: '#ADD8E6',
  [CHARS.LIQUID]: '#32CD32',

  [CHARS.WALL]: '#808080',
  [CHARS.FLOOR]: '#2E8B57',
};

// Map Chars to Zone Slugs for Auto-Linking
const CHAR_TO_ZONE_SLUG = {
  [CHARS.CORE]: 'core',
  [CHARS.HEAD]: 'head',
  [CHARS.LEGS]: 'legs',
  [CHARS.LIMB_L]: 'hand_l',
  [CHARS.LIMB_R]: 'hand_r',
  [CHARS.WEAPON]: 'weapon',
  [CHARS.ACCESSORY]: 'accessory',
  [CHARS.BLADE]: 'blade',
  [CHARS.HILT]: 'hilt',
  [CHARS.CONTAINER]: 'container',
  [CHARS.LIQUID]: 'liquid',
  [CHARS.WALL]: 'wall',
  [CHARS.FLOOR]: 'floor',
};

// --- Procedural Generation Logic ---

const createGrid = (size) =>
  Array(size)
    .fill(null)
    .map(() => Array(size).fill(CHARS.EMPTY));

const circle = (grid, cx, cy, r, char) => {
  const size = grid.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) {
        if (y >= 0 && y < size && x >= 0 && x < size) grid[y][x] = char;
      }
    }
  }
};

const rect = (grid, x, y, w, h, char) => {
  const size = grid.length;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      if (y + i < size && x + j < size) grid[y + i][x + j] = char;
    }
  }
};

const line = (grid, x1, y1, x2, y2, char) => {
  let x = x1,
    y = y1;
  const dx = Math.abs(x2 - x1),
    sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1),
    sy = y1 < y2 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    if (x >= 0 && x < grid.length && y >= 0 && y < grid.length) grid[y][x] = char;
    if (x === x2 && y === y2) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
};

const generateHumanoid = (size, weaponType = 'none') => {
  const grid = createGrid(size);
  const cx = Math.floor(size / 2);
  const scale = size / 32;

  // Head
  circle(grid, cx, Math.floor(size * 0.2), 3 * scale, CHARS.HEAD);
  // Body
  rect(
    grid,
    cx - Math.floor(4 * scale),
    Math.floor(size * 0.3),
    Math.floor(8 * scale),
    Math.floor(10 * scale),
    CHARS.CORE
  );
  // Legs
  rect(
    grid,
    cx - Math.floor(4 * scale),
    Math.floor(size * 0.6),
    Math.floor(3 * scale),
    Math.floor(10 * scale),
    CHARS.LEGS
  );
  rect(
    grid,
    cx + Math.floor(1 * scale),
    Math.floor(size * 0.6),
    Math.floor(3 * scale),
    Math.floor(10 * scale),
    CHARS.LEGS
  );
  // Arms
  line(
    grid,
    cx - Math.floor(4 * scale),
    Math.floor(size * 0.35),
    cx - Math.floor(10 * scale),
    Math.floor(size * 0.5),
    CHARS.LIMB_L
  );
  line(
    grid,
    cx + Math.floor(4 * scale),
    Math.floor(size * 0.35),
    cx + Math.floor(10 * scale),
    Math.floor(size * 0.5),
    CHARS.LIMB_R
  );

  // Weapon (using Creature Weapon Zone)
  if (weaponType === 'sword') {
    line(
      grid,
      cx + Math.floor(10 * scale),
      Math.floor(size * 0.5),
      cx + Math.floor(10 * scale),
      Math.floor(size * 0.2),
      CHARS.WEAPON
    );
    line(
      grid,
      cx + Math.floor(8 * scale),
      Math.floor(size * 0.45),
      cx + Math.floor(12 * scale),
      Math.floor(size * 0.45),
      CHARS.WEAPON
    );
  } else if (weaponType === 'axe') {
    line(
      grid,
      cx + Math.floor(10 * scale),
      Math.floor(size * 0.5),
      cx + Math.floor(10 * scale),
      Math.floor(size * 0.2),
      CHARS.WEAPON
    );
    circle(grid, cx + Math.floor(10 * scale), Math.floor(size * 0.25), 3 * scale, CHARS.WEAPON);
  }
  return grid;
};

const generateSword = (size) => {
  const grid = createGrid(size);
  const cx = Math.floor(size / 2);
  // Uses ITEM zones
  line(grid, cx, Math.floor(size * 0.8), cx, Math.floor(size * 0.1), CHARS.BLADE);
  line(grid, cx - 4, Math.floor(size * 0.7), cx + 4, Math.floor(size * 0.7), CHARS.HILT);
  line(grid, cx, Math.floor(size * 0.7), cx, Math.floor(size * 0.9), CHARS.HILT);
  return grid;
};

const generatePotion = (size) => {
  const grid = createGrid(size);
  const cx = Math.floor(size / 2);
  const cy = Math.floor(size / 2);
  // Uses ITEM zones
  circle(grid, cx, cy + 4, 6, CHARS.LIQUID);
  rect(grid, cx - 2, cy - 6, 4, 6, CHARS.CONTAINER);
  rect(grid, cx - 3, cy - 8, 6, 2, CHARS.CONTAINER);
  return grid;
};

const generateTerrain = (size, type) => {
  const grid = createGrid(size);
  // Uses TERRAIN/STRUCTURE zones
  if (type === 'wall') {
    rect(grid, 0, 0, size, size, CHARS.WALL);
    rect(grid, 2, 2, size - 4, size - 4, CHARS.FLOOR); // Decorate center with floor
  } else {
    // SOLID FLOOR as requested
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid[y][x] = CHARS.FLOOR; // No noise, pure floor
      }
    }
  }
  return grid;
};

// --- Execution ---

async function seed() {
  const app = await createStrapi({ distDir: './dist' }).load();

  try {
    // 0. CLEAN (Wipe existing)
    console.log('🧹 Cleaning existing Blueprints and Zones...');
    try {
      await app.db.query('api::blueprint.blueprint').deleteMany({ where: {} });
      await app.db.query('api::entity-zone.entity-zone').deleteMany({ where: {} });
      console.log('   ✨ Database Cleaned.');
    } catch (err) {
      console.log('   ⚠️  Clean skipped (maybe first run):', err.message);
    }

    // 1. SEED ZONES
    console.log('🌱 Seeding Entity Zones...');
    const zoneMap = {}; // name -> id (Wait, we need map by SLUG to link easily)
    
    for (const zone of ENTITY_ZONES) {
      // Since we wiped, we can just create. But strict check is safer.
      const existing = await app.db.query('api::entity-zone.entity-zone').findOne({
        where: { slug: zone.slug },
      });
      let dbZone;
      if (!existing) {
        dbZone = await app.db.query('api::entity-zone.entity-zone').create({ data: zone });
      } else {
        dbZone = await app.db.query('api::entity-zone.entity-zone').update({
          where: { id: existing.id },
          data: zone,
        });
      }
      zoneMap[zone.slug] = dbZone.id;
    }

    console.log('🌱 Generating Blueprints...');
    const blueprints = [
      // Static Examples
      {
        name: 'Slime Mass',
        category: 'Creature', 
        description: 'Amorphous blob.',
        layout: [
          '......##......',
          '....######....',
          '...########...',
          '...########...',
          '....######....',
          '......##......',
        ],
      },
    ];

    // Procedural - Humanoids
    ['Medium', 'Large'].forEach((sizeName) => {
      const dim = sizeName === 'Medium' ? 32 : 64;
      ['unarmed', 'sword', 'axe'].forEach((wep) => {
        const weaponLabel = wep.charAt(0).toUpperCase() + wep.slice(1);
        blueprints.push({
          name: `Humanoid Fighter (${sizeName}, ${weaponLabel})`,
          category: 'Creature',
          description: `A procedurally generated ${sizeName.toLowerCase()} humanoid fighter wielding a ${wep}.`,
          grid: generateHumanoid(dim, wep), // Returns string[][] of chars
        });
      });
    });

    // Procedural - Weapons
    ['Longsword', 'Dagger'].forEach((w, i) => {
      blueprints.push({
        name: `Weapon: ${w}`,
        category: 'Item',
        description: `A distinct, procedurally generated ${w} design.`,
        grid: generateSword(32 + i * 16),
      });
    });

    // Procedural - Potions
    ['Health', 'Mana'].forEach((p) => {
      blueprints.push({
        name: `Potion of ${p}`,
        category: 'Item',
        description: `A vial containing a ${p.toLowerCase()} restoring liquid.`,
        grid: generatePotion(32),
      });
    });

    // Procedural - Terrain
    ['Stone_Wall', 'Dirt_Floor'].forEach((t) => {
      const readable = t.replace('_', ' ');
      blueprints.push({
        name: readable,
        category: t.includes('Wall') ? 'Structure' : 'Terrain',
        description: `Standard 32x32 ${readable.toLowerCase()} tile.`,
        grid: generateTerrain(32, t.includes('Wall') ? 'wall' : 'floor'),
      });
    });

    console.log(`🌱 Seeding ${blueprints.length} Visual Blueprints (converting ASCII/Chars to Hex & Linking Zones)...`);

    for (const bp of blueprints) {
      let hexGrid;
      let rawChars = [];

      // Handle Static Layout (string[]) vs Procedural Grid (string[][])
      if (bp.layout) {
        hexGrid = bp.layout.map((row) => row.split('').map((char) => {
          rawChars.push(char);
          return CHAR_TO_COLOR[char] || 'transparent';
        }));
      } else if (bp.grid) {
        hexGrid = bp.grid.map((row) => row.map((char) => {
          rawChars.push(char);
          return CHAR_TO_COLOR[char] || 'transparent';
        }));
      }

      // Auto-Scan for Zones
      const presentZoneSlugs = new Set();
      rawChars.forEach(char => {
         const slug = CHAR_TO_ZONE_SLUG[char];
         if (slug) presentZoneSlugs.add(slug);
      });
      
      const zoneIds = Array.from(presentZoneSlugs).map(slug => zoneMap[slug]).filter(Boolean);

      const payload = {
        name: bp.name,
        category: bp.category,
        description: bp.description,
        grid: hexGrid, // STORE COLORS
        zones: zoneIds, // LINK ZONES
      };

      await app.db.query('api::blueprint.blueprint').create({ data: payload });
      console.log(`  + Created: ${bp.name} | Zones: [${Array.from(presentZoneSlugs).join(', ')}]`);
    }
  } catch (e) {
    console.error('Seeding failed:', e);
    throw e;
  } finally {
    app.destroy();
  }
}

seed();
