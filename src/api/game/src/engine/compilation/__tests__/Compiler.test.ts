import { describe, it, expect } from 'vitest';
import { BaseCompiler, CompilationResult } from '@daicer/engine/compilation/Compiler';

// Concrete implementation for testing abstract class
class TestCompiler extends BaseCompiler<string> {
  readonly name = 'TestCompiler';
  readonly phase = 'Atom';

  async compile(subject: string): Promise<CompilationResult> {
    const result = this.createResult();
    if (subject === 'warn') {
      this.logWarn(result, 'Warning message');
    } else if (subject === 'error') {
      this.logError(result, 'Error message');
    } else {
      this.logInfo(result, 'Info message');
    }
    return result;
  }
}

describe('BaseCompiler', () => {
  it('should initialize result with success and valid status', async () => {
    const compiler = new TestCompiler();
    const result = await compiler.compile('valid');

    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
    expect(result.logs[0]).toEqual({ level: 'info', message: 'Info message', data: undefined });
    expect(result.timestamp).toBeDefined();
  });

  it('should escalate status to Warning on logWarn', async () => {
    const compiler = new TestCompiler();
    const result = await compiler.compile('warn');

    expect(result.success).toBe(true);
    expect(result.status).toBe('Warning');
    expect(result.logs[0]).toEqual({ level: 'warn', message: 'Warning message', data: undefined });
  });

  it('should escalate status to Invalid and fail on logError', async () => {
    const compiler = new TestCompiler();
    const result = await compiler.compile('error');

    expect(result.success).toBe(false);
    expect(result.status).toBe('Invalid');
    expect(result.logs[0]).toEqual({ level: 'error', message: 'Error message', data: undefined });
    expect(result.error).toBe('Error message');
  });
});
