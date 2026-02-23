import type { Core } from '@strapi/strapi';
import { compositeLoadout, AssetStub } from '@/plugins/map-explorer/server/src/utils/compositor';
import { parseColor } from '@/plugins/map-explorer/server/src/utils/pixel-math';

import { createEmptyGrid, fillBox, markBox } from './grid-utils';
import {
  generateEntityLayers,
  generatePart,
  composeLayers,
  synthesizeEntityBlueprint,
} from './generators/entity';
import { generateItemGrid, synthesizeItemBlueprint } from './generators/item';
import { generateTerrainGrid } from './generators/terrain';

import {
  serializeEntity,
  serializeItem,
  serializeTerrain,
  EntityContext,
  ItemContext,
  TerrainContext,
} from './serializers';

export const PixelForgeService = ({ strapi }: { strapi: Core.Strapi }) => {
  const getConfig = (key: string) => strapi.plugin('map-explorer').config('contentTypes')[key];

  return {
    /**
     * UNIVERSAL GENERATOR
     * The single entry point for all pixel generation.
     * strictly typed via Serializers.
     */
    async generate(uid: string, documentId: string): Promise<string[][]> {
      // 1. ROUTING & SERIALIZATION
      // We detect the type of content and hydrate the specific Context

      // ENTITY
      if (uid === getConfig('entity') || uid === 'api::entity.entity') {
        const data = await strapi.db.query(uid).findOne({
          where: { documentId },
          populate: ['race', 'appearance', 'equipment', 'inventory'],
        });
        if (!data) throw new Error(`Entity not found: ${documentId}`);

        const ctx: EntityContext = serializeEntity(data);
        const layers = generateEntityLayers(ctx);
        let baseGrid = composeLayers(layers);

        // Composite Equipment (Recursively)
        // Note: EntityContext already contains serialized equipment (ItemContext[])
        // We reuse the Item Generator for these
        const equipmentAssets: AssetStub[] = [];
        for (const itemCtx of ctx.equipment) {
          const itemGrid = generateItemGrid(itemCtx);
          // Items need their own blueprint logic? Or just visual?
          // For compositeLoadout, we need AssetStub
          const itemBlueprint = synthesizeItemBlueprint(itemGrid as string[][], itemCtx);
          equipmentAssets.push({
            pixelData: itemGrid as string[][],
            blueprint: itemBlueprint,
            archetype: itemCtx.type === 'weapon' ? 'Sword' : 'Accessory',
          });
        }

        if (equipmentAssets.length > 0) {
          const result = compositeLoadout(
            {
              pixelData: baseGrid as string[][],
              blueprint: synthesizeEntityBlueprint(ctx),
              archetype: ctx.archetype,
            },
            equipmentAssets
          );
          baseGrid = result.grid;
        }

        return baseGrid as string[][];
      }

      // ITEM
      if (uid === getConfig('item') || uid === 'api::item.item') {
        const data = await strapi.db.query(uid).findOne({
          where: { documentId },
          populate: ['equipment_data'],
        });
        if (!data) throw new Error(`Item not found: ${documentId}`);

        const ctx: ItemContext = serializeItem(data);
        return generateItemGrid(ctx) as string[][];
      }

      // TERRAIN
      if (uid === getConfig('terrain') || uid === 'api::terrain.terrain') {
        const data = await strapi.db.query(uid).findOne({
          where: { documentId },
          populate: ['noise_config'],
        });
        if (!data) throw new Error(`Terrain not found: ${documentId}`);

        const ctx: TerrainContext = serializeTerrain(data);
        return generateTerrainGrid(ctx) as string[][];
      }

      throw new Error(`PixelForge: Unsupported UID ${uid}`);
    },

    // Legacy/Exposed Methods (Refactored to Safe Stubs)

    // Kept for internal utility usage if needed, but 'generate' is preferred.
    generateEntityLayers,
    generatePart,
    compose: composeLayers,
    createEmptyGrid,
    fillBox,
    markBox,

    generateItemGrid,

    parseColor,

    hexToRgba(hex: string, alpha: number) {
      const c = parseColor(hex);
      c.a = Math.floor(alpha * 255);
      return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
    },
  };
};

export default PixelForgeService;
