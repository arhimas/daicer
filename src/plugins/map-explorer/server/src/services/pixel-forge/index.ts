import type { Core } from '@strapi/strapi';
import { compositeLoadout, AssetStub } from '../../utils/compositor';
import { parseColor } from '../../utils/pixel-math';

import { createEmptyGrid, fillBox, markBox } from './grid-utils';
import {
  generateCreatureLayers,
  generatePart,
  composeLayers,
  synthesizeBlueprint,
} from './generators/creature';
import { generateItemGrid, synthesizeItemBlueprint } from './generators/item';
import { GenerationConfig, PixelLayer } from './types';

export const PixelForgeService = ({ strapi }: { strapi: Core.Strapi }) => {
  const getConfig = (key: string) => strapi.plugin('map-explorer').config('contentTypes')[key];

  return {
    /**
     * Generates a Pixel Art Grid for a given Entity.
     * Fetches deep relations: Race, Appearance, Equipment.
     * Scaling Logic Applied.
     * Smart Compositor Applied.
     */
    async generateEntity(entityId: string): Promise<string[][]> {
      const uid = getConfig('entity');
      const entity = await strapi.db.query(uid).findOne({
        where: { documentId: entityId },
        populate: ['race', 'appearance', 'equipment', 'inventory'],
      });

      if (!entity) {
        throw new Error(`Entity not found: ${entityId}`);
      }

      const config: GenerationConfig = {
        race: entity.race?.slug || 'human',
        gender: 'male',
        skinTone: entity.appearance?.skin || '#dcb097',
        size: entity.size || 'Medium',
      };

      // 1. Generate Base Body
      const layers = generateCreatureLayers(config);
      const baseGrid = composeLayers(layers);

      // 2. Synthesize Blueprint
      const baseBlueprint = synthesizeBlueprint(config);

      const baseAsset: AssetStub = {
        pixelData: baseGrid as string[][],
        blueprint: baseBlueprint,
        archetype: 'Humanoid',
      };

      // 3. Process Equipment
      const equipmentAssets: AssetStub[] = [];
      if (entity.equipment && entity.equipment.length > 0) {
        for (const item of entity.equipment) {
          // Reuse public generateItem logic but we need implementation here?
          // Or calling this.generateItem?
          // We can call the exposed method if we bind `this`, but safe to just rely on internal helpers.
          // Actually, generateItem just calls generateItemGrid after fetch.
          // We can duplicate the fetch logic or refactor.
          // Let's duplicate the fetch for now to keep it simple, or use strapi query directly.

          const itemUid = getConfig('item');
          const itemData = await strapi.db.query(itemUid).findOne({
            where: { documentId: item.documentId },
            populate: ['equipment_data'],
          });

          if (itemData) {
            const itemConfig: GenerationConfig = {
              itemType: itemData.type,
              subType: itemData.equipment_data?.properties?.[0]?.slug || 'generic',
              size: itemData.size || 'Medium',
            };
            const itemGrid = generateItemGrid(itemConfig);
            // Cast to string[][] because grid-utils returns (string|null)[][]
            const itemGridStr = itemGrid as string[][];

            const itemBlueprint = synthesizeItemBlueprint(itemGridStr, itemData.type);

            equipmentAssets.push({
              pixelData: itemGridStr,
              blueprint: itemBlueprint,
              archetype: itemData.type === 'weapon' ? 'Sword' : 'Accessory',
            });
          }
        }
      }

      // 4. Smart Composite
      if (equipmentAssets.length > 0) {
        const result = compositeLoadout(baseAsset, equipmentAssets);
        return result.grid;
      }

      return baseGrid as string[][];
    },

    /**
     * Generates a Pixel Art Grid for a given Item.
     */
    async generateItem(itemId: string): Promise<string[][]> {
      const uid = getConfig('item');
      const item = await strapi.db.query(uid).findOne({
        where: { documentId: itemId },
        populate: ['equipment_data'],
      });

      if (!item) {
        throw new Error(`Item not found: ${itemId}`);
      }

      const config: GenerationConfig = {
        itemType: item.type,
        subType: item.equipment_data?.properties?.[0]?.slug || 'generic',
        size: item.size || 'Medium',
      };

      return generateItemGrid(config) as string[][];
    },

    // Legacy/Exposed Methods
    generateCreature(config: GenerationConfig): PixelLayer[] {
      return generateCreatureLayers(config);
    },

    generateCreatureLayers,
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
