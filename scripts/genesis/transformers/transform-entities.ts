/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Strict Strapi Component Schema: game.stats
const StatsComponentSchema = z.object({
  strength: z.number().default(10),
  dexterity: z.number().default(10),
  constitution: z.number().default(10),
  intelligence: z.number().default(10),
  wisdom: z.number().default(10),
  charisma: z.number().default(10),
  walkSpeed: z.number().default(0),
  flySpeed: z.number().default(0),
  swimSpeed: z.number().default(0),
  climbSpeed: z.number().default(0),
  burrowSpeed: z.number().default(0),
  hover: z.boolean().default(false),
  saves: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  passivePerception: z.number().optional(),
  darkvision: z.number().optional(),
  blindsight: z.number().optional(),
  truesight: z.number().optional(),
  tremorsense: z.number().optional(),
});

// Strict Strapi Content-Type Schema: api::entity.entity
const EntitySchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  size: z
    .enum(['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'])
    .default('Medium'),
  type: z.string().optional(),
  alignment: z.string().optional(),
  level: z.number().default(1),
  ac: z.number().optional(),
  hp: z.number().optional(),
  hit_dice: z.string().optional(),
  challenge_rating: z.number().optional(),
  xp: z.number().optional(),
  stats: StatsComponentSchema,
  actions: z.array(z.string()).optional(), // Relation array of UID slugs
  legendary_actions: z.array(z.string()).optional(), // Relation array of UID slugs
  spells: z.array(z.string()).optional(), // Relation array of UID slugs
});

function parseStatsNumber(str: string, regex: RegExp): number {
  const match = str.match(regex);
  return match ? parseInt(match[1], 10) : 10;
}

function parseSpeedNumber(str: string, type: string): number {
  const regex = new RegExp(`(\\d+)\\s*ft\\.?\\s*${type}`, 'i');
  const match = str.match(regex);
  return match ? parseInt(match[1], 10) : 0;
}

function parseSenseNumber(str: string, type: string): number {
  const regex = new RegExp(`${type}\\s*(\\d+)`, 'i');
  const match = str.match(regex);
  return match ? parseInt(match[1], 10) : 0;
}

function mapSize(size: string): any {
  const map: Record<string, string> = {
    tiny: 'Tiny',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    huge: 'Huge',
    gargantuan: 'Gargantuan',
  };
  return map[size.toLowerCase()] || 'Medium';
}

function parseFraction(val: any): number {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  if (val.includes('/')) {
    const [num, den] = val.split('/');
    return (parseFloat(num) || 0) / (parseFloat(den) || 1);
  }
  return parseFloat(val) || 0;
}

async function transformEntities() {
  console.log('🔄 Starting Entity Transformation (Monster Blueprints -> Strapi Entities)');
  const monstersDir = path.join(process.cwd(), 'seed-data', 'monster');
  const entitiesDir = path.join(process.cwd(), 'seed-data', 'entity');
  const actionsDir = path.join(process.cwd(), 'seed-data', 'action');

  await fs.mkdir(entitiesDir, { recursive: true });

  let files: string[] = [];
  try {
    files = await fs.readdir(monstersDir);
  } catch {
    console.log('No monsters found to transform.');
    return;
  }

  // Load all available extracted actions to link them
  let availableActions: string[] = [];
  try {
    availableActions = await fs.readdir(actionsDir);
    availableActions = availableActions.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  } catch (e) {
    console.warn('⚠️ No extracted actions found. Run extract-actions python script first.');
  }

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(monstersDir, file);
    let rawData = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    // Handle LLM nesting (e.g., { "monster": { ... } })
    if (rawData.monster && !rawData.slug) rawData = rawData.monster;

    // Fallback slug and name from filename
    const fallbackSlug = file.replace('.json', '');
    const fallbackName = fallbackSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Extractor logic (safeguard against LLM outputting objects/arrays instead of strings)
    const statStr = typeof rawData.stats === 'string' ? rawData.stats : JSON.stringify(rawData.stats || '');
    const speedStr = typeof rawData.speed === 'string' ? rawData.speed : JSON.stringify(rawData.speed || '');
    const senseStr = typeof rawData.senses === 'string' ? rawData.senses : JSON.stringify(rawData.senses || '');
    const profStr =
      typeof rawData.proficiencies === 'string' ? rawData.proficiencies : JSON.stringify(rawData.proficiencies || '');

    // Find linked actions for this monster
    const monsterActions = availableActions.filter((a) => a.startsWith(`${fallbackSlug}-`));
    // Simple heuristic: If the action name contains "legendary", it's a legendary action
    const legendaryRefs = monsterActions.filter(
      (a) =>
        a.includes('legendary-action') ||
        a.includes('-costs-') ||
        (rawData.legendary_actions &&
          typeof rawData.legendary_actions === 'string' &&
          rawData.legendary_actions.toLowerCase().includes(a.replace(`${fallbackSlug}-`, '').replace(/-/g, ' ')))
    );
    const standardRefs = monsterActions.filter((a) => !legendaryRefs.includes(a));

    // Build stats component
    const stats = {
      strength: parseStatsNumber(statStr, /strength\s+(\d+)/i),
      dexterity: parseStatsNumber(statStr, /dexterity\s+(\d+)/i),
      constitution: parseStatsNumber(statStr, /constitution\s+(\d+)/i),
      intelligence: parseStatsNumber(statStr, /intelligence\s+(\d+)/i),
      wisdom: parseStatsNumber(statStr, /wisdom\s+(\d+)/i),
      charisma: parseStatsNumber(statStr, /charisma\s+(\d+)/i),

      walkSpeed: parseSpeedNumber(speedStr, 'walk') || parseSpeedNumber(speedStr, '(?:$|,|\\s)'), // default standalone numbers to walk
      flySpeed: parseSpeedNumber(speedStr, 'fly'),
      swimSpeed: parseSpeedNumber(speedStr, 'swim'),
      climbSpeed: parseSpeedNumber(speedStr, 'climb'),
      burrowSpeed: parseSpeedNumber(speedStr, 'burrow'),
      hover: /hover/i.test(speedStr),

      passivePerception: parseSenseNumber(senseStr, 'passive perception'),
      darkvision: parseSenseNumber(senseStr, 'darkvision'),
      blindsight: parseSenseNumber(senseStr, 'blindsight'),
      truesight: parseSenseNumber(senseStr, 'truesight'),
      tremorsense: parseSenseNumber(senseStr, 'tremorsense'),

      saves: profStr.match(/Saving Throw:\s*([A-Z]{3})/gi)?.map((s: string) => s.split(' ')[2].toLowerCase()) || [],
      skills:
        profStr.match(/Skill:\s*([a-zA-Z\s]+?)\s*[+-]/gi)?.map((s: string) =>
          s
            .replace(/Skill:\s*/i, '')
            .replace(/[+-]/, '')
            .trim()
            .toLowerCase()
            .replace(' ', '-')
        ) || [],
    };

    // If 'walk' wasn't explicitly said but a number is first, assume it's walk
    if (stats.walkSpeed === 0) {
      const defaultWalk = speedStr.match(/^(\d+)\s*ft/i);
      if (defaultWalk) stats.walkSpeed = parseInt(defaultWalk[1], 10);
    }

    // Combine descriptions, abilities, actions into Strapi richtext
    const descriptionChunks = [];
    if (rawData.special_abilities)
      descriptionChunks.push(
        `### Special Abilities\n${typeof rawData.special_abilities === 'string' ? rawData.special_abilities : JSON.stringify(rawData.special_abilities)}`
      );
    if (rawData.actions)
      descriptionChunks.push(
        `### Actions\n${typeof rawData.actions === 'string' ? rawData.actions : JSON.stringify(rawData.actions)}`
      );
    if (rawData.legendary_actions)
      descriptionChunks.push(
        `### Legendary Actions\n${typeof rawData.legendary_actions === 'string' ? rawData.legendary_actions : JSON.stringify(rawData.legendary_actions)}`
      );
    const fullDesc = descriptionChunks.join('\n\n');

    const parsedCR = parseFraction(rawData.challenge_rating);

    let existingSpells: string[] | undefined = undefined;
    try {
      const existingEntityPath = path.join(entitiesDir, file);
      const existingEntity = JSON.parse(await fs.readFile(existingEntityPath, 'utf-8'));
      if (existingEntity.spells && existingEntity.spells.length > 0) {
        existingSpells = existingEntity.spells;
      }
    } catch {
      // File doesn't exist yet or invalid JSON, no existing spells
    }

    const payload = {
      slug: rawData.slug || fallbackSlug,
      name: rawData.name || fallbackName,
      description: fullDesc || undefined,
      size: mapSize(rawData.size || 'Medium'),
      type: rawData.type || 'unknown',
      alignment: rawData.alignment || 'unaligned',
      level: Math.max(1, Math.floor(parsedCR || 1)),
      ac: typeof rawData.armor_class === 'number' ? rawData.armor_class : parseInt(rawData.armor_class) || 10,
      hp: typeof rawData.hit_points === 'number' ? rawData.hit_points : parseInt(rawData.hit_points) || 10,
      hit_dice: rawData.hit_dice,
      challenge_rating: parsedCR,
      xp: typeof rawData.xp === 'number' ? rawData.xp : parseInt(rawData.xp) || 0,
      stats: stats,
      actions: standardRefs.length > 0 ? standardRefs : undefined,
      legendary_actions: legendaryRefs.length > 0 ? legendaryRefs : undefined,
      spells: existingSpells,
    };

    const validation = EntitySchema.safeParse(payload);

    if (validation.success) {
      await fs.writeFile(path.join(entitiesDir, file), JSON.stringify(validation.data, null, 2));
      successCount++;
    } else {
      console.error(`❌ Validation Failed for ${rawData.name || fallbackName}:`, validation.error.format());
      failCount++;
    }
  }

  console.log(`\n🏁 Transformed ${successCount} entities. Failed: ${failCount}.`);
}

transformEntities().catch(console.error);
