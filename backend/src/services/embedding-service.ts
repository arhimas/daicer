import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import readline from 'readline';

export type EmbeddingTask = 'retrieval.query' | 'retrieval.passage' | 'text-matching' | 'separation' | 'classification';

interface EmbeddingResponse {
  vector?: number[];
  error?: string;
  status?: string;
}

interface QueueItem {
  text: string;
  task: EmbeddingTask;
  resolve: (value: number[]) => void;
  reject: (reason?: any) => void;
  sent: boolean;
}

/**
 * Service for generating vector embeddings using Jina-Embeddings-v3 via a local Python bridge.
 * 
 * 🚀 **SOTA Implementation**: 
 * - Replaces network-heavy OpenAI calls with local, high-performance Jina V3.
 * - Uses persistent Python child process to avoid model reload overhead (Zero-Latency).
 * - Supports task-specific embedding modes (retrieval vs matching).
 */
export class EmbeddingService {
  private pythonProcess: ChildProcess | null = null;
  private isReady: boolean = false;
  private queue: QueueItem[] = [];

  constructor() {
    this.spawnPythonProcess();
  }

  private spawnPythonProcess() {
    const scriptPath = path.join(process.cwd(), 'src/scripts/embedding/service.py');
    
    // We use the system python3. In a real-world prod env, this might need a specific venv path.
    this.pythonProcess = spawn('python3', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (!this.pythonProcess.stdout || !this.pythonProcess.stdin || !this.pythonProcess.stderr) {
      throw new Error('Failed to spawn embedding service: stdio pipes are missing');
    }

    const rl = readline.createInterface({
      input: this.pythonProcess.stdout,
      terminal: false,
    });

    rl.on('line', (line) => {
      try {
        const data = JSON.parse(line) as EmbeddingResponse;
        
        if (data.status === 'ready') {
          console.log('✅ [EmbeddingService] Jina V3 Model Ready');
          this.isReady = true;
          this.processQueue();
          return;
        }

        const request = this.queue.shift();
        if (!request) return;

        if (data.error) {
          request.reject(new Error(`Embedding Service Error: ${data.error}`));
        } else if (data.vector) {
          request.resolve(data.vector);
        } else {
          request.reject(new Error('Invalid response from embedding service'));
        }
      } catch (err) {
        console.error('❌ [EmbeddingService] JSON Parse Error:', err);
      }
    });

    this.pythonProcess.stderr.on('data', (data) => {
      // Filter out benign logs if needed, but error output is useful
      console.error(`🔴 [EmbeddingService] Python Log: ${data.toString().trim()}`);
    });

    this.pythonProcess.on('close', (code) => {
      console.warn(`⚠️ [EmbeddingService] Process exited with code ${code}. Restarting...`);
      this.isReady = false;
      // Mark all in-flight as not sent so they get retried?
      // Actually, if process died, the in-flight ones verify failed.
      // But for simplicity, we just clear/fail them or restart.
      // Failing them is safer to avoid deadlocks.
      this.queue.forEach(item => item.sent = false);
      
      setTimeout(() => this.spawnPythonProcess(), 2000);
    });
  }

  private processQueue() {
    if (!this.isReady || !this.pythonProcess?.stdin) return;
    
    for (const item of this.queue) {
      if (!item.sent) {
        this.writeRequest(item);
        item.sent = true;
      }
    }
  }

  private writeRequest(item: QueueItem) {
    try {
      const payload = JSON.stringify({ text: item.text, task: item.task }) + '\n';
      this.pythonProcess?.stdin?.write(payload);
    } catch (err) {
      console.error('Failed to write to python process', err);
      item.reject(err);
    }
  }
  
  /**
   * Generates a vector embedding for the given text.
   * @param text The text to embed.
   * @param task The intended use case (default: text-matching).
   * @returns A promise resolving to the embedding vector.
   */
  async generateEmbedding(text: string, task: EmbeddingTask = 'text-matching'): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ text, task, resolve, reject, sent: false });
      this.processQueue();
    });
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();

// Singleton instance
export const embeddingService = new EmbeddingService();
