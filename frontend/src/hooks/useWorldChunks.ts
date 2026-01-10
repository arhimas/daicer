/**
 * useWorldChunks Hook
 * Stubbed for GraphQL Migration - Sockets Removed
 */

import { useCallback } from 'react';

export interface ChunkCoord {
  chunkX: number;
  chunkY: number;
  chunkZ: number;
}

export interface ChunkData {
  worldId: string;
  chunkX: number;
  chunkY: number;
  chunkZ: number;
  tiles: Array<{
    x: number;
    y: number;
    z: number;
    biome: string;
    elevation: number;
    isWalkable?: boolean;
    blockType?: string;
  }>;
  biomes: string[];
}

interface UseWorldChunksOptions {
  worldId: string | null;
  onChunkLoaded?: (chunk: ChunkData) => void;
  onChunkStart?: () => void;
  onError?: (error: string) => void;
  onBatchComplete?: (count: number) => void;
}

export function useWorldChunks({
  worldId,
  onChunkLoaded: _onChunkLoaded,
  onChunkStart: _onChunkStart,
  onError: _onError,
  onBatchComplete: _onBatchComplete,
}: UseWorldChunksOptions) {
  const requestChunk = useCallback(
    (_chunkX: number, _chunkY: number, _chunkZ: number) => {
      // TODO: Fetch via GraphQL
      console.warn('useWorldChunks: requestChunk not implemented (GraphQL migration pending)');
    },
    [worldId]
  );

  const requestChunks = useCallback(
    (_chunks: ChunkCoord[]) => {
      // TODO: Fetch via GraphQL
      console.warn('useWorldChunks: requestChunks not implemented (GraphQL migration pending)');
    },
    [worldId]
  );

  const clearCache = useCallback(() => {
    // No-op
  }, []);

  return {
    requestChunk,
    requestChunks,
    clearCache,
    isConnected: true, // Stubbed assumption
  };
}
