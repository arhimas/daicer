// Lifecycle Hook for Knowledge Source
// Delegates actual processing to the Service layer to allow re-triggering from CLI.

export default {
  async afterDelete(event: { result: { id: number } }) {
    const { result } = event;
    if (result && result.id) {
      strapi.log.info(`[KnowledgeSource] Deleting snippets for source ID: ${result.id}...`);
      await strapi.db.query('api::knowledge-snippet.knowledge-snippet').deleteMany({
        where: { source: result.id },
      });
    }
  },

  async beforeCreate(event: any) {
    sanitizeTags(event);
  },

  async beforeUpdate(event: any) {
    sanitizeTags(event);
  },

  async afterCreate(event: { result: { id: number; content?: string } }) {
    const { result } = event;
    if (result.content && result.id) {
      // Call the service to sync
      await strapi.service('api::knowledge-source.knowledge-source').sync(result.id);
    }
  },

  async afterUpdate(event: { result: { id: number; content?: string } }) {
    const { result } = event;
    if (result.content && result.id) {
      // Call the service to sync
      await strapi.service('api::knowledge-source.knowledge-source').sync(result.id);
    }
  },
};

function sanitizeTags(event: any) {
  if (!event.params || !event.params.data) return;

  let tags = event.params.data.tags;

  if (tags === undefined || tags === null) return;

  if (typeof tags === 'string') {
    tags = tags.trim();
    if (tags.length === 0) {
      event.params.data.tags = [];
      return;
    }

    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        event.params.data.tags = parsed;
        return;
      }
    } catch {
      event.params.data.tags = tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);
      return;
    }
  }

  if (Array.isArray(tags)) {
    event.params.data.tags = tags.map((t: any) => String(t));
  }
}
