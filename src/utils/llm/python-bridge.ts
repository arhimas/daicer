
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import readline from 'readline';

interface BridgeRequest {
  id: string;
  command: 'load' | 'generate';
  payload: Record<string, any>;
  resolve: (data: any) => void;
  reject: (error: any) => void;
}

/**
 * Manages a persistent Python child process for LLM inference.
 * Communicates via JSON-RPC over stdin/stdout.
 */
export class PythonBridge {
  private pythonProcess: ChildProcess | null = null;
  private pendingRequests: Map<string, BridgeRequest> = new Map();
  private rl: readline.Interface | null = null;
  private bridgePath = path.join(process.cwd(), 'python-llm');
  
  constructor() {
    this.startProcess();
  }
  
  private startProcess() {
    console.log('[PythonBridge] Starting python bridge...');
    
    // Using poetry to run the script inside the virtualenv
    this.pythonProcess = spawn('poetry', ['run', 'python', 'bridge.py'], {
      cwd: this.bridgePath,
      env: { ...process.env, PYTHONUNBUFFERED: '1' }, // Ensure unbuffered output
      stdio: ['pipe', 'pipe', 'inherit'], // Pipe stdin/stdout, inherit stderr for logs
    });

    if (this.pythonProcess.stdout) {
      this.rl = readline.createInterface({ input: this.pythonProcess.stdout });
      this.rl.on('line', (line) => this.handleResponse(line));
    }

    this.pythonProcess.on('exit', (code) => {
      console.warn(`[PythonBridge] Process exited with code ${code}. Restarting...`);
      this.pythonProcess = null;
      this.rl = null;
      // Reject all pending
      this.pendingRequests.forEach(req => req.reject(new Error('Process crashed')));
      this.pendingRequests.clear();
      
      // Simple backoff restart
      setTimeout(() => this.startProcess(), 1000);
    });
  }

  private handleResponse(line: string) {
    try {
      if (!line.trim()) return;
      const response = JSON.parse(line);
      const { id, status, data, error } = response;
      
      const req = this.pendingRequests.get(id);
      if (req) {
        if (status === 'success') {
          req.resolve(data);
        } else {
          req.reject(new Error(error || 'Unknown error'));
        }
        this.pendingRequests.delete(id);
      }
    } catch (e) {
      console.error('[PythonBridge] Failed to parse response:', line, e);
    }
  }

  public async send(command: 'load' | 'generate', payload: any): Promise<any> {
    if (!this.pythonProcess || !this.pythonProcess.stdin) {
      throw new Error('Python bridge not ready');
    }

    const id = Math.random().toString(36).substring(7);
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { id, command, payload, resolve, reject });
      
      const request = JSON.stringify({ id, command, payload });
      this.pythonProcess!.stdin!.write(request + '\n');
    });
  }
  
  /**
   * Commands the python process to load a specific model into memory.
   */
  public async loadModel(modelId: string, quantization?: string) {
      return this.send('load', { model: modelId, quantization });
  }

  /**
   * Commands the python process to generate text.
   */
  public async generate(prompt: string, maxTokens: number = 256, temperature: number = 0.7) {
      return this.send('generate', { prompt, max_new_tokens: maxTokens, temperature });
  }
}
