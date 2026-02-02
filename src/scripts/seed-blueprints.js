
const { createStrapi } = require('@strapi/strapi');

// 1. Definition of Entity Zones (for DB) and Character Map (for Generation)
const ENTITY_ZONES = [
    { name: 'Core', slug: 'core', color: '#FFFFFF', description: 'The central body mass or structural foundation.' },
    { name: 'Head', slug: 'head', color: '#FFFF00', description: 'The sensory or command processing unit.' },
    { name: 'Weapon', slug: 'weapon', color: '#FF0000', description: 'Offensive capabilities or dangerous extremities.' },
    { name: 'Legs', slug: 'legs', color: '#0000FF', description: 'Locomotion and stability components.' },
    { name: 'Hand (L)', slug: 'hand_l', color: '#00FF00', description: 'Left manipulator or grasp point.' },
    { name: 'Hand (R)', slug: 'hand_r', color: '#00FF00', description: 'Right manipulator or grasp point.' },
    { name: 'Accessory', slug: 'accessory', color: '#FF00FF', description: 'Decorative or utility attachments.' },
    { name: 'Wall', slug: 'wall', color: '#808080', description: 'Impassable structural barrier.' },
    { name: 'Ground', slug: 'ground', color: '#2E8B57', description: 'Walkable terrain surface.' },
    { name: 'None', slug: 'none', color: 'transparent', description: 'Empty or negative space.' }
];

// Characters used in procedural generation logic
const CHARS = {
    EMPTY: '.',
    CORE: '#',
    HEAD: 'O',
    LEGS: 'L',
    LIMB_L: 'l',
    LIMB_R: 'r',
    WEAPON: 'X',
    ACCESSORY: '+',
    WALL: 'W',
    GROUND: '_'
};

// Map Chars to Hex Colors
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
    [CHARS.WALL]: '#808080',
    [CHARS.GROUND]: '#2E8B57'
};

// --- Procedural Generation Logic ---

const createGrid = (size) => Array(size).fill(null).map(() => Array(size).fill(CHARS.EMPTY));

const circle = (grid, cx, cy, r, char) => {
    const size = grid.length;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if ((x-cx)**2 + (y-cy)**2 <= r**2) {
                if(y >=0 && y < size && x >=0 && x < size) grid[y][x] = char;
            }
        }
    }
};

const rect = (grid, x, y, w, h, char) => {
    const size = grid.length;
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if(y+i < size && x+j < size) grid[y+i][x+j] = char;
        }
    }
};

const line = (grid, x1, y1, x2, y2, char) => {
    let x = x1, y = y1;
    const dx = Math.abs(x2 - x1), sx = x1 < x2 ? 1 : -1;
    const dy = -Math.abs(y2 - y1), sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;
    while (true) {
        if(x >= 0 && x < grid.length && y >= 0 && y < grid.length) grid[y][x] = char;
        if (x === x2 && y === y2) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x += sx; }
        if (e2 <= dx) { err += dx; y += sy; }
    }
};

const generateHumanoid = (size, weaponType = 'none') => {
    const grid = createGrid(size);
    const cx = Math.floor(size / 2);
    const scale = size / 32;

    // Head
    circle(grid, cx, Math.floor(size * 0.2), 3 * scale, CHARS.HEAD);
    // Body
    rect(grid, cx - Math.floor(4*scale), Math.floor(size*0.3), Math.floor(8*scale), Math.floor(10*scale), CHARS.CORE);
    // Legs
    rect(grid, cx - Math.floor(4*scale), Math.floor(size*0.6), Math.floor(3*scale), Math.floor(10*scale), CHARS.LEGS);
    rect(grid, cx + Math.floor(1*scale), Math.floor(size*0.6), Math.floor(3*scale), Math.floor(10*scale), CHARS.LEGS);
    // Arms
    line(grid, cx - Math.floor(4*scale), Math.floor(size*0.35), cx - Math.floor(10*scale), Math.floor(size*0.5), CHARS.LIMB_L);
    line(grid, cx + Math.floor(4*scale), Math.floor(size*0.35), cx + Math.floor(10*scale), Math.floor(size*0.5), CHARS.LIMB_R);

    // Weapon
    if (weaponType === 'sword') {
         line(grid, cx + Math.floor(10*scale), Math.floor(size*0.5), cx + Math.floor(10*scale), Math.floor(size*0.2), CHARS.WEAPON);
         line(grid, cx + Math.floor(8*scale), Math.floor(size*0.45), cx + Math.floor(12*scale), Math.floor(size*0.45), CHARS.WEAPON);
    } else if (weaponType === 'axe') {
         line(grid, cx + Math.floor(10*scale), Math.floor(size*0.5), cx + Math.floor(10*scale), Math.floor(size*0.2), CHARS.WEAPON);
         circle(grid, cx + Math.floor(10*scale), Math.floor(size*0.25), 3*scale, CHARS.WEAPON);
    }
    return grid;
};

const generateSword = (size) => {
    const grid = createGrid(size);
    const cx = Math.floor(size / 2);
    line(grid, cx, Math.floor(size*0.8), cx, Math.floor(size*0.1), CHARS.WEAPON);
    line(grid, cx-4, Math.floor(size*0.7), cx+4, Math.floor(size*0.7), CHARS.CORE);
    line(grid, cx, Math.floor(size*0.7), cx, Math.floor(size*0.9), CHARS.ACCESSORY);
    return grid;
};

const generatePotion = (size) => {
    const grid = createGrid(size);
    const cx = Math.floor(size / 2);
    const cy = Math.floor(size / 2);
    circle(grid, cx, cy+4, 6, CHARS.CORE);
    rect(grid, cx-2, cy-6, 4, 6, CHARS.ACCESSORY);
    rect(grid, cx-3, cy-8, 6, 2, CHARS.HEAD);
    return grid;
};

const generateTerrain = (size, type) => {
    const grid = createGrid(size);
    if (type === 'wall') {
        rect(grid, 0, 0, size, size, CHARS.WALL);
        rect(grid, 2, 2, size-4, size-4, CHARS.CORE);
    } else {
        for(let y=0; y<size; y++) {
            for(let x=0; x<size; x++) {
                if(Math.random() > 0.3) grid[y][x] = CHARS.GROUND;
            }
        }
    }
    return grid;
};

// --- Execution ---

async function seed() {
    const app = await createStrapi({ distDir: './dist' }).load();
    
    try {
        console.log('🌱 Seeding Entity Zones...');
        for (const zone of ENTITY_ZONES) {
            const existing = await app.db.query('api::entity-zone.entity-zone').findOne({
                where: { slug: zone.slug }
            });
            if (!existing) {
                await app.db.query('api::entity-zone.entity-zone').create({ data: zone });
            } else {
                 await app.db.query('api::entity-zone.entity-zone').update({
                    where: { id: existing.id },
                    data: zone
                });
            }
        }

        console.log('🌱 Generating Blueprints...');
        const blueprints = [
            // Static Examples
            {
                name: 'Humanoid Warrior', category: 'Humanoid', description: 'Standard bipedal fighter.',
                layout: ["......OO......","......OO......",".....####.....","...XX####.....","...XX####.....",".....####.....",".....####.....","....LL..LL....","....LL..LL....","....LL..LL...."]
            },
            {
                name: 'Slime Mass', category: 'Monster', description: 'Amorphous blob.',
                layout: ["......##......","....######....","...########...","...########...","....######....","......##......"]
            }
        ];

        // Procedural - Humanoids
        ['Medium', 'Large', 'Gargantuan'].forEach(sizeName => {
            const dim = sizeName === 'Medium' ? 32 : (sizeName === 'Large' ? 64 : 128);
            ['unarmed', 'sword', 'axe'].forEach(wep => {
                const weaponLabel = wep.charAt(0).toUpperCase() + wep.slice(1);
                blueprints.push({
                    name: `Humanoid Fighter (${sizeName}, ${weaponLabel})`,
                    category: 'Creature',
                    description: `A procedurally generated ${sizeName.toLowerCase()} humanoid fighter wielding a ${wep}.`,
                    grid: generateHumanoid(dim, wep) // Returns string[][] of chars
                });
            });
        });

         // Procedural - Weapons
        ['Longsword', 'Dagger', 'Greatsword'].forEach((w, i) => {
            blueprints.push({
                name: `Weapon: ${w}`,
                category: 'Item',
                description: `A distinct, procedurally generated ${w} design.`,
                grid: generateSword(32 + (i*16))
            });
        });

        // Procedural - Potions
        ['Health', 'Mana', 'Stamina'].forEach(p => {
             blueprints.push({
                name: `Potion of ${p}`,
                category: 'Item',
                description: `A vial containing a ${p.toLowerCase()} restoring liquid.`,
                grid: generatePotion(32)
            });
        });

         // Procedural - Terrain
         ['Stone_Wall', 'Dirt_Floor'].forEach(t => {
            const readable = t.replace('_', ' ');
            blueprints.push({
                name: readable,
                category: 'Terrain',
                description: `Standard 32x32 ${readable.toLowerCase()} tile.`,
                grid: generateTerrain(32, t.includes('Wall') ? 'wall' : 'floor')
            });
         });


        console.log(`🌱 Seeding ${blueprints.length} Visual Blueprints (converting ASCII/Chars to Hex)...`);
        
        for (const bp of blueprints) {
            const existing = await app.db.query('api::blueprint.blueprint').findOne({
                where: { name: bp.name }
            });

            let hexGrid;
            
            // Handle Static Layout (string[]) vs Procedural Grid (string[][])
            if (bp.layout) {
                hexGrid = bp.layout.map(row => 
                    row.split('').map(char => CHAR_TO_COLOR[char] || 'transparent')
                );
            } else if (bp.grid) {
                hexGrid = bp.grid.map(row => 
                    row.map(char => CHAR_TO_COLOR[char] || 'transparent')
                );
            }

            const payload = {
                name: bp.name,
                category: bp.category,
                description: bp.description,
                grid: hexGrid, // STORE COLORS
                zones: {} // Optional legacy
            };

            if (!existing) {
                await app.db.query('api::blueprint.blueprint').create({ data: payload });
                console.log(`  + Created: ${bp.name}`);
            } else {
                await app.db.query('api::blueprint.blueprint').update({
                    where: { id: existing.id },
                    data: payload
                });
               // console.log(`  ~ Updated: ${bp.name}`); // Reduce spam
            }
        }
        
    } catch (e) {
        console.error('Seeding failed:', e);
        throw e;
    } finally {
        app.destroy();
    }
}

seed();
