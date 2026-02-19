import { describe, it, expect, vi, beforeEach, _afterEach } from 'vitest';

// 1. Hoist Mocks
const { mockParentPort, mockChunkBuilder } = vi.hoisted(() => {
  const mockParentPort = {
    on: vi.fn(),
    postMessage: vi.fn(),
  };
  const mockChunkBuilder = {
    generateChunk: vi.fn(),
  };
  return { mockParentPort, mockChunkBuilder };
});

// 2. Mock Modules
vi.mock('worker_threads', () => ({
  parentPort: mockParentPort,
}));

vi.mock('@/api/voxel-engine/services/chunk-builder', () => ({
  ChunkBuilder: vi.fn(function() { return mockChunkBuilder; }),
}));

// 3. Import Worker (requires dynamic import or require to ensure mocks are applied)
// Since the worker code executes on top-level, we need to ensure mocks are ready.
// We'll import it inside the test or describe block if possible, but Vitest hoists mocks so it should be fine.

describe('Chunk Worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-import or simulate the environment if needed.
    // However, since it's a side-effect module, we might need to resetModules.
    vi.resetModules();
  });

  it('should register message listener on load', async () => {
    await import('../chunk-worker');
    expect(mockParentPort.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should generate chunk successfully', async () => {
    // 1. Import to trigger registration
    await import('../chunk-worker');
    const messageHandler = mockParentPort.on.mock.calls[0][1];

    // 2. Setup mock return
    const mockChunk = { voxels: [] };
    mockChunkBuilder.generateChunk.mockReturnValue(mockChunk);

    // 3. Simulate message
    const task = { id: 'task-1', chunkX: 0, chunkY: 0, config: {} };
    messageHandler(task);

    // 4. Verify output
    expect(mockChunkBuilder.generateChunk).toHaveBeenCalledWith(0, 0);
    expect(mockParentPort.postMessage).toHaveBeenCalledWith({
      id: 'task-1',
      success: true,
      result: mockChunk,
    });
  });

  it('should handle errors', async () => {
    await import('../chunk-worker');
    const messageHandler = mockParentPort.on.mock.calls[0][1];

    mockChunkBuilder.generateChunk.mockImplementation(() => {
      throw new Error('Generation Error');
    });

    const task = { id: 'task-2', chunkX: 1, chunkY: 1, config: {} };
    messageHandler(task);

    expect(mockParentPort.postMessage).toHaveBeenCalledWith({
      id: 'task-2',
      success: false,
      error: 'Generation Error',
    });
  });
});
