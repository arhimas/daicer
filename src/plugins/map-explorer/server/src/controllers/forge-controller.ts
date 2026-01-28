import { Context } from 'koa';

export default ({ strapi }) => ({
  async dispatch(ctx: Context) {
    const { prompt, type, archetype, blueprint, model, inputPixels, size, width, height, action, entityData, entityContext } = ctx.request.body;

    // Deep Context Injection (Backend Side)
    let enrichedEntityData = entityData || {};
    if (entityContext?.uid && entityContext?.documentId) {
        try {
            // Strapi 5 Documents API
            const deepData = await strapi.documents(entityContext.uid).findOne({
                documentId: entityContext.documentId,
                populate: '*' // Fetch level-1 relations/components
            });
            if (deepData) {
                enrichedEntityData = { ...enrichedEntityData, ...deepData };
                strapi.log.info(`Pixel Forge: Deep Fetched ${entityContext.uid} (${entityContext.documentId}). Keys: ${Object.keys(deepData).join(',')}`);
            }
        } catch (e) {
            strapi.log.warn("Pixel Forge: Failed to deep fetch context", e);
        }
    }

    try {
        const job = await strapi.plugin('map-explorer').service('queueService').addJob({
            prompt, type, archetype, blueprint, model, inputPixels, size, width, height, action, 
            entityData: enrichedEntityData
        });
        
        ctx.body = { jobId: job.id, status: 'queued' };
    } catch (err) {
        ctx.throw(500, err);
    }
  },

  async status(ctx: Context) {
      const { jobId } = ctx.params;
      try {
          const job = await strapi.plugin('map-explorer').service('queueService').getJob(jobId);
          if (!job) return ctx.notFound('Job not found');

          const state = await job.getState();
          const result = job.returnvalue; // BullMQ return value

          ctx.body = { 
              id: job.id, 
              state, 
              result: state === 'completed' ? result : null,
              progress: job.progress
          };
      } catch (err) {
          ctx.throw(500, err);
      }
  },

  async list(ctx: Context) {
      try {
          const summary = await strapi.plugin('map-explorer').service('queueService').getQueueSummary();
          ctx.body = summary;
      } catch (err) {
          ctx.throw(500, err);
      }
  }
});
