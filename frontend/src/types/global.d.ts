import type { Tile } from '@/types/contracts';

export {};

declare global {
  interface Window {
    __TERRAIN_GRID__: Tile[][] | (Tile | null)[][];
  }
}
