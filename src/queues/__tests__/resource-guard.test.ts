import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResourceGuard, SystemOverloadError } from '../resource-guard';
import os from 'os';

describe('ResourceGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should pass given no limits', async () => {
    await expect(ResourceGuard.check({})).resolves.not.toThrow();
    await expect(ResourceGuard.check(undefined)).resolves.not.toThrow();
  });

  it('should pass when memory usage is within limits', async () => {
    // Mock memory usage to return 100MB
    vi.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 100 * 1024 * 1024,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    });

    await expect(ResourceGuard.check({ maxMemoryMB: 200 })).resolves.not.toThrow();
  });

  it('should throw SystemOverloadError when memory usage exceeds limits', async () => {
    // Mock memory usage to return 300MB
    vi.spyOn(process, 'memoryUsage').mockReturnValue({
      rss: 300 * 1024 * 1024,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    });

    await expect(ResourceGuard.check({ maxMemoryMB: 200 })).rejects.toThrow(SystemOverloadError);
    await expect(ResourceGuard.check({ maxMemoryMB: 200 })).rejects.toThrow(/Memory limit exceeded/);
  });

  it('should pass when CPU usage is within limits', async () => {
    // Mock 4 CPUs
    vi.spyOn(os, 'cpus').mockReturnValue(new Array(4).fill({}));
    // Mock load average to be 1.0 (25% load on 4 CPUs)
    vi.spyOn(os, 'loadavg').mockReturnValue([1.0, 0, 0]);

    await expect(ResourceGuard.check({ maxCpuPercent: 50 })).resolves.not.toThrow();
  });

  it('should throw SystemOverloadError when CPU usage exceeds limits', async () => {
    // Mock 4 CPUs
    vi.spyOn(os, 'cpus').mockReturnValue(new Array(4).fill({}));
    // Mock load average to be 3.0 (75% load on 4 CPUs)
    vi.spyOn(os, 'loadavg').mockReturnValue([3.0, 0, 0]);

    await expect(ResourceGuard.check({ maxCpuPercent: 50 })).rejects.toThrow(SystemOverloadError);
    await expect(ResourceGuard.check({ maxCpuPercent: 50 })).rejects.toThrow(/CPU limit exceeded/);
  });
});
