import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Recursively builds a populate object for a given model UID up to a specified depth.
   * Handles circular dependencies by tracking visited models in the current branch.
   */
  getDeepPopulate(uid: string, depth: number = 3, visited: Set<string> = new Set()) {
    if (depth <= 0) return '*'; // Base case: just populate, don't recurse
    if (visited.has(uid)) return '*'; // Cycle detected: stop recursion

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = strapi.getModel(uid as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attributes = model.attributes as Record<string, any>;
    const populate: Record<string, unknown> = {};

    // Track visited for this branch
    const newVisited = new Set(visited);
    newVisited.add(uid);

    for (const [key, attr] of Object.entries(attributes)) {
      if (attr.type === 'relation') {
        const target = attr.target;
        if (target) {
            populate[key] = {
                populate: this.getDeepPopulate(target, depth - 1, newVisited)
            };
        }
      } else if (attr.type === 'component') {
          const component = attr.component;
          populate[key] = {
              populate: this.getDeepPopulate(component, depth - 1, newVisited)
          };
      } else if (attr.type === 'dynamiczone') {
          populate[key] = {
              populate: '*' // Dynamic zones are tricky, usually wildcard is best, or we inspect components
          };
      } else if (attr.type === 'media') {
          populate[key] = true;
      }
    }

    // If no relations/components found, return wildcard as fallback or empty
    if (Object.keys(populate).length === 0) return '*';

    return populate;
  },

  /**
   * Fetches an entity by Document ID with deep population and sanitization.
   */
  async fetchDeepContext(uid: string, documentId: string, depth: number = 3) {
    try {
        const populate = this.getDeepPopulate(uid, depth);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = await strapi.documents(uid as any).findOne({
            documentId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            populate: populate as any
        });

        if (!entity) return null;

        return this.sanitizeDeep(entity);
    } catch (error) {
        strapi.log.error(`ContextService: Deep fetch failed for ${uid}:${documentId}`, error);
        throw error;
    }
  },

  /**
   * recursively removes system fields and password fields
   */
  sanitizeDeep(data: unknown): unknown {
      if (Array.isArray(data)) {
          return data.map(item => this.sanitizeDeep(item));
      }
      
      if (data && typeof data === 'object') {
          const cleaned: Record<string, unknown> = {};
          const systemFields = ['password', 'resetPasswordToken', 'confirmationToken', 'createdBy', 'updatedBy', 'publishedAt', 'createdAt', 'updatedAt', 'localizations', 'locale'];
          
          for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
              if (systemFields.includes(key)) continue;
              
              // Remove nulls if desired, or keep them. keeping for now.
              cleaned[key] = this.sanitizeDeep(value);
          }
          return cleaned;
      }

      return data;
  }
});
