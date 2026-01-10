import { getMutationResolvers } from './mutation-resolvers';
import { typeDefs as staticTypeDefs } from './type-defs';
import { generateToolGraphQL } from './tool-generator';
import type { RuntimeAction } from '../../api/game/src/engine/derivation/types';

interface InventoryEntry {
  item: {
    id: string | number;
    documentId: string;
    type: string;
    equipment_data?: any;
    name?: string;
    image?: any;
    damage_dice?: string;
    damage_type?: any;
    properties?: any[];
    [key: string]: any;
  };
  isEquipped: boolean;
  [key: string]: unknown;
}

interface SpellEntry {
  spell: any;
  [key: string]: unknown;
}

export const registerGraphQLExtension = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  // Generate dynamic tools
  const { typeDefs: toolTypeDefs, resolvers: toolResolvers } = generateToolGraphQL(strapi);

  const finalTypeDefs = staticTypeDefs + toolTypeDefs;

  extensionService.use({
    typeDefs: finalTypeDefs,
    resolvers: {
      Room: {
        messages: async (parent, _args, context) => {
          strapi.log.info(`[Resolver] Room.messages hit for ${parent.documentId}`);
          const { documentId } = parent;
          const user = context.state.user;

          const orFilters: Array<Record<string, unknown>> = [{ recipient: { $null: true } }];

          if (user) {
            orFilters.push({ recipient: { documentId: user.documentId } });
          }

          const filters: Record<string, unknown> = {
            room: { documentId: documentId },
            $or: orFilters,
          };

          return strapi.documents('api::message.message').findMany({
            filters,
            sort: 'timestamp:asc',
            limit: 100,
            populate: ['turn', 'recipient'],
          });
        },
        turns: async (parent, _args) => {
          strapi.log.info(`[Resolver] Room.turns hit for ${parent.documentId}`);
          return strapi.documents('api::turn.turn').findMany({
            filters: { room: { documentId: parent.documentId } },
            sort: 'turnNumber:desc',
            limit: 5,
            populate: ['messages'],
          });
        },
      },
      EntitySheet: {
        availableActions: async (parent, _args) => {
          try {
            // 1. Ensure Inventory is populated (parent might be shallow)
            const actor = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
              documentId: parent.documentId,
              populate: [
                'inventory',
                'inventory.item',
                'inventory.item.equipment_data',
                'inventory.item.equipment_data.damage_type',
                'inventory.item.equipment_data.properties',
                'spellbook',
                'spellbook.spell',
                'stats',
              ],
            });

            if (!actor) return [];

            const context = {
              attributes: actor.stats || {},
              proficiencyBonus: 2,
              equipment: ((actor.inventory as InventoryEntry[]) || [])
                .filter((entry) => entry.isEquipped && entry.item)
                .map((entry) => ({
                  ...entry.item,
                  ...(entry.item.equipment_data || {}),
                  equipment_category: { slug: entry.item.type },
                })),
            } as any;

            const { ActionHydrator } = await import('../../api/game/src/engine/derivation/ActionHydrator');
            const allActions: RuntimeAction[] = [];

            context.equipment.forEach((item: any) => {
              allActions.push(...ActionHydrator.hydrateFromEquipment(item, context));
            });

            // Hydrate Spells
            if (actor.spellbook) {
              (actor.spellbook as SpellEntry[]).forEach((entry) => {
                if (entry.spell) {
                  allActions.push(ActionHydrator.hydrateFromSpell(entry.spell, context));
                }
              });
            }

            // Map to GraphQL Schema
            return allActions.map((a: RuntimeAction) => ({
              id: a.id,
              name: a.name,
              type: a.type || 'action', // Ensure type is present
              sourceType: a.sourceType,
              sourceId: a.sourceId,
              description: a.description,
              img: a.img,
              cost: a.cost,
              range: a.range,
              attackBonus: a.attack?.bonus,
              damage: a.effects?.find((e) => e.type === 'damage' || e.type === 'healing')?.dice,
            }));
          } catch (e) {
            strapi.log.error(`[Resolver] Error deriving actions for ${parent.documentId}`, e);
            return [];
          }
        },
      },
      Query: {
        ...toolResolvers.Query, // Dynamically generated tool queries
        searchEntities: async (_parent, args, _context) => {
          const { query } = args;
          strapi.log.info(`[Resolver] searchEntities: "${query}"`);

          if (!query || query.length < 2) return [];

          try {
            // Special Keywords: "characters" or "monsters" list all (limit 50)
            const lowerQuery = query.toLowerCase();
            const showAllItems = lowerQuery === 'items' || lowerQuery === 'item';
            const showAllCharacters = lowerQuery === 'characters' || lowerQuery === 'character';
            const showAllMonsters = lowerQuery === 'monsters' || lowerQuery === 'monster';

            const [monsters, characters, items] = await Promise.all([
              !showAllCharacters && !showAllItems
                ? strapi.documents('api::entity.entity').findMany({
                    filters: {
                      type: 'monster',
                      ...(showAllMonsters ? {} : { name: { $contains: query } }),
                    },
                    fields: ['name', 'documentId', 'type'],
                    limit: 50,
                    locale: 'en',
                  })
                : [],
              !showAllMonsters && !showAllItems
                ? strapi.documents('api::character.character').findMany({
                    filters: showAllCharacters ? {} : { name: { $contains: query } },
                    fields: ['name', 'documentId'],
                    limit: 50,
                  })
                : [],
              !showAllMonsters && !showAllCharacters
                ? strapi.documents('api::item.item').findMany({
                    filters: showAllItems ? {} : { name: { $contains: query } },
                    fields: ['name', 'documentId', 'type'],
                    limit: 50,
                  })
                : [],
            ]);

            strapi.log.info(
              `[Resolver] Found ${(monsters || []).length} monsters, ${(characters || []).length} characters, ${
                (items || []).length
              } items`
            );

            return [
              ...(monsters || []).map((m: { documentId: string; name: string }) => ({
                id: m.documentId,
                name: m.name,
                type: 'monster',
              })),
              ...(characters || []).map((c: { documentId: string; name: string }) => ({
                id: c.documentId,
                name: c.name,
                type: 'character',
              })),
              ...(items || []).map((i: { documentId: string; name: string; type: string }) => ({
                id: i.documentId,
                name: i.name,
                type: 'item',
                subtype: i.type, // Pass item type (weapon, armor) as subtype if needed
              })),
            ];
          } catch (error) {
            strapi.log.error('[Resolver] searchEntities error:', error);
            return [];
          }
        },
        abilities: () => [
          {
            id: 'str',
            documentId: 'str',
            name: 'STR',
            fullName: 'Strength',
            description: 'Physical power',
            skills: [],
          },
          { id: 'dex', documentId: 'dex', name: 'DEX', fullName: 'Dexterity', description: 'Agility', skills: [] },
          { id: 'con', documentId: 'con', name: 'CON', fullName: 'Constitution', description: 'Endurance', skills: [] },
          { id: 'int', documentId: 'int', name: 'INT', fullName: 'Intelligence', description: 'Reasoning', skills: [] },
          { id: 'wis', documentId: 'wis', name: 'WIS', fullName: 'Wisdom', description: 'Perception', skills: [] },
          { id: 'cha', documentId: 'cha', name: 'CHA', fullName: 'Charisma', description: 'Personality', skills: [] },
        ],
        skills: () => [
          {
            id: 'ath',
            documentId: 'ath',
            name: 'Athletics',
            description: 'Physical feats',
            abilityScore: { name: 'STR' },
          },
          { id: 'acr', documentId: 'acr', name: 'Acrobatics', description: 'Tumbling', abilityScore: { name: 'DEX' } },
        ],
        alignments: () => [
          { id: 'lg', documentId: 'lg', name: 'Lawful Good', abbreviation: 'LG', description: 'Crusader' },
          { id: 'ng', documentId: 'ng', name: 'Neutral Good', abbreviation: 'NG', description: 'Benefactor' },
          { id: 'cg', documentId: 'cg', name: 'Chaotic Good', abbreviation: 'CG', description: 'Rebel' },
          { id: 'ln', documentId: 'ln', name: 'Lawful Neutral', abbreviation: 'LN', description: 'Judge' },
          { id: 'n', documentId: 'n', name: 'True Neutral', abbreviation: 'N', description: 'Undecided' },
          { id: 'cn', documentId: 'cn', name: 'Chaotic Neutral', abbreviation: 'CN', description: 'Free Spirit' },
          { id: 'le', documentId: 'le', name: 'Lawful Evil', abbreviation: 'LE', description: 'Dominator' },
          { id: 'ne', documentId: 'ne', name: 'Neutral Evil', abbreviation: 'NE', description: 'Malefactor' },
          { id: 'ce', documentId: 'ce', name: 'Chaotic Evil', abbreviation: 'CE', description: 'Destroyer' },
        ],
        backgrounds: () => [
          { id: 'acolyte', documentId: 'acolyte', name: 'Acolyte', description: 'Religious devotee' },
          { id: 'soldier', documentId: 'soldier', name: 'Soldier', description: 'Military veteran' },
        ],
        conditions: () => [
          { id: 'charmed', documentId: 'charmed', name: 'Charmed', description: 'Friendly to charmer' },
        ],
        getWorldTime: async (_parent, args, _context) => {
          const { roomId } = args;
          // Fetch latest turn
          const turns = await strapi.documents('api::turn.turn').findMany({
            filters: { room: { documentId: roomId } },
            sort: 'turnNumber:desc',
            limit: 1,
            fields: ['turnNumber'],
          });

          const currentTurn = turns.length > 0 ? turns[0].turnNumber : 0;

          // Time Scale: 1 Turn = 10 Minutes
          const MINUTES_PER_TURN = 10;
          const MINUTES_PER_DAY = 24 * 60; // 1440

          const totalMinutes = currentTurn * MINUTES_PER_TURN;
          const day = Math.floor(totalMinutes / MINUTES_PER_DAY) + 1; // Start Day 1
          const minuteOfDay = totalMinutes % MINUTES_PER_DAY;

          // Format Time HH:MM
          const hour = Math.floor(minuteOfDay / 60);
          const minute = minuteOfDay % 60;
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          const formatted = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;

          // Light Level / IsDay
          // Dawn: 6AM (360), Dusk: 6PM (1080)
          // Simple Step:
          const isDay = minuteOfDay >= 360 && minuteOfDay < 1080;

          // Light Level (0 to 1) - Sine wave approximation or simple transitions
          // Noon (720) = 1.0
          // Midnight (0) = 0.2 (Moonlight)
          let lightLevel = 0.2;
          if (isDay) {
            // Day Curve
            // Peak at 720 (Noon)
            // Distance from Noon:
            const dist = Math.abs(minuteOfDay - 720);
            // Max dist is 360 (at 6am/6pm).
            // Normalized: 1 - (dist / 360)
            lightLevel = 0.2 + 0.8 * Math.cos((dist / 360) * (Math.PI / 2));
            // Cosine might be better:
            // Map 360..1080 to -PI/2 .. PI/2
            // 6AM -> 0, Noon -> 1, 6PM -> 0
          } else {
            // Night is constant 0.2 or slightly simpler
            lightLevel = 0.2;
          }

          const timeOfDay = isDay ? 'Day' : 'Night';

          return {
            ticks: currentTurn,
            day,
            year: 1, // Static year for now
            timeOfDay,
            formatted,
            isDay,
            lightLevel,
          };
        },
        voxelPreview: async (_parent, args, _context) => {
          const { chunks, config } = args;
          if (!config) throw new Error('Missing config');

          // Use the existing service to generate chunks
          const service = strapi.service('api::voxel-engine.voxel-engine');

          // Execute all chunk generations in parallel
          // Note: Since this is CPU bound (procedural generation),
          // Promise.all doesn't make it faster on single thread JS,
          // but it allows formatting the response efficiently.
          const results = await Promise.all(
            chunks.map(async (c: { x: number; y: number }) => {
              return service.getChunk(c.x, c.y, config);
            })
          );

          return results;
        },
      },
      Mutation: {
        ...getMutationResolvers(strapi),
        ...toolResolvers.Mutation,
      },
    },
    resolversConfig: {
      'Room.messages': { auth: false },
      'Room.turns': { auth: false },
      'Query.voxelPreview': {
        auth: {
          scope: ['api::voxel-engine.voxel-engine.voxelPreview'],
        },
      },
      'Query.searchEntities': { auth: false },
      'Query.getAgentTools': { auth: false },
    },
  });
};
