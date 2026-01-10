import { factories } from '@strapi/strapi';
import { EntitySchema, EngineEntity } from '../schemas/gateway-schemas';

export default factories.createCoreService('api::game.entity-gateway', ({ strapi }) => ({
  /**
   * Fetches an Entity by ID and guarantees it matches the strict Engine Schema.
   * Throws ZodError if data is malformed.
   */
  async fetchEntity(documentId: string): Promise<EngineEntity> {
    // 1. Fetch raw Sheet (Deep Populate is handled by Adapter logic needs usually,
    // but here we might need to know what populate to send?
    // The ActiveStateService used a specific populate.
    // The EntityAdapter expects a fully populated sheet usually.
    // Let's use a standard 'engine-populate' if we can, or replicate the deep populate.
    // ACTIVE STATE OPTIMIZATION:
    // If we have ActiveState, we don't need deep populate!
    // But we need to fetch ActiveState relation.

    const sheet = await strapi.entityService.findOne('api::entity-sheet.entity-sheet', documentId, {
      populate: {
        activeState: {
          populate: ['computedActions', 'attributes'], // Populate active state deep enough
        },
        // Fallback populates if ActiveState missing (legacy)
        stats: true,
        inventory: { populate: ['item'] },
        spellbook: { populate: { spells: true } },
        actions: true,
        features: true,
        classes: true, // check schema?
        race: true,
      },
    });

    if (!sheet) {
      throw new Error(`EntitySheet ${documentId} not found`);
    }

    // 2. Adapt (Potential 'as any' usage inside adapter is currently unchecked)
    // We opt-in to ActiveState Usage (default behavior of adapter now)
    const rawEntity = strapi.service('api::game.entity-adapter').adapt(sheet);

    // 3. VALIDATE (The Gateway)
    // This strips unknown fields and ensures types.
    // If adapter returns nulls for required fields, this throws.
    const validEntity = EntitySchema.parse(rawEntity);

    return validEntity;
  },
}));
