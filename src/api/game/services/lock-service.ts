/**
 * LockService
 * Handles pessimistic locking for Room Turns to prevent race conditions.
 */
import { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Attempt to acquire a lock for a room.
   * @param roomId The ID of the room to lock.
   * @param holderId The ID of the entity/process requesting the lock.
   * @param ttlSeconds Time-to-live for the lock in seconds.
   * @returns true if lock acquired, false if already locked.
   */
  async acquire(roomId: string, holderId: string, ttlSeconds: number = 5): Promise<boolean> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    // 1. Cleanup: Remove ANY expired locks for this room first (lazy expiration)
    // we search for locks for this room that are expired.
    // Note: We can't easily query "room.id" effectively in a deleteMany sometimes,
    // but let's try standard filtering.
    // Actually, finding the lock first is safer.

    const existingLocks = await strapi.documents('api::turn-lock.turn-lock').findMany({
      filters: {
        room: { documentId: roomId },
      },
    });

    if (existingLocks.length > 0) {
      // Check if valid
      const lock = existingLocks[0];
      const expiry = new Date(lock.expires_at);

      if (expiry > now) {
        // Lock is valid and active.
        // Identify who holds it?
        strapi.log.warn(`[LockService] Room ${roomId} is locked by ${lock.holder_id} until ${expiry.toISOString()}`);
        return false;
      } else {
        // Lock is expired. We can "steal" it or delete/recreate.
        // Let's delete it.
        strapi.log.info(`[LockService] Found expired lock for Room ${roomId}, cleaning up.`);
        await strapi.documents('api::turn-lock.turn-lock').delete({ documentId: lock.documentId });
      }
    }

    // 2. Create the lock
    // There is a tiny race condition here if two requests pass step 1 simultaneously.
    // Unique index on 'room' would solve this at DB level.
    try {
      await strapi.documents('api::turn-lock.turn-lock').create({
        data: {
          room: roomId,
          holder_id: holderId,
          locked_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      });
      strapi.log.info(`[LockService] Lock acquired for Room ${roomId} by ${holderId}`);
      return true;
    } catch (error) {
      strapi.log.error(`[LockService] Failed to create lock for Room ${roomId}:`, error);
      return false;
    }
  },

  /**
   * Release a lock if held by the holder.
   * @param roomId
   * @param holderId
   */
  async release(roomId: string, holderId: string): Promise<void> {
    const locks = await strapi.documents('api::turn-lock.turn-lock').findMany({
      filters: {
        room: { documentId: roomId },
        holder_id: holderId,
      },
    });

    for (const lock of locks) {
      await strapi.documents('api::turn-lock.turn-lock').delete({ documentId: lock.documentId });
    }
    strapi.log.info(`[LockService] Lock released for Room ${roomId} by ${holderId}`);
  },

  /**
   * Force release lock (admin/watchdog).
   * @param roomId
   */
  async forceRelease(roomId: string): Promise<void> {
    const locks = await strapi.documents('api::turn-lock.turn-lock').findMany({
      filters: {
        room: { documentId: roomId },
      },
    });

    for (const lock of locks) {
      await strapi.documents('api::turn-lock.turn-lock').delete({ documentId: lock.documentId });
    }
    strapi.log.info(`[LockService] Force released lock for Room ${roomId}`);
  },

  async isLocked(roomId: string): Promise<boolean> {
    const locks = await strapi.documents('api::turn-lock.turn-lock').findMany({
      filters: {
        room: { documentId: roomId },
        expires_at: {
          $gt: new Date().toISOString(),
        },
      },
    });
    return locks.length > 0;
  },
});
