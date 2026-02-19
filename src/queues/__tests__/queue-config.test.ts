import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueManager } from '@/queues/queue-manager';
import { QueueName } from '@/queues/contract';

// Mock Strapi Global
const mockFindFirst = vi.fn();
const mockDocuments = vi.fn(() => ({
  findFirst: mockFindFirst,
}));

const mockAdd = vi.fn();
const mockQueueInstance = {
  add: mockAdd,
};

const mockGetQueue = vi.fn(() => mockQueueInstance);
const mockQueueService = {
  get: mockGetQueue,
};

const mockPlugin = vi.fn(() => ({
  service: vi.fn(() => mockQueueService),
}));

const mockLog = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const mockStrapi = {
  documents: mockDocuments,
  plugin: mockPlugin,
  log: mockLog,
} as any;

describe('QueueManager Configuration', () => {
  let queueManager: QueueManager;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton if necessary, or just create a new instance via private constructor hack if needed.
    // Since singleton is protected, we might need to reset the instance property or just mock the static init.
    // But better: we access the private constructor or use 'any' to force inject.
    // For this test, let's assume we can re-init or we just manually instantiate if we export it or use checking.
    // Actually, QueueManager has a private constructor.
    // We can use the static init method with our mock.

    // Reset instance for testing
    (QueueManager as any).instance = undefined;
    queueManager = QueueManager.init(mockStrapi);
  });

  it('should allow job when configuration is missing (fail-open for config, fail-close for errors)', async () => {
    mockFindFirst.mockResolvedValue(null); // No config found

    await queueManager.add(QueueName.GENERATE_TEXT_LOCAL, 'test-job', {
      prompt: 'test',
      targetUid: 'api::test',
      targetId: '1',
      field: 'desc',
    });

    expect(mockAdd).toHaveBeenCalled();
  });

  it('should reject job when globalEnabled is false', async () => {
    mockFindFirst.mockResolvedValue({
      globalEnabled: false,
    });

    await expect(
      queueManager.add(QueueName.GENERATE_TEXT_LOCAL, 'test-job', {
        prompt: 'test',
        targetUid: 'api::test',
        targetId: '1',
        field: 'desc',
      })
    ).rejects.toThrow('Queues are globally disabled');

    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('should reject job when specific queue is disabled', async () => {
    mockFindFirst.mockResolvedValue({
      globalEnabled: true,
      queues: [
        {
          queueName: QueueName.GENERATE_TEXT_LOCAL,
          enabled: false,
        },
      ],
    });

    await expect(
      queueManager.add(QueueName.GENERATE_TEXT_LOCAL, 'test-job', {
        prompt: 'test',
        targetUid: 'api::test',
        targetId: '1',
        field: 'desc',
      })
    ).rejects.toThrow(`Queue '${QueueName.GENERATE_TEXT_LOCAL}' is disabled`);

    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('should inject settings from configuration', async () => {
    mockFindFirst.mockResolvedValue({
      globalEnabled: true,
      queues: [
        {
          queueName: QueueName.GENERATE_TEXT_LOCAL,
          enabled: true,
          settings: {
            retryAttempts: 5,
            retryDelay: 2000,
            removeOnComplete: false,
            removeOnFail: true,
            // timeout: 5000,
          },
        },
      ],
    });

    await queueManager.add(QueueName.GENERATE_TEXT_LOCAL, 'test-job', {
      prompt: 'test',
      targetUid: 'api::test',
      targetId: '1',
      field: 'desc',
    });

    expect(mockAdd).toHaveBeenCalledWith(
      'test-job',
      expect.anything(),
      expect.objectContaining({
        attempts: 5,
        backoff: { type: 'fixed', delay: 2000 },
        removeOnComplete: false,
        removeOnFail: true,
        // timeout: 5000,
      })
    );
  });

  it('should allow usage of default valid job payload', async () => {
    mockFindFirst.mockResolvedValue(null);

    const payload = {
      prompt: 'test',
      targetUid: 'api::test',
      targetId: '1',
      field: 'desc',
    };

    await queueManager.add(QueueName.GENERATE_TEXT_LOCAL, 'test', payload);
    expect(mockAdd).toHaveBeenCalled();
  });

  it('should throw validation error for invalid payload', async () => {
    mockFindFirst.mockResolvedValue(null);

    const invalidPayload = {
      prompt: 123, // Invalid type
    } as any;

    await expect(queueManager.add(QueueName.GENERATE_TEXT_LOCAL, 'test', invalidPayload)).rejects.toThrow(
      'Invalid job payload'
    );
  });
});
