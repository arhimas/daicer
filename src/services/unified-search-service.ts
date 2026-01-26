import type { Core } from '@strapi/strapi';
declare let strapi: Core.Strapi;

/**
 * Represents a result from the unified search service.
 * Normalized format for entities, knowledge snippets, or other searchable content.
 */
export interface UnifiedSearchResult {
  /** The unique ID of the result (ID or DocumentID). */
  id: string | number;
  /** The Strapi Document ID (if applicable). */
  documentId?: string;
  /** Display title for the result. */
  title: string;
  /** Short text excerpt or description. */
  excerpt: string;
  /** Relevance score (0-1). */
  score: number;
  /** ID of the source system/plugin. */
  sourceId?: number;
  /** Name of the source system. */
  sourceName?: string;
  /** Associated metadata tags. */
  tags?: string[];
  /** Classification of the result. */
  kind: 'entity' | 'knowledge';
  /** Strapi UID of the entity (e.g. api::spell.spell). */
  entityUid?: string;
  /** ID of the specific entity instance. */
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

/**
 * Options for configuring the search query.
 */
export interface SearchOptions {
  /** Maximum number of results to return. */
  limit?: number;
  /** Minimum relevance score threshold (0-1). */
  threshold?: number;
  /** Filter by specific tags. */
  tags?: string[];
  /** Filter by specific target content types/sources. */
  targets?: string[];
}

/**
 * Central service for handling search operations across the application.
 * Proxies requests to the underlying Semantic Search plugin or other search providers.
 */
export class UnifiedSearchService {
  /**
   * Performs a unified semantic search.
   * Proxies to new State-of-the-Art Semantic Search Plugin.
   *
   * @param query - The search query text.
   * @param options - Configuration options for the search.
   * @returns A promise resolving to an array of UnifiedSearchResult.
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

  /**
   * Legacy wrapper for entity-only search.
   * Searches across all game entity types (spell, monster, class, etc.).
   *
   * @param query - The search query text.
   * @param limit - Max results (default: 5).
   * @deprecated Use search() with explicit targets if needed.
   */
  async searchEntities(query: string, limit: number = 5): Promise<UnifiedSearchResult[]> {
    return this.search(query, {
      limit,
      targets: ['spell', 'monster', 'class', 'race', 'character'], // Search all entities
    });
  }
}

export const unifiedSearchService = new UnifiedSearchService();
