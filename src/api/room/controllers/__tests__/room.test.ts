
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Hoist Mocks
const { mockStrapi, mockEntityService, mockRoomService, mockTurnService } = vi.hoisted(() => {
  const mockEntityService = {
    create: vi.fn(),
    update: vi.fn(),
  };
  const mockRoomService = {
    joinRoom: vi.fn(),
    create: vi.fn(),
  };
  const mockTurnService = {
    addAction: vi.fn(),
    processTurn: vi.fn(),
  };
  
  const mockStrapi = {
    entityService: mockEntityService,
    service: vi.fn((uid: string) => {
      if (uid === 'api::room.room') return mockRoomService;
      if (uid === 'api::room.turn-service') return mockTurnService;
      return {};
    }),
    documents: vi.fn(() => ({ create: vi.fn(), update: vi.fn() })),
  };

  return { mockStrapi, mockEntityService, mockRoomService, mockTurnService };
});

// 2. Mock @strapi/strapi factories
vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreController: (uid: string, fn: any) => fn({ strapi: mockStrapi }),
  },
}));

// 3. Set global strapi
global.strapi = mockStrapi as any;

// 4. Import Controller
import roomController from '../room';

describe('Room Controller', () => {
  let ctx: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controller = roomController as any;

  beforeEach(() => {
    vi.clearAllMocks();
    ctx = {
      state: { user: { id: 1, documentId: 'doc-1', username: 'TestUser' } },
      request: { body: {} },
      params: {},
      badRequest: vi.fn(),
      unauthorized: vi.fn(),
      notFound: vi.fn(),
    };
  });

  describe('create', () => {
    it('should create a room successfully', async () => {
      ctx.request.body = { settings: { mode: 'survival' } };
      
      const newRoom = { id: 123, documentId: 'doc-123' };
      mockEntityService.create.mockResolvedValue(newRoom);
      mockEntityService.update.mockResolvedValue({ ...newRoom, code: '123' });

      const result = await controller.create(ctx);

      expect(mockEntityService.create).toHaveBeenCalled();
      expect(mockEntityService.update).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });

    it('should return unauthorized if no user', async () => {
      ctx.state.user = null;
      await roomController.create(ctx);
      expect(ctx.unauthorized).toHaveBeenCalledWith(expect.stringContaining('must be logged in'));
    });
    
    it('should handle error during generation', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockEntityService.create.mockRejectedValue(new Error('DB Error'));
        await controller.create(ctx);
        expect(ctx.badRequest).toHaveBeenCalledWith('Failed to generate room code');
        consoleSpy.mockRestore();
    });
  });

  describe('join', () => {
    it('should join a room successfully', async () => {
      ctx.params.id = 'room-1';
      mockRoomService.joinRoom.mockResolvedValue({ room: { id: 1 }, message: 'Joined' });

      const result = await controller.join(ctx);

      expect(mockRoomService.joinRoom).toHaveBeenCalledWith('room-1', expect.any(Object));
      expect(result).toHaveProperty('success', true);
    });

    it('should return unauthorized if no user', async () => {
      ctx.state.user = null;
      await roomController.join(ctx);
      expect(ctx.unauthorized).toHaveBeenCalled();
    });

    it('should return not found if room missing', async () => {
      ctx.params.id = 'missing';
      mockRoomService.joinRoom.mockRejectedValue(new Error('Room not found'));
      
      await roomController.join(ctx);
      
      expect(ctx.notFound).toHaveBeenCalledWith('Room not found');
    });

    it('should return bad request on other errors', async () => {
        ctx.params.id = 'error';
        mockRoomService.joinRoom.mockRejectedValue(new Error('Full room'));
        
        await controller.join(ctx);
        
        expect(ctx.badRequest).toHaveBeenCalledWith('Full room');
    });
  });

  describe('submitAction', () => {
    it('should submit action successfully', async () => {
      ctx.params.id = 'room-1';
      ctx.request.body = { action: { type: 'MOVE' } };
      mockTurnService.addAction.mockResolvedValue({ actions: 1 });

      const result = await controller.submitAction(ctx);

      expect(mockTurnService.addAction).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
    });

    it('should fail if no action provided', async () => {
      ctx.request.body = {};
      await roomController.submitAction(ctx);
      expect(ctx.badRequest).toHaveBeenCalledWith('Invalid action payload');
    });

    it('should return unauthorized if no user', async () => {
        ctx.state.user = null;
        await controller.submitAction(ctx); // Should fail before checking body
        expect(ctx.unauthorized).toHaveBeenCalled();
    });
  });

  describe('triggerTurn', () => {
    it('should trigger turn successfully', async () => {
      ctx.params.id = 'room-1';
      mockTurnService.processTurn.mockResolvedValue({ status: 'processed' });

      const result = await controller.triggerTurn(ctx);

      expect(mockTurnService.processTurn).toHaveBeenCalledWith('room-1');
      expect(result).toHaveProperty('success', true);
    });

    it('should return unauthorized if no user', async () => {
        ctx.state.user = null;
        await roomController.triggerTurn(ctx);
        expect(ctx.unauthorized).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
        mockTurnService.processTurn.mockRejectedValue(new Error('Processing Failed'));
        await roomController.triggerTurn(ctx);
        expect(ctx.badRequest).toHaveBeenCalledWith('Processing Failed');
    });
  });
});
