/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import { Core } from '@strapi/strapi';
import { BiomeType } from '../src/engine/types'; // Removed unused BlockType
import { CHUNK_SIZE } from '../../voxel-engine/services/utils/constants';

interface MonsterBlueprint {
  id: number;
  documentId: string;
  name: string;
  level: number;
  challenge_rating: number;
  type: string;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Fetches the complete catalog of entities (monsters) eligible for spawning.
   * This includes all drafted and published entities to allow for diverse encounters.
   *
   * @returns List of monster blueprints containing basic meta-data (level, cr, type).
   */
  async getAllMonsters(): Promise<MonsterBlueprint[]> {
    const monsters = await strapi.documents('api::entity.entity').findMany({
      // No filters! We want everything.
      limit: 1000,
      fields: ['name', 'level', 'challenge_rating', 'type', 'documentId'],
    });

    return monsters as unknown as MonsterBlueprint[];
  },

  /**
   * Contextually classifies monsters into Biomes based on keywords and type.
   * Acts as an "Auto-Tagger" to avoid manual database entry.
   */
  classifyMonster(monster: MonsterBlueprint): BiomeType[] {
    const name = monster.name.toLowerCase();
    const type = monster.type.toLowerCase();
    const biomes: Set<BiomeType> = new Set();

    // Keyword Dictionary for Biome Context
    // Relaxed type to allow partial definition
    const rules: Record<string, string[]> = {
      [BiomeType.desert]: [
        'scorpion',
        'camel',
        'vulture',
        'hyena',
        'jackal',
        'sand',
        'dust',
        'cactus',
        'mummy',
        'sphinx',
        'blue dragon',
        'brass dragon',
      ],
      [BiomeType.forest]: [
        'deer',
        'bear',
        'wolf',
        'owl',
        'badger',
        'spider',
        'elk',
        'boar',
        'shrub',
        'twig',
        'green dragon',
        'dryad',
        'treant',
        'goblin',
        'owlbear',
      ],
      [BiomeType.jungle]: [
        'ape',
        'tiger',
        'panther',
        'snake',
        'constrictor',
        'lizard',
        'monkey',
        'parrot',
        'couatl',
        'yuan-ti',
        'dinosaur',
      ],
      [BiomeType.tundra]: ['winter', 'polar', 'ice', 'snow', 'white dragon', 'yeti', 'remorhaz', 'mammoth'],
      [BiomeType.snowy_peaks]: [
        'eagle',
        'hawk',
        'goat',
        'mountain',
        'roc',
        'silver dragon',
        'giant',
        'griffon',
        'harpy',
      ],
      [BiomeType.swamp]: [
        'frog',
        'toad',
        'crocodile',
        'lizard',
        'leech',
        'snake',
        'mud',
        'black dragon',
        'hag',
        'shambling mound',
        'hydra',
      ],
      [BiomeType.ocean]: [
        'shark',
        'octopus',
        'squid',
        'fish',
        'whale',
        'sea',
        'bronze dragon',
        'dragon turtle',
        'sahuagin',
        'merfolk',
      ],
      [BiomeType.beach]: ['crab', 'quipper', 'turtle', 'gull', 'giant crab'],
      [BiomeType.caves]: [
        'bat',
        'spider',
        'rat',
        'ooze',
        'shrieker',
        'fungus',
        'darkmantle',
        'drow',
        'purple worm',
        'rust monster',
        'troglodyte',
        'umber hulk',
      ],
      [BiomeType.badlands]: ['orc', 'goblin', 'worg', 'hobgoblin', 'red dragon', 'bulette', 'chimera', 'manticore'],
      [BiomeType.plains]: ['lion', 'horse', 'bison', 'gnoll', 'halfling', 'scarecrow', 'ankheg', 'cockatrice'],
    };

    // 1. Keyword Matching
    for (const [biome, keywords] of Object.entries(rules)) {
      if (keywords.some((k) => name.includes(k))) {
        biomes.add(biome as BiomeType);
      }
    }

    // 2. Type-Based Fallbacks (if no specific biome found)
    if (biomes.size === 0) {
      if (type === 'beast') {
        biomes.add(BiomeType.forest);
        biomes.add(BiomeType.plains);
      }
      if (type === 'plant') {
        biomes.add(BiomeType.forest);
        biomes.add(BiomeType.jungle);
      }
      if (type === 'undead') {
        biomes.add(BiomeType.caves);
        biomes.add(BiomeType.swamp); // Classic undead locations
      }
      if (type === 'elemental') {
        if (name.includes('fire')) biomes.add(BiomeType.badlands);
        if (name.includes('water')) biomes.add(BiomeType.ocean);
        if (name.includes('earth')) biomes.add(BiomeType.caves);
        if (name.includes('air')) biomes.add(BiomeType.snowy_peaks);
      }
    }

    return Array.from(biomes);
  },

  generateBiomeMapping(monsters: MonsterBlueprint[]): Record<BiomeType, string[]> {
    const mapping: Record<string, string[]> = {};
    // Initialize
    Object.values(BiomeType).forEach((b) => (mapping[b] = []));

    for (const m of monsters) {
      const allowedBiomes = this.classifyMonster(m);
      for (const b of allowedBiomes) {
        if (!mapping[b]) mapping[b] = [];
        mapping[b].push(m.documentId);
      }
    }
    return mapping as Record<BiomeType, string[]>;
  },

  /**
   * Populate a chunk with ANY monster contextually.
   * Scales rarity by Challenge Rating (CR).
   */
  async populateChunk(chunkX: number, chunkY: number, biome: BiomeType, roomId: string) {
    // 1. Fetch Candidate Pool
    const monsters = await this.getAllMonsters();
    if (!monsters || monsters.length === 0) return;

    // 2. Locate Candidates for this Biome
    const mapping = this.generateBiomeMapping(monsters);
    const biomeCandidatesKeys = mapping[biome];

    if (!biomeCandidatesKeys || biomeCandidatesKeys.length === 0) return;

    const biomeCandidates = monsters.filter((m) => biomeCandidatesKeys.includes(m.documentId));

    // 3. Calculate Total Weight (Rarity)
    // Formula: Weight = 1 / (CR^1.5 + 0.5)
    // Non-linear scaling suppresses high CR more aggressively.
    // CR 0 -> 2.0
    // CR 1 -> 0.6
    // CR 5 -> ~0.08
    // CR 20 -> ~0.01
    const getWeight = (cr: number) => 1 / (Math.pow(Math.max(0, cr), 1.5) + 0.5);

    const totalWeight = biomeCandidates.reduce((sum, m) => sum + getWeight(m.challenge_rating), 0);

    // 4. Global Spawn Chance (40%)
    if (Math.random() > 0.4) return;

    // 5. Select Monster
    let r = Math.random() * totalWeight;
    let selectedMonster: MonsterBlueprint | undefined;

    for (const m of biomeCandidates) {
      r -= getWeight(m.challenge_rating);
      if (r <= 0) {
        selectedMonster = m;
        break;
      }
    }
    if (!selectedMonster) selectedMonster = biomeCandidates[0];

    // 6. Spawn (Persistence Guaranteed by SpawnService)
    // CR < 1 -> Pack of 1-4
    // CR < 5 -> Pack of 1-2
    // CR > 5 -> Solo
    const count =
      selectedMonster.challenge_rating < 1
        ? Math.floor(Math.random() * 4) + 1
        : selectedMonster.challenge_rating < 5
          ? Math.floor(Math.random() * 2) + 1
          : 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spawnService: any = strapi.service('api::game.spawn-service');

    const worldX = chunkX * CHUNK_SIZE;
    const worldY = chunkY * CHUNK_SIZE;

    console.log(
      `[BiomeSpawn] Spawning ${count}x ${selectedMonster.name} (CR ${selectedMonster.challenge_rating}) in ${biome}`
    );

    for (let i = 0; i < count; i++) {
      const lx = Math.floor(Math.random() * (CHUNK_SIZE - 2)) + 1; // Avoid exact edges
      const ly = Math.floor(Math.random() * (CHUNK_SIZE - 2)) + 1;
      const x = worldX + lx;
      const y = worldY + ly;
      const z = 1;

      try {
        await spawnService.spawnMonster(roomId, selectedMonster.documentId, { x, y, z });
      } catch (e) {
        console.error(`[BiomeSpawn] Failed to spawn ${selectedMonster.name}`, e);
      }
    }
  },
});
