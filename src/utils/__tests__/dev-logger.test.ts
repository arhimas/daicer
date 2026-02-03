import { describe, it, expect, vi } from 'vitest';
import { DevLogger } from '@/utils/dev-logger';

describe('DevLogger', () => {
  it('should call strapi log methods with scope', () => {
    const mockLog = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
    const mockStrapi = { log: mockLog } as any;
    const logger = new DevLogger('TestModule', mockStrapi);

    logger.info('Hello', { extra: 1 });
    expect(mockLog.info).toHaveBeenCalledWith('Hello', { scope: 'TestModule', extra: 1 });

    logger.warn('Warning');
    expect(mockLog.warn).toHaveBeenCalledWith('Warning', { scope: 'TestModule' });

    logger.debug('Debug');
    expect(mockLog.debug).toHaveBeenCalledWith('Debug', { scope: 'TestModule' });
  });

  it('should handle errors correctly', () => {
    const mockLog = { error: vi.fn() };
    const mockStrapi = { log: mockLog } as any;
    const logger = new DevLogger('Test', mockStrapi);

    const err = new Error('Kaboom');
    logger.error('Something failed', err);
    expect(mockLog.error).toHaveBeenCalledWith('Something failed', {
      scope: 'Test',
      error: { message: 'Kaboom', stack: expect.any(String) },
    });
  });

  it('should measure time with start()', () => {
    const mockLog = { info: vi.fn() };
    const mockStrapi = { log: mockLog } as any;
    const logger = new DevLogger('Timer', mockStrapi);

    const timer = logger.start('MyJob');
    expect(mockLog.info).toHaveBeenCalledWith(expect.stringContaining('Starting: MyJob'), expect.anything());

    timer.end();
    expect(mockLog.info).toHaveBeenCalledWith(expect.stringContaining('Finished: MyJob'), expect.any(Object));

    // Verify duration is present
    const lastCall = mockLog.info.mock.calls[1][1];
    expect(lastCall.durationMs).toBeGreaterThanOrEqual(0);
  });
});
