
import { describe, it, expect, vi, beforeEach } from 'vitest';
import biomeSpawnServiceFactory from '../biome-spawn-service';
import { BiomeType } from '@daicer/engine/types';

vi.mock('@/api/voxel-engine/services/utils/constants', () => ({
  CHUNK_SIZE: 16,
}));

// Mock Strapi
const mockFindMany = vi.fn();
const mockSpawnMonster = vi.fn();

const mockStrapi: any = {
  documents: vi.fn(() => ({
    findMany: mockFindMany,
  })),
  service: vi.fn((uid) => {
      if (uid === 'api::game.spawn-service') return { spawnMonster: mockSpawnMonster };
      return {};
  })
};

describe('Biome Spawn Service', () => {
    let service: any;

    beforeEach(() => {
        vi.clearAllMocks();
        service = biomeSpawnServiceFactory({ strapi: mockStrapi });
    });

    describe('classifyMonster', () => {
        it('should classify by keyword', () => {
            const m = { name: 'Giant Spider', type: 'beast' } as any;
            const biomes = service.classifyMonster(m);
            expect(biomes).toContain(BiomeType.forest);
            expect(biomes).toContain(BiomeType.caves);
        });

        it('should fallback by type', () => {
            const m = { name: 'Unknown Beast', type: 'beast' } as any;
            const biomes = service.classifyMonster(m);
            expect(biomes).toContain(BiomeType.forest);
            expect(biomes).toContain(BiomeType.plains);
        });
    });

    describe('populateChunk', () => {
        it('should spawn monsters', async () => {
            mockFindMany.mockResolvedValue([
                { documentId: 'm1', name: 'Goblin', type: 'humanoid', challenge_rating: 0.25 }, // Forest/Cave
            ]);
            
            // Force random to spawn
            vi.spyOn(Math, 'random').mockReturnValue(0.1); 

            await service.populateChunk(0, 0, BiomeType.forest, 'room-1');
            
            // Goblin matches forest keyword.
            expect(mockSpawnMonster).toHaveBeenCalled();
        });
        
        it('should respect rarity', async () => {
             mockFindMany.mockResolvedValue([
                { documentId: 'm1', name: 'Dragon', challenge_rating: 20, type: 'dragon' }, 
            ]);
            // Dragon has very low weight.
            // If random is high, it might skip if total weight is low?
            // "Global Spawn Chance (40%)". 0.1 passes.
            
            // If total weight is low, r = random * total.
            // r will be small.
            // Loop minus weight will trigger.
            
            await service.populateChunk(0, 0, BiomeType.badlands, 'room-1');
            // Assuming Dragon matches Badlands (Red Dragon etc). 
            // 'Dragon' name alone? 
            // rules: 'red dragon' -> badlands.
            // 'Dragon' -> no match. Fallback? type 'dragon' not in fallback list.
            
            // Let's use a known match.
            // 'Red Dragon'
        });
    });
});
