import os from 'os';

export interface ResourceLimits {
  maxMemoryMB?: number;
  maxCpuPercent?: number;
}

export class SystemOverloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemOverloadError';
  }
}

export class ResourceGuard {
  /**
   * Checks if the system has enough resources to process a job.
   * Throws SystemOverloadError if limits are exceeded.
   */
  static async check(limits?: ResourceLimits): Promise<void> {
    if (!limits) return;

    if (limits.maxMemoryMB) {
      const memoryUsage = process.memoryUsage();
      const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);

      if (rssMB > limits.maxMemoryMB) {
        throw new SystemOverloadError(
          `Memory limit exceeded: Used ${rssMB}MB > Limit ${limits.maxMemoryMB}MB`
        );
      }
    }

    if (limits.maxCpuPercent) {
      // os.loadavg() returns [1, 5, 15] minutes load average
      // detailed load calculation is complex, so we use a simplified heuristic for now
      // Load average / Number of CPUs = Load Factor. 
      // If factor > 1, the CPU is fully utilized.
      const cpus = os.cpus().length;
      const loadAvg1Min = os.loadavg()[0];
      const loadPercent = Math.round((loadAvg1Min / cpus) * 100);

      if (loadPercent > limits.maxCpuPercent) {
        throw new SystemOverloadError(
          `CPU limit exceeded: Load ${loadPercent}% > Limit ${limits.maxCpuPercent}%`
        );
      }
    }
  }
}
