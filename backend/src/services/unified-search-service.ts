// Unified Search Service
// import { embeddingService } from './embedding-service'; // Removed unused

// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
declare var strapi: any; // Global Strapi

export interface UnifiedSearchResult {
  id: string | number;
  documentId?: string;
  title: string;
  excerpt: string;
  score: number;
  sourceId?: number;
  sourceName?: string;
  tags?: string[];
  kind: 'entity' | 'knowledge';
  entityUid?: string;
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  tags?: string[];
  targets?: string[];
}

export class UnifiedSearchService {
  /**
   * Proxies to new State-of-the-Art Semantic Search Plugin
   */
  async search(query: string, options: SearchOptions = {}): Promise<UnifiedSearchResult[]> {
    if (!query) return [];

    try {
      const service = strapi.plugin('semantic-search').service('searchService');
      if (!service) {
        strapi.log.error('UnifiedSearchService: Semantic Search Plugin not found');
        return [];
      }

      const { targets, limit = 5 } = options;

      // Plugin expects { query, targets, limit }
      const results = await service.search({
        query,
        targets,
        limit,
      });

      return results;
    } catch (error) {
      strapi.log.error('UnifiedSearchService Error:', error);
      return [];
    }
  }

  // Legacy wrapper for entity search (deprecated)
  async searchEntities(query: string, limit: number = 5): Promise<UnifiedSearchResult[]> {
    return this.search(query, {
      limit,
      targets: ['spell', 'monster', 'class', 'race', 'character'], // Search all entities
    });
  }
}

export const unifiedSearchService = new UnifiedSearchService();
