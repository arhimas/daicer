import { describe, it, expect, vi, beforeEach } from 'vitest';
import agentControllerFactory from '../agent';

describe('Agent Controller', () => {
  let ctx: any;
  let mockStrapi: any;
  let controller: any;
  let mockAgentService: any;

  beforeEach(() => {
    mockAgentService = {
      executeTool: vi.fn(),
    };

    mockStrapi = {
      service: vi.fn(() => mockAgentService),
      log: {
        error: vi.fn(),
      },
    };

    controller = agentControllerFactory({ strapi: mockStrapi });

    ctx = {
      request: {
        body: {},
      },
      state: {
        user: { id: 1, username: 'tester' },
      },
      badRequest: vi.fn(),
      internalServerError: vi.fn(),
      send: vi.fn(),
    };
  });

  it('should return badRequest if roomId is missing', async () => {
    ctx.request.body = { toolName: 'test', payload: {} };
    await controller.executeTool(ctx);
    expect(ctx.badRequest).toHaveBeenCalledWith('Room ID required');
  });

  it('should return badRequest if toolName is missing', async () => {
    ctx.request.body = { roomId: '123', payload: {} };
    await controller.executeTool(ctx);
    expect(ctx.badRequest).toHaveBeenCalledWith('Tool Name required');
  });

  it('should return badRequest if payload is missing', async () => {
    ctx.request.body = { roomId: '123', toolName: 'test' };
    await controller.executeTool(ctx);
    expect(ctx.badRequest).toHaveBeenCalledWith('Payload required');
  });

  it('should execute tool successfully', async () => {
    ctx.request.body = { roomId: '123', toolName: 'my-tool', payload: { foo: 'bar' } };
    mockAgentService.executeTool.mockResolvedValue({ success: true, result: 'done' });

    await controller.executeTool(ctx);

    expect(mockStrapi.service).toHaveBeenCalledWith('api::agent.agent');
    expect(mockAgentService.executeTool).toHaveBeenCalledWith(
      '123',
      'my-tool',
      { foo: 'bar' },
      ctx.state.user
    );
    expect(ctx.send).toHaveBeenCalledWith({ success: true, result: 'done' });
  });

  it('should handle service errors', async () => {
    ctx.request.body = { roomId: '123', toolName: 'my-tool', payload: {} };
    mockAgentService.executeTool.mockRejectedValue(new Error('Agent Failure'));

    await controller.executeTool(ctx);

    expect(mockStrapi.log.error).toHaveBeenCalled();
    expect(ctx.internalServerError).toHaveBeenCalledWith('Agent Failure');
  });

  it('should handle unknown errors gracefully', async () => {
    ctx.request.body = { roomId: '123', toolName: 'my-tool', payload: {} };
    mockAgentService.executeTool.mockRejectedValue('Unknown String Error');

    await controller.executeTool(ctx);

    expect(ctx.internalServerError).toHaveBeenCalledWith('Failed to execute tool');
  });
});
