import { EventEmitter } from 'events';
// Import the class and singleton
import { EmbeddingService } from '../embedding-service';
import { spawn } from 'child_process';

vi.mock('child_process', () => {
  return {
    spawn: vi.fn(() => ({
      stdout: { on: () => {}, pipe: () => {}, resume: () => {} },
      stdin: { write: () => {} },
      stderr: { on: () => {} },
      on: () => {},
      kill: () => {},
      unref: () => {},
    }))
  };
});

describe('EmbeddingService (Jina V3 Bridge)', () => {
  let mockStdout: EventEmitter & { push?: (chunk: string) => void; read?: Mock };
  let mockStdin: { write: Mock };
  let mockStderr: EventEmitter;
  let mockProcess: EventEmitter & { stdout: any; stdin: any; stderr: any; kill: Mock };

  beforeEach(() => {
    // Reset the mock implementation for each test to our reliable test-process
    const mockedSpawn = vi.mocked(spawn);
    mockedSpawn.mockReset();

    // Create mock streams
    mockStdout = new EventEmitter() as any;
    mockStdout.push = (chunk: string) => mockStdout.emit('data', chunk);
    mockStdout.push = (chunk: string) => mockStdout.emit('data', chunk);
    mockStdout.read = vi.fn();
    (mockStdout as any).resume = vi.fn();

    mockStdin = { write: vi.fn() };

    mockStderr = new EventEmitter();

    // Mock ChildProcess
    mockProcess = new EventEmitter() as any;
    mockProcess.stdout = mockStdout;
    mockProcess.stdin = mockStdin;
    mockProcess.stderr = mockStderr;
    mockProcess.kill = vi.fn();
    (mockProcess as any).unref = vi.fn();

    // Robust default Return Value
    mockedSpawn.mockReturnValue(mockProcess);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize python process on first request', async () => {
    const service = new EmbeddingService();
    // Should not have called spawn yet
    expect(vi.mocked(spawn)).not.toHaveBeenCalled();

    // Trigger request without awaiting result yet (to avoid hanging on missing queues)
    const promise = service.generateEmbedding('test');
    
    expect(vi.mocked(spawn)).toHaveBeenCalledWith('python3', expect.arrayContaining([expect.stringContaining('service.py')]), expect.any(Object));
    
    // Cleanup to prevent unhandled promise rejection in this specific test scope if we don't mock response
    mockStdout.push && mockStdout.push(JSON.stringify({ status: 'ready' }) + '\n');
    mockStdout.push && mockStdout.push(JSON.stringify({ vector: [] }) + '\n');
    await promise; 
  });

  it('should process queue when service becomes ready', async () => {
    const service = new EmbeddingService();

    const promise = service.generateEmbedding('test text');
    
    // Emit Ready Signal AFTER listeners are attached (lazy init)
    mockStdout.push && mockStdout.push(JSON.stringify({ status: 'ready' }) + '\n');

    // Simulate Response
    setTimeout(() => {
      mockStdout.push && mockStdout.push(JSON.stringify({ vector: [0.1, 0.2] }) + '\n');
    }, 10);
    
    const result = await promise;
    expect(result).toEqual([0.1, 0.2]);
  });

  it('should handle errors from python service', async () => {
    const service = new EmbeddingService();
    
    const promise = service.generateEmbedding('fail text');
    
    // Emit Ready Signal AFTER listeners are attached
    mockStdout.push && mockStdout.push(JSON.stringify({ status: 'ready' }) + '\n');
    
    setTimeout(() => {
      mockStdout.push && mockStdout.push(JSON.stringify({ error: 'Python Error' }) + '\n');
    }, 10);
    
    await expect(promise).rejects.toThrow('Embedding Service Error: Python Error');
  });

  it('should explicitly pass task and prompt_name to python', async () => {
    const service = new EmbeddingService();
    
    // Spy on stdin.write (it's already a mock)
    const writeSpy = mockStdin.write;

    service.generateEmbedding('query', 'retrieval.query');
    
    // Emit Ready Signal AFTER listeners are attached
    mockStdout.push && mockStdout.push(JSON.stringify({ status: 'ready' }) + '\n');

    // Wait for event loop
    await new Promise(r => setTimeout(r, 0));

    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('"task":"retrieval.query"'));
    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('"text":"query"'));
  });

  it('should return empty array for empty input', async () => {
    const service = new EmbeddingService();
    const result = await service.generateEmbedding('');
    expect(result).toEqual([]);
    expect(mockStdin.write).not.toHaveBeenCalled();
  });
});
