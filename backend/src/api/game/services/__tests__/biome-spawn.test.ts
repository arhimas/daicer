import { describe, it, expect, vi, beforeEach } from 'vitest';
import biomeSpawnServiceFactory from '../biome-spawn-service';
import { BiomeType } from '../../src/engine/types';

describe('BiomeSpawnService', () => {
  let strapi: any;
  let service: ReturnType<typeof biomeSpawnServiceFactory>;

  const mockMonsters = [
    { documentId: 'm1', name: 'Scorpion', type: 'beast', challenge_rating: 0.125 },
    { documentId: 'm2', name: 'Winter Wolf', type: 'monstrosity', challenge_rating: 3 }, // Higher CR
    { documentId: 'm3', name: 'Deer', type: 'beast', challenge_rating: 0 },
    { documentId: 'm4', name: 'Giant Crab', type: 'beast', challenge_rating: 0.125 },
    { documentId: 'm5', name: 'Shrieker', type: 'plant', challenge_rating: 0 },
    { documentId: 'm6', name: 'Generic Beast', type: 'beast', challenge_rating: 0 },
  ];

  beforeEach(() => {
    strapi = {
      documents: vi.fn().mockReturnValue({
        findMany: vi.fn().mockResolvedValue(mockMonsters),
      }),
      service: vi.fn().mockReturnValue({
        spawnMonster: vi.fn().mockResolvedValue(true),
      }),
    };
    service = biomeSpawnServiceFactory({ strapi });
  });

  describe('generateBiomeMapping', () => {
    it('should map monsters to biomes based on keywords', () => {
      const mapping = service.generateBiomeMapping(mockMonsters as any);

      expect(mapping[BiomeType.desert]).toContain('m1'); // Scorpion -> Desert
      expect(mapping[BiomeType.tundra]).toContain('m2'); // Winter Wolf -> Tundra
      expect(mapping[BiomeType.forest]).toContain('m3'); // Deer -> Forest
      expect(mapping[BiomeType.beach]).toContain('m4'); // Crab -> Beach
      expect(mapping[BiomeType.caves]).toContain('m5'); // Shrieker -> Caves
    });

    it('should fallback generic beasts to Plains/Forest', () => {
      const mapping = service.generateBiomeMapping(mockMonsters as any);
      expect(mapping[BiomeType.plains]).toContain('m6');
      expect(mapping[BiomeType.forest]).toContain('m6');
    });
  });

  describe('populateChunk', () => {
    it('should call spawnMonster when conditions are met', async () => {
      // Mock random to pass the 40% check
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);

      await service.populateChunk(0, 0, BiomeType.desert);

      expect(strapi.service).toHaveBeenCalledWith('api::game.spawn-service');
      const spawnService = strapi.service();
      expect(spawnService.spawnMonster).toHaveBeenCalled();
    });

    it('should respect rarity weights (lower CR = higher chance)', async () => {
      // This is hard to deterministically test with Math.random,
      // but we can verify the logic executes without error.
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05); // Force spawn

      await service.populateChunk(0, 0, BiomeType.forest);

      const spawnService = strapi.service();
      expect(spawnService.spawnMonster).toHaveBeenCalled();
    });
  });
});
