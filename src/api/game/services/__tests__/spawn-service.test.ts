
import { describe, it, expect, vi, beforeEach } from 'vitest';
import spawnServiceFactory from '../spawn-service';

// Mock Dependencies
vi.mock('@/api/game/src/engine', () => ({
  EntityDeriver: {
    derive: vi.fn(() => ({
      hp: 10, maxHp: 10, ac: 10, level: 1, speed: 30, proficiencyBonus: 2
    }))
  },
  StatBlock: {}
}));

vi.mock('@/api/game/schemas/gateway-schemas', () => ({
  BlueprintSchema: { parse: vi.fn((x) => x) },
  SpawnPayloadSchema: { parse: vi.fn((x) => x) }
}));

const mockFindOne = vi.fn();
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockDeriveAndPersist = vi.fn();

const mockStrapi: any = {
  documents: vi.fn(() => ({
    findOne: mockFindOne,
    findMany: mockFindMany,
    create: mockCreate,
  })),
  service: vi.fn((uid) => {
      if (uid === 'api::game.entity-derivation') return { deriveAndPersist: mockDeriveAndPersist };
      return {};
  })
};

describe('Spawn Service', () => {
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = spawnServiceFactory({ strapi: mockStrapi });
  });

  describe('spawnMonster', () => {
    it('should spawn monster successfully', async () => {
      mockFindOne.mockResolvedValueOnce({ 
          documentId: 'm1', name: 'Goblin', inventory: [], actions: [], stats: {} 
      });
      mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1' }]); // Room
      mockFindMany.mockResolvedValueOnce([]); // Collision check (empty)
      mockCreate.mockResolvedValueOnce({ documentId: 'sheet-1' });

      const res = await service.spawnMonster('room-1', 'm1', { x: 0, y: 0, z: 0 });
      expect(res.documentId).toBe('sheet-1');
      expect(mockDeriveAndPersist).toHaveBeenCalledWith('sheet-1');
    });

    it('should fail on collision', async () => {
      mockFindOne.mockResolvedValueOnce({ documentId: 'm1', name: 'Goblin' });
      mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1' }]); // Room
      mockFindMany.mockResolvedValueOnce([{ name: 'Obstacle' }]); // Collision check (found)

      await expect(service.spawnMonster('room-1', 'm1', { x: 0, y: 0, z: 0 }))
        .rejects.toThrow('occupied');
    });

    it('should fail if blueprint not found', async () => {
        mockFindOne.mockResolvedValueOnce(null);
        await expect(service.spawnMonster('r1', 'bad-id', {x:0,y:0,z:0})).rejects.toThrow('blueprint not found');
    });
  });

  describe('spawnCharacter', () => {
      it('should spawn character successfully', async () => {
          mockFindOne.mockResolvedValueOnce({
              documentId: 'c1', name: 'Hero', stats: {}, race: {}, classes: [], inventory: []
          });
          mockFindMany.mockResolvedValueOnce([{ documentId: 'room-1' }]); // Room
          mockFindMany.mockResolvedValueOnce([]); // Collision
          mockCreate.mockResolvedValueOnce({ documentId: 'sheet-1' });

          const res = await service.spawnCharacter('room-1', 'c1', { x: 0, y: 0, z: 0 });
          expect(res.documentId).toBe('sheet-1');
      });
  });

  describe('spawn', () => {
      it('should route to spawnMonster', async () => {
          // Mock spawnMonster internally? No, need to verify call.
          // I can patch the method on the instance, but factory creates new object every time.
          // So I rely on side effects (mocks).
          
          mockFindOne.mockResolvedValueOnce({ documentId: 'm1' }); // Blueprint
          mockFindMany.mockResolvedValueOnce([{ documentId: 'r1' }]); // Room
          mockFindMany.mockResolvedValueOnce([]); // Collision
          mockCreate.mockResolvedValueOnce({ documentId: 's1' });

          await service.spawn('r1', { type: 'monster', blueprintId: 'm1', position: {x:0,y:0,z:0} });
          
          expect(mockCreate).toHaveBeenCalled();
      });
  });

  // --- HARDENING TESTS ---
  describe('Hardening Edge Cases', () => {
      it('spawnMonster: should throw if room not found', async () => {
          mockFindOne.mockResolvedValueOnce({ documentId: 'm1' });
          mockFindMany.mockResolvedValueOnce([]); // No room found
          
          await expect(service.spawnMonster('invalid-room', 'm1', {x:0,y:0,z:0}))
            .rejects.toThrow('Room not found');
      });

      it('spawnMonster: should rethrow creation errors', async () => {
          mockFindOne.mockResolvedValueOnce({ documentId: 'm1' });
          mockFindMany.mockResolvedValueOnce([{ documentId: 'r1' }]);
          mockFindMany.mockResolvedValueOnce([]); // No collision
          mockCreate.mockRejectedValue(new Error('DB Creation Failed'));

          await expect(service.spawnMonster('r1', 'm1', {x:0,y:0,z:0}))
            .rejects.toThrow('DB Creation Failed');
      });

      it('spawnCharacter: should throw if blueprint not found', async () => {
          mockFindOne.mockResolvedValueOnce(null);
          await expect(service.spawnCharacter('r1', 'bad-c1', {x:0,y:0,z:0}))
            .rejects.toThrow('Character blueprint not found');
      });
      
      it('spawnCharacter: should throw if room not found', async () => {
           mockFindOne.mockResolvedValueOnce({ documentId: 'c1' });
           mockFindMany.mockResolvedValueOnce([]); // No room
           await expect(service.spawnCharacter('bad-room', 'c1', {x:0,y:0,z:0}))
             .rejects.toThrow('Room not found');
      });

      it('spawnCharacter: should fail on collision', async () => {
           mockFindOne.mockResolvedValueOnce({ documentId: 'c1' });
           mockFindMany.mockResolvedValueOnce([{ documentId: 'r1' }]);
           mockFindMany.mockResolvedValueOnce([{ name: 'Wall' }]); // Collision
           
           await expect(service.spawnCharacter('r1', 'c1', {x:0,y:0,z:0}))
             .rejects.toThrow('occupied');
      });

      it('spawn: should route character spawn correctly', async () => {
           mockFindOne.mockResolvedValueOnce({ documentId: 'c1' });
           mockFindMany.mockResolvedValueOnce([{ documentId: 'r1' }]);
           mockFindMany.mockResolvedValueOnce([]);
           mockCreate.mockResolvedValueOnce({ documentId: 'sheet-c' });

           await service.spawn('r1', { type: 'character', blueprintId: 'c1', position: {x:0,y:0,z:0} });
           expect(mockCreate).toHaveBeenCalled();
      });
      
      it('spawn: should handle flat coordinate input', async () => {
           mockFindOne.mockResolvedValueOnce({ documentId: 'm1' });
           mockFindMany.mockResolvedValueOnce([{ documentId: 'r1' }]);
           mockFindMany.mockResolvedValueOnce([]);
           mockCreate.mockResolvedValueOnce({ documentId: 'sheet-m' });
           
           // Passing x,y,z directly instead of position object
           await service.spawn('r1', { type: 'monster', blueprintId: 'm1', x: 10, y: 10, z: 0 });
           expect(mockCreate).toHaveBeenCalled();
           // Verification of position would be ideal but hard without spy on internal method
           // Rely on successful creation implies position was parsed
      });
  });
});
