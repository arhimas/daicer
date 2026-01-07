import { OpenAIEmbeddings } from '@langchain/openai';

/**
 * Service for generating vector embeddings using OpenAI via LangChain.
 * Model: text-embedding-3-large
 */
export class EmbeddingService {
  private embeddings: OpenAIEmbeddings;
  private modelName = 'text-embedding-3-small';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    this.embeddings = new OpenAIEmbeddings({
      model: this.modelName,
      apiKey: apiKey,
      // Optional: dimensions can be set if we want to save space, but default (3072) is best for quality
      // dimensions: 1536,
    });
  }

  /**
   * Generates a vector embedding for the given text.
   * @param text The text to embed.
   * @returns A promise resolving to the embedding vector (array of numbers).
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      console.error('[EmbeddingService] Failed to generate embedding:', error);
      throw error;
    }
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
