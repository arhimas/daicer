/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
/**
 * time-frame service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::time-frame.time-frame', ({ strapi }) => ({
  /**
   * Captures a snapshot of the current game state for history replay.
   *
   * @param roomId - The room to snapshot.
   * @param gameState - The full state object (entities, settings, etc).
   * @returns The created TimeFrame entity.
   */
  async createSnapshot(roomId: string, gameState: unknown) {
    const room = await strapi.entityService.findOne('api::room.room', roomId, {
      populate: ['turns'],
    });

    if (!room) {
      throw new Error('Room not found');
    }

    const currentTurnNumber = (room as unknown as { turns: unknown[] }).turns?.length || 0;

    return await strapi.entityService.create('api::time-frame.time-frame', {
      data: {
        turnNumber: currentTurnNumber,
        timestamp: new Date(),
        room: roomId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gameState: gameState as any, // Full snapshot of the world/entities/settings at this moment
      },
    });
  },

  /**
   * Retrieves a Point-of-View filtered game state.
   * Used for reconstructing what a specific player saw at a specific time.
   *
   * @param timeFrameId - The snapshot ID.
   * @param _playerId - The viewer (for filtering fog of war, hidden items).
   * @returns The (potentially filtered) gameState.
   */
  async getPOV(timeFrameId: string, _playerId: string) {
    const timeFrame = await strapi.entityService.findOne('api::time-frame.time-frame', timeFrameId, {
      populate: ['room'],
    });

    if (!timeFrame) {
      throw new Error('Time frame not found');
    }

    // Logic to filter gameState based on playerId (e.g. Fog of War)
    // For now returning full state, to be refined.
    return timeFrame.gameState;
  },
}));
