import { describe, it, expect, vi, beforeEach } from 'vitest';
import turnServiceFactory from '../turn-service';

// Mock LLM
const mockGenerateStructured = vi.fn();
vi.mock('@/utils/llm/structured', () => ({
  generateStructured: (...args) => mockGenerateStructured(...args),
}));

describe('Turn Service', () => {
  let strapi: any;
  let service: any;
  let mockActionRegistry: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockActionRegistry = {
      rollDice: vi.fn(),
      moveEntity: vi.fn(),
      applyDamage: vi.fn(),
    };

    strapi = {
      entityService: {
        findOne: vi.fn(),
        update: vi.fn(),
      },
      service: vi.fn((uid) => {
        if (uid === 'api::room.action-registry') return mockActionRegistry;
        return null;
      }),
    };

    service = turnServiceFactory({ strapi });
  });

  describe('addAction', () => {
    it('should throw if room not found', async () => {
      strapi.entityService.findOne.mockResolvedValue(null);
      await expect(service.addAction('room-1', 'p1', {})).rejects.toThrow('Room not found');
    });

    it('should throw if player not in room', async () => {
      strapi.entityService.findOne.mockResolvedValue({
        id: 1,
        players: [{ id: 'p2' }], // p1 not here
      });
      await expect(service.addAction('room-1', 'p1', {})).rejects.toThrow('Player not in room');
    });

    it('should initialize turnData if missing and add action', async () => {
      strapi.entityService.findOne.mockResolvedValue({
        id: 1,
        players: [{ id: 'p1', character: { id: 'c1' } }],
        turnData: null,
      });

      strapi.entityService.update.mockResolvedValue({});

      await service.addAction('room-1', 'p1', { type: 'attack', intent: 'Hit it' });

      expect(strapi.entityService.update).toHaveBeenCalledWith('api::room.room', 'room-1', expect.objectContaining({
        data: expect.objectContaining({
          turnData: expect.objectContaining({
            phase: 'idle',
            actions: expect.arrayContaining([
              expect.objectContaining({ playerId: 'p1', type: 'action', intent: 'Hit it' }),
            ]),
          }),
        }),
      }));
    });
  });

  describe('processTurn', () => {
    it('should do nothing if no actions', async () => {
      strapi.entityService.findOne.mockResolvedValue({
        id: 1,
        turnData: { actions: [] },
      });

      const result = await service.processTurn('room-1');
      expect(result.message).toBe('No actions to process');
      expect(strapi.entityService.update).not.toHaveBeenCalled();
    });

    it('should process turn with tool calls', async () => {
      strapi.entityService.findOne.mockResolvedValue({
        id: 1,
        turnData: { actions: [{ intent: 'Attack' }] },
        history: [],
      });

      mockGenerateStructured.mockResolvedValue({
        narrative: 'Battle ensued.',
        tool_calls: [
          { tool: 'roll_dice', args: ['1d20'] },
          { tool: 'move_entity', args: ['c1', 10, 10] },
          { tool: 'apply_damage', args: ['t1', 5, 'fire'] },
        ],
      });

      mockActionRegistry.rollDice.mockReturnValue({ expression: '1d20', total: 15 });
      mockActionRegistry.moveEntity.mockResolvedValue({ to: { x: 10, y: 10 } });
      mockActionRegistry.applyDamage.mockResolvedValue({ damage: 5, type: 'fire' });

      strapi.entityService.update.mockResolvedValue({}); // Reset update

      const result = await service.processTurn('room-1');

      expect(result.success).toBe(true);
      expect(result.historyEntry.narrative).toBe('Battle ensued.');
      expect(mockActionRegistry.rollDice).toHaveBeenCalledWith('1d20');
      expect(mockActionRegistry.moveEntity).toHaveBeenCalled();
      expect(mockActionRegistry.applyDamage).toHaveBeenCalled();

      // Verify reset
      expect(strapi.entityService.update).toHaveBeenCalledTimes(2); // Lock + Reset
      const resetCall = strapi.entityService.update.mock.calls[1];
      expect(resetCall[2].data.turnData.actions).toEqual([]);
    });

    it('should handle tool errors gracefully', async () => {
      strapi.entityService.findOne.mockResolvedValue({ id: 1, turnData: { actions: [{}] } });
      mockGenerateStructured.mockResolvedValue({
        narrative: 'Oops.',
        tool_calls: [{ tool: 'roll_dice', args: ['bad'] }],
      });
      mockActionRegistry.rollDice.mockImplementation(() => { throw new Error('Bad Dice'); });

      const result = await service.processTurn('room-1');
      
      expect(result.historyEntry.log).toContain('[Error] Tool roll_dice failed: Bad Dice');
    });
  });
});
