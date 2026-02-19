
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Mock Strapi factories BEFORE import
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, cfg: any) => {
        // Return the inner implementation passed to the factory
        // The factory signature is (uid, ({ strapi }) => serviceObj)
        // We pass a mock strapi to it to get the service methods
        const mockStrapi = {
            entityService: {
                findOne: vi.fn(),
                create: vi.fn(),
            }
        };
        const service = cfg({ strapi: mockStrapi });
        // Attach the mock to the service for assertion access if needed, 
        // or we just close over it in the test.
        // Better: allow the test to access the mockStrapi.
        service.__mockStrapi = mockStrapi; 
        return service;
    }
  }
}));

import timeFrameService from '../time-frame';

describe('TimeFrame Service', () => {
  let service: any;
  let mockStrapi: any;

  beforeEach(() => {
    service = timeFrameService;
    mockStrapi = service.__mockStrapi;
    vi.clearAllMocks();
  });

  describe('createSnapshot', () => {
    it('should throw if room not found', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue(null);
      await expect(service.createSnapshot('r1', {})).rejects.toThrow('Room not found');
    });

    it('should create snapshot with active turn number', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue({
        id: 1,
        turns: [{}, {}, {}] // 3 previous turns
      });
      mockStrapi.entityService.create.mockResolvedValue({ id: 101 });

      await service.createSnapshot('r1', { some: 'state' });

      expect(mockStrapi.entityService.create).toHaveBeenCalledWith('api::time-frame.time-frame', expect.objectContaining({
        data: expect.objectContaining({
            room: 'r1',
            turnNumber: 3,
            gameState: { some: 'state' }
        })
      }));
    });
    
    it('should default turn number to 0', async () => {
        // Mock return with no turns prop
        mockStrapi.entityService.findOne.mockResolvedValue({ id: 1 });
        await service.createSnapshot('r1', {});
        
        expect(mockStrapi.entityService.create).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            data: expect.objectContaining({ turnNumber: 0 })
        }));
    });
  });

  describe('getPOV', () => {
    it('should throw if timeframe not found', async () => {
      mockStrapi.entityService.findOne.mockResolvedValue(null);
      await expect(service.getPOV('tf1', 'p1')).rejects.toThrow('Time frame not found');
    });

    it('should return game state', async () => {
       mockStrapi.entityService.findOne.mockResolvedValue({
           gameState: { secret: 'data' }
       });
       
       const result = await service.getPOV('tf1', 'p1');
       expect(result).toEqual({ secret: 'data' });
    });
  });
});
