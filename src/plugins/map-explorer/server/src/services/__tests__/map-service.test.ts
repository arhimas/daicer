import { describe, it, expect, vi, beforeEach } from 'vitest';
import mapServiceFactory from '@/plugins/map-explorer/server/src/services/map-service';

const mockFindOne = vi.fn();
const mockUpdate = vi.fn();
const mockCreate = vi.fn();
const mockFindMany = vi.fn();

const mockStrapi: any = {
  plugin: vi.fn(() => ({
    config: vi.fn(() => 'test-uid'),
  })),
  db: {
    query: vi.fn(() => ({
      findOne: mockFindOne,
    })),
  },
  documents: vi.fn(() => ({
    update: mockUpdate,
    create: mockCreate,
    findMany: mockFindMany,
  })),
};

describe('Map Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = mapServiceFactory({ strapi: mockStrapi });
  });

  describe('getWorldConfig', () => {
    it('should return existing config', async () => {
      mockFindOne.mockResolvedValueOnce({ seed: 'exists' });
      const res = await service.getWorldConfig();
      expect(res.seed).toBe('exists');
    });

    it('should return defaults if no config', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      const res = await service.getWorldConfig();
      expect(res.seed).toBe('daicer');
      expect(res.chunkSize).toBe(16);
    });
  });

  describe('updateWorldConfig', () => {
    it('should update if exists', async () => {
      mockFindOne.mockResolvedValueOnce({ documentId: 'doc1' });
      await service.updateWorldConfig({ seed: 'new' });
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ documentId: 'doc1' }));
    });

    it('should create if not exists', async () => {
      mockFindOne.mockResolvedValueOnce(null);
      await service.updateWorldConfig({ seed: 'new' });
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('Constructions', () => {
    it('should get constructions', async () => {
      mockFindMany.mockResolvedValueOnce(['c1']);
      const res = await service.getConstructions();
      expect(res).toEqual(['c1']);
    });

    it('should save construction', async () => {
      await service.saveConstruction({ name: 'Castle' });
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
