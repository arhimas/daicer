/**
 * A single log entry from the compilation process.
 */
export interface CompilationLog {
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

/**
 * The final output of a compilation run.
 * Determines if the entity is safe to use in the runtime engine.
 */
export interface CompilationResult {
  success: boolean;
  /**
   * Status to write to the DB component
   */
  status: 'Valid' | 'Invalid' | 'Warning';
  logs: CompilationLog[];
  /**
   * Critical failure summary (for DLQ)
   */
  error?: string;
  timestamp: string;

  compiled?: unknown; // The resulting optimized data blob
  hash?: string; // Fingerprint for change detection
}

export interface ICompiler<T> {
  /**
   * Unique name of the compiler (e.g. "DamageTypeCompiler")
   */
  readonly name: string;

  /**
   * The validation phase this compiler belongs to
   */
  readonly phase: 'Atom' | 'Molecule' | 'Compound' | 'Blueprint';

  /**
   * Run the compilation logic
   * @param subject The entity data to validate
   * @param context Optional shared context (e.g. for caching lookups)
   */
  compile(subject: T, context?: unknown): Promise<CompilationResult>;
}

export abstract class BaseCompiler<T> implements ICompiler<T> {
  abstract readonly name: string;
  abstract readonly phase: 'Atom' | 'Molecule' | 'Compound' | 'Blueprint';

  protected createResult(): CompilationResult {
    return {
      success: true,
      status: 'Valid',
      logs: [],
      timestamp: new Date().toISOString(),
    };
  }

  protected logInfo(result: CompilationResult, message: string, data?: unknown) {
    result.logs.push({ level: 'info', message, data });
  }

  protected logWarn(result: CompilationResult, message: string, data?: unknown) {
    result.logs.push({ level: 'warn', message, data });
    if (result.status === 'Valid') {
      result.status = 'Warning';
    }
  }

  protected logError(result: CompilationResult, message: string, data?: unknown) {
    result.logs.push({ level: 'error', message, data });
    result.success = false;
    result.status = 'Invalid';
    if (!result.error) {
      result.error = message;
    }
  }

  abstract compile(subject: T, context?: unknown): Promise<CompilationResult>;
}
