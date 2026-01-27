import { Context } from 'koa';

export default ({ strapi }) => ({
  async dispatch(ctx: Context) {
    const { prompt, type, archetype, blueprint, model, inputPixels, size, width, height, action } = ctx.request.body;

    try {
        const job = await strapi.plugin('map-explorer').service('queueService').addJob({
            prompt, type, archetype, blueprint, model, inputPixels, size, width, height, action
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
