import { describe, it, expect, vi, beforeEach } from 'vitest';
import service from '../map-service';

describe('MapService', () => {
    let strapi: any;
    let mapService: any;
    let mockQuery: any;
    let mockDocuments: any;

    beforeEach(() => {
        mockQuery = {
            findOne: vi.fn(),
        };
        mockDocuments = {
            create: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
        };

        strapi = {
            plugin: vi.fn().mockReturnValue({
                config: vi.fn().mockImplementation((key) => {
                   if (key === 'contentTypes') {
                       return { 
                           world: 'api::world.world',
                           construction: 'api::construction.construction'
                       };
                   }
                   return {};
                }),
            }),
            db: {
                query: vi.fn().mockReturnValue(mockQuery),
            },
            documents: vi.fn().mockReturnValue(mockDocuments),
        };

        mapService = service({ strapi });
    });

    describe('getWorldConfig', () => {
        it('should return existing world config', async () => {
            const mockWorld = { documentId: 'doc-1', seed: 'test-seed' };
            mockQuery.findOne.mockResolvedValue(mockWorld);

            const result = await mapService.getWorldConfig();
            
            expect(strapi.db.query).toHaveBeenCalledWith('api::world.world');
            expect(result).toEqual(mockWorld);
        });

        it('should return default config if no world exists', async () => {
            mockQuery.findOne.mockResolvedValue(null);

            const result = await mapService.getWorldConfig();
            
            expect(result).toEqual({
                seed: 'daicer',
                chunkSize: 16,
                seaLevel: 0,
                structureChance: 0.1,
                roadDensity: 0.1,
            });
        });
    });

    describe('updateWorldConfig', () => {
        it('should update existing world', async () => {
            const mockWorld = { documentId: 'doc-1' };
            mockQuery.findOne.mockResolvedValue(mockWorld);
            const updateData = { seed: 'new-seed' };
            
            mockDocuments.update.mockResolvedValue({ ...mockWorld, ...updateData });

            await mapService.updateWorldConfig(updateData);

            expect(mockDocuments.update).toHaveBeenCalledWith({
                documentId: 'doc-1',
                data: updateData
            });
        });

        it('should create new world if none exists', async () => {
            mockQuery.findOne.mockResolvedValue(null);
            const createData = { seed: 'new-seed' };
            
            mockDocuments.create.mockResolvedValue({ documentId: 'new-doc', ...createData });

            await mapService.updateWorldConfig(createData);

            expect(mockDocuments.create).toHaveBeenCalledWith({
                data: createData
            });
        });
    });

    describe('getConstructions', () => {
        it('should fetch all constructions', async () => {
            const mockConstructions = [{ id: 1 }, { id: 2 }];
            mockDocuments.findMany.mockResolvedValue(mockConstructions);

            const result = await mapService.getConstructions();

            expect(strapi.documents).toHaveBeenCalledWith('api::construction.construction');
            expect(result).toEqual(mockConstructions);
        });
    });

    describe('saveConstruction', () => {
        it('should create a construction', async () => {
            const data = { name: 'Building' };
            mockDocuments.create.mockResolvedValue({ id: 1, ...data });

            await mapService.saveConstruction(data);

            expect(strapi.documents).toHaveBeenCalledWith('api::construction.construction');
            expect(mockDocuments.create).toHaveBeenCalledWith({ data });
        });
    });
});
