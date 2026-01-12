import { describe, it, expect, vi, beforeEach } from 'vitest';
import turnPipelineFactory from '../turn-pipeline';

vi.mock('@strapi/strapi', () => ({
  factories: {
    createCoreService: (uid: string, cb: any) => cb,
  },
}));

// Mock Strapi Global
const mockTransaction = vi.fn(async (cb) => {
  return cb({ query: vi.fn() }); // Execute callback immediately pass mockTrx
});

const mockDbQuery = {
  update: vi.fn(),
  create: vi.fn(),
};

const mockDocumentService = {
  // Turn Persistence
  create: vi.fn().mockImplementation(() => Promise.resolve({ documentId: 'turn-1' })),
  findOne: vi.fn(),
  findMany: vi.fn().mockResolvedValue([]),
};

const mockActionEngine = {
  dispatch: vi.fn(),
};

const mockQueryFn = vi.fn().mockReturnValue(mockDbQuery);

const globalStrapi = {
  db: {
    transaction: mockTransaction,
    query: mockQueryFn,
  },
  documents: (_uid: string) => mockDocumentService,
  service: (name: string) => {
    if (name === 'api::game.action-engine') return mockActionEngine;
    if (name === 'api::game.lock-service') return { acquire: vi.fn().mockResolvedValue(true), release: vi.fn() };
    return {};
  },
  log: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() },
} as any;

vi.stubGlobal('strapi', globalStrapi);

describe('TurnPipeline (Transactional)', () => {
  const params: any = { strapi: globalStrapi };
  let service: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = turnPipelineFactory(params);
  });

  it('should wrap execution in a transaction and call update via query engine', async () => {
    // 1. Setup Mock Engine Result
    mockActionEngine.dispatch.mockResolvedValue([
      {
        success: true,
        events: [{ type: 'TEST_EVENT' }],
        stateDiff: {
          updates: [{ collection: 'api::entity.entity', documentId: '1', data: { hp: 10 } }],
          creates: [],
          deletes: [],
        },
      },
    ]);

    // 2. Execute
    const result = await service.processTurn('room-1', [{ type: 'command', command: { type: 'TEST' } }]);

    // 3. Verify Transaction
    expect(mockTransaction).toHaveBeenCalled(); // Atomic Constraint Met

    // 4. Verify DB Query usage inside transaction
    // The query Mock should be called with correct UID
    expect(mockQueryFn).toHaveBeenCalledWith('api::entity.entity');

    // 5. Verify Update
    expect(mockDbQuery.update).toHaveBeenCalledWith({
      where: { documentId: '1' },
      data: { hp: 10 },
    });

    expect(result.success).toBe(true);
  });
});
