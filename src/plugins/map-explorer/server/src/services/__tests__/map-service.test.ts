
import { describe, it, expect, vi, beforeEach } from 'vitest';
import mapServiceFactory from '@/plugins/map-explorer/server/src/services/map-service';

describe('Map Explorer - Map Service', () => {
  let mockStrapi: any;
  let mockQueryHelpers: any;
  let mockDocumentsHelpers: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockQueryHelpers = {
      findOne: vi.fn(),
    };

    mockDocumentsHelpers = {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    const mockPlugin = {
      config: vi.fn((key) => {
        if (key === 'contentTypes') {
            return {
                world: 'api::world.world',
                construction: 'api::construction.construction'
            };
        }
        return {};
      }),
    };

    mockStrapi = {
      log: { info: vi.fn(), error: vi.fn() },
      plugin: vi.fn(() => mockPlugin),
      db: {
        query: vi.fn(() => mockQueryHelpers),
      },
      documents: vi.fn(() => mockDocumentsHelpers),
    };
  });

  it('getWorldConfig should return defaults if no world exists', async () => {
    mockQueryHelpers.findOne.mockResolvedValue(null);
    const service = mapServiceFactory({ strapi: mockStrapi });
    
    const config = await service.getWorldConfig();

    expect(mockStrapi.db.query).toHaveBeenCalledWith('api::world.world');
    expect(config).toEqual(expect.objectContaining({
      seed: 'daicer',
      chunkSize: 16
    }));
  });

  it('getWorldConfig should return existing world config', async () => {
    const mockWorld = { seed: 'custom', chunkSize: 32 };
    mockQueryHelpers.findOne.mockResolvedValue(mockWorld);
    const service = mapServiceFactory({ strapi: mockStrapi });
    
    const config = await service.getWorldConfig();

    expect(config).toEqual(mockWorld);
  });

  it('updateWorldConfig should update if world exists', async () => {
    const mockWorld = { documentId: 'doc-1' };
    mockQueryHelpers.findOne.mockResolvedValue(mockWorld);
    mockDocumentsHelpers.update.mockResolvedValue({ id: 1, ...mockWorld });
    
    const service = mapServiceFactory({ strapi: mockStrapi });
    await service.updateWorldConfig({ seed: 'new' });

    expect(mockStrapi.documents).toHaveBeenCalledWith('api::world.world');
    expect(mockDocumentsHelpers.update).toHaveBeenCalledWith({
      documentId: 'doc-1',
      data: { seed: 'new' }
    });
  });

  it('updateWorldConfig should create if world does not exist', async () => {
    mockQueryHelpers.findOne.mockResolvedValue(null);
    mockDocumentsHelpers.create.mockResolvedValue({ id: 1, seed: 'new' });
    
    const service = mapServiceFactory({ strapi: mockStrapi });
    await service.updateWorldConfig({ seed: 'new' });

    expect(mockDocumentsHelpers.create).toHaveBeenCalledWith({
      data: { seed: 'new' }
    });
  });

  it('getConstructions should return list', async () => {
    const mockList = [{ id: 1 }];
    mockDocumentsHelpers.findMany.mockResolvedValue(mockList);
    
    const service = mapServiceFactory({ strapi: mockStrapi });
    const list = await service.getConstructions();

    expect(mockStrapi.documents).toHaveBeenCalledWith('api::construction.construction');
    expect(list).toEqual(mockList);
  });

  it('saveConstruction should create new record', async () => {
    const data = { name: 'Tower' };
    mockDocumentsHelpers.create.mockResolvedValue({ id: 1, ...data });
    
    const service = mapServiceFactory({ strapi: mockStrapi });
    await service.saveConstruction(data);

    expect(mockDocumentsHelpers.create).toHaveBeenCalledWith({ data });
  });
});
