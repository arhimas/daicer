
import { Core } from '@strapi/strapi';

interface Position {
  x: number;
  y: number;
  z: number;
}

// TODO: Make this configurable per room/world?
const VIEW_RADIUS_CHUNKS = 1; // 3x3 Grid around player
const VIEW_RADIUS_TILES = 20; // Exact tile distance check

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Calculates the coordinates of chunks visible from a center point.
   * Used for loading/streaming relevant map data.
   *
   * @param centerPos - The observer's position.
   * @returns Array of chunk coordinates {x, y}.
   */
  getVisibleChunkCoords(centerPos: Position) {
    const centerChunkX = Math.floor(centerPos.x / 16);
    const centerChunkY = Math.floor(centerPos.y / 16);

    const visibleChunks = [];
    for (let x = -VIEW_RADIUS_CHUNKS; x <= VIEW_RADIUS_CHUNKS; x++) {
      for (let y = -VIEW_RADIUS_CHUNKS; y <= VIEW_RADIUS_CHUNKS; y++) {
        visibleChunks.push({ x: centerChunkX + x, y: centerChunkY + y });
      }
    }
    return visibleChunks;
  },

  isEntityVisible(observerPos: Position, targetPos: Position) {
    // 1. Z-Level Check (Basic)
    if (Math.abs(observerPos.z - targetPos.z) > 10) return false;

    // 2. Distance Check (Euclidean)
    const dx = observerPos.x - targetPos.x;
    const dy = observerPos.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= VIEW_RADIUS_TILES;
  },

  /**
   * Culls entities that are not visible to the observer.
   * Can be extended to support raycasting/LOS in the future.
   */
  cullEntities(
    observerPos: Position,
    allEntities: { position?: Position; character?: { position?: Position } }[]
  ): unknown[] {
    return allEntities.filter((entity) => {
      // Always see yourself
      // (This logic usually runs in resolver where we might not know 'self' ID easily without passing it)
      // Pass 'observerId' if needed. For now, assume observerPos matches entity.position means self?
      // No, multiple entities can be at same pos.

      const pos = entity.position || entity.character?.position || { x: 0, y: 0, z: 0 };
      return this.isEntityVisible(observerPos, pos);
    });
  },
});
