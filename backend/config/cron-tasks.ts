export default {
  deadlockWatchdog: {
    task: async ({ strapi }) => {
      try {
        const now = new Date();
        const expiredLocks = await strapi.documents('api::turn-lock.turn-lock').findMany({
          filters: {
            expires_at: {
              $lt: now.toISOString(),
            },
          },
        });

        if (expiredLocks.length > 0) {
          strapi.log.warn(`[DeadlockWatchdog] Found ${expiredLocks.length} expired locks. Releasing...`);

          for (const lock of expiredLocks) {
            await strapi.documents('api::turn-lock.turn-lock').delete({
              documentId: lock.documentId,
            });
            strapi.log.info(`[DeadlockWatchdog] Force released lock for Room ${lock.room?.documentId || 'unknown'}`);
          }
        }
      } catch (error) {
        strapi.log.error('[DeadlockWatchdog] Error executing deadlock check:', error);
      }
    },
    options: {
      rule: '*/1 * * * *',
    },
  },
};
