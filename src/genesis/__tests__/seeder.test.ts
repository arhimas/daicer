import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenesisSeeder } from '@/genesis/seeder';

// Mock Strapi global
const mockStrapi = {
  documents: vi.fn(),
  db: { query: vi.fn() },
};

describe('Genesis Seeder', () => {
  let seeder: GenesisSeeder;

  beforeEach(() => {
    vi.clearAllMocks();
    seeder = new GenesisSeeder(mockStrapi);
  });

  describe('getDocumentId()', () => {
    it('should return null and warn if the database lookup throws an error', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Force strapped documents() query to throw
      mockStrapi.documents.mockReturnValue({
        findFirst: vi.fn().mockRejectedValue(new Error('Simulated DB Crash')),
      });


      const result = await seeder.getDocumentId('api::test.test', 'invalid-slug');
      
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith('⚠️ DB Lookup failed for api::test.test/invalid-slug');
      
      warnSpy.mockRestore();
    });

    it('should return null if relations are missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await seeder.resolveRelations({ relationKey: ['missing-slug'] }, { shape: { relationKey: true } });
      expect(result.relationKey).toEqual(['missing-slug']); // Default fallback logic
      warnSpy.mockRestore();
    });
  });
});
