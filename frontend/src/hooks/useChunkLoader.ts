import { useState, useRef, useCallback, useEffect } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client';
import type { Chunk, WorldConfig } from '../features/debug/utils/types';

interface UseChunkLoaderProps {
  config: WorldConfig;
}

const VOXEL_PREVIEW_QUERY = gql`
  query VoxelPreview($chunks: [ChunkRequestInput]!, $config: WorldConfigInput!) {
    voxelPreview(chunks: $chunks, config: $config) {
      x
      y
      tiles
    }
  }
`;

export function useChunkLoader({ config }: UseChunkLoaderProps) {
  const client = useApolloClient();
  const [chunkCache, setChunkCache] = useState<Record<string, Chunk>>({});
  const [loadingChunks, setLoadingChunks] = useState<Set<string>>(new Set());
  const [isRegenerating, setIsRegenerating] = useState(false);

  const batchQueue = useRef<Set<string>>(new Set());
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);
  const generationId = useRef(0);

  const getChunkId = useCallback((cx: number, cy: number) => `${cx},${cy}`, []);

  // Clear cache when critical config changes
  const configKey = JSON.stringify(config);
  useEffect(() => {
    console.log('[useChunkLoader] Config changed!', configKey);
    generationId.current += 1; // Increment generation ID
    setChunkCache({});
    setLoadingChunks(new Set());
    batchQueue.current.clear();
    setIsRegenerating(true);

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
      batchTimeout.current = null;
    }

    // Allow a small tick for the reset to propagate before considered "done" if nothing is fetched
    const t = setTimeout(() => setIsRegenerating(false), 100);
    return () => clearTimeout(t);
  }, [configKey]);

  const processBatch = useCallback(async () => {
    if (batchQueue.current.size === 0) return;

    const queuedIds = Array.from(batchQueue.current);
    batchQueue.current.clear();
    batchTimeout.current = null;

    const currentGen = generationId.current; // Capture current generation ID
    console.log(`[useChunkLoader] Processing batch for Gen ${currentGen}. chunks: ${queuedIds.join(', ')}`);

    const chunksToFetch = queuedIds
      .map((id) => {
        const [x, y] = id.split(',').map(Number);
        if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return null;
        return { x, y };
      })
      .filter((c): c is { x: number; y: number } => c !== null);

    if (chunksToFetch.length === 0) {
      setLoadingChunks((prev) => {
        const next = new Set(prev);
        queuedIds.forEach((id) => next.delete(id));
        return next;
      });
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await client.query<any>({
        query: VOXEL_PREVIEW_QUERY,
        variables: {
          chunks: chunksToFetch,
          config,
        },
        fetchPolicy: 'network-only',
      });

      // Check if generation ID has changed during fetch
      if (generationId.current !== currentGen) {
        console.warn('useChunkLoader: Discarding stale chunks from Gen', currentGen, 'Current:', generationId.current);
        return;
      }

      const results = data?.voxelPreview;
      console.log(
        `[useChunkLoader] Gen ${currentGen} received ${results?.length} chunks. Sample tile:`,
        results?.[0]?.tiles?.[0]
      );

      if (Array.isArray(results)) {
        setChunkCache((prev) => {
          const next = { ...prev };
          results.forEach((chunk: Chunk, index: number) => {
            const req = chunksToFetch[index];
            if (req) {
              const id = getChunkId(req.x, req.y);
              console.info('useChunkLoader: Caching chunk', id, chunk ? 'FOUND' : 'NULL');
              next[id] = chunk;
            }
          });
          return next;
        });
      }
    } catch (e) {
      console.error('Batch Chunk Fetch Failed:', e);
    } finally {
      // Only update loading state if we correspond to current generation
      if (generationId.current === currentGen) {
        setLoadingChunks((prev) => {
          const next = new Set(prev);
          queuedIds.forEach((id) => next.delete(id));
          return next;
        });
        // Simple heuristic: if queue empty, regeneration is settled for now
        if (batchQueue.current.size === 0) {
          setIsRegenerating(false);
        }
      }
    }
  }, [client, config, getChunkId]);

  const fetchChunk = useCallback(
    (cx: number, cy: number) => {
      const id = getChunkId(cx, cy);
      // Warning: Check current state in ref or functional update to avoid closures?
      // Actually standard check is fine IF dependencies are correct.
      // We can't easily check chunkCache here without adding it to dependency (causing re-creation).
      // Instead, we rely on the component using this hook to check cache BEFORE calling fetchChunk,
      // OR we check loadingChunks/batchQueue here which are refs/state.

      // Ideally, getChunk should check cache.
      // fetchChunk is the *action* to fetch.

      batchQueue.current.add(id);
      setLoadingChunks((prev) => new Set(prev).add(id));
      setIsRegenerating(true);

      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
      batchTimeout.current = setTimeout(processBatch, 50);
    },
    // We remove config from dependency array to prevent fetchChunk recreation on every keystroke
    // processBatch needs to be fresh, but that is defined in render scope.
    // Wait, processBatch captures render scope variables.
    // fetchChunk captures processBatch.
    // So if config changes -> component re-renders -> processBatch recreated (capturing NEW config) -> fetchChunk recreated -> good.
    // With Debounce, this happens less often.
    [getChunkId, processBatch]
  );

  const getChunk = useCallback(
    (x: number, y: number) => {
      const id = getChunkId(x, y);
      if (chunkCache[id]) return chunkCache[id];

      // Note: We don't verify if it's already loading here to keep 'get' pure-ish,
      // but the consumer usually calls fetch if null.
      // To make this easier:
      if (!loadingChunks.has(id) && !batchQueue.current.has(id)) {
        fetchChunk(x, y);
      }
      return null;
    },
    [chunkCache, fetchChunk, getChunkId, loadingChunks]
  );

  return {
    chunkCache,
    isLoading: loadingChunks.size > 0 || isRegenerating,
    getChunk,
    resetCache: () => setChunkCache({}),
  };
}
