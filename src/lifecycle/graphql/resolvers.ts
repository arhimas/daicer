import { getMutationResolvers } from './mutation-resolvers';
import { typeDefs as staticTypeDefs } from './type-defs';
import { generateToolGraphQL } from './tool-generator';
import { ActionHydrator, SerializedItem } from '../../api/game/src/engine/derivation/ActionHydrator';
import type { RuntimeAction, DerivationContext, EntityStats } from '../../api/game/src/engine/derivation/types';
import { EntitySheetSchema } from '../../shared/schemas/entity';

interface EquipmentData {
  damage_dice?: string;
  damage_type?: { name: string; slug?: string };
  properties?: Array<{ name: string; slug: string }>;
  range_normal?: number;
  range_long?: number;
  armor_class_base?: number;
  armor_class_dex_bonus?: boolean;
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  [key: string]: unknown;
}

interface InventoryEntry {
  item: {
    id: string | number;
    documentId: string;
    type: string;
    equipment_data?: EquipmentData;
    name?: string;
    image?: unknown;
    damage_dice?: string;
    damage_type?: unknown; // Legacy field on item?
    properties?: unknown[]; // Legacy field on item?
    [key: string]: unknown;
  };
  isEquipped: boolean;
  [key: string]: unknown;
}

interface SpellEntry {
  spell: {
    documentId: string;
    name: string;
    type?: string;
    description?: string;
    level?: number;
    school?: string;
    castingTime?: string;
    range?: string;
    components?: string[];
    duration?: string;
    [key: string]: unknown; 
  };
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

            const rawInventory = (actor.inventory as InventoryEntry[]) || [];
            const equipmentList = rawInventory
              .filter((entry) => entry.isEquipped && entry.item)
              .map((entry) => {
                const itemData = entry.item;
                const eqData: EquipmentData = itemData.equipment_data || {};
                
                return {
                    name: itemData.name || 'Unknown Item',
                    slug: itemData.documentId || String(itemData.id), // SerializedItem keys
                    type: itemData.type,
                    equipment_category: { slug: itemData.type },
                    damage_dice: eqData.damage_dice || itemData.damage_dice,
                    damage_type: { name: eqData.damage_type?.name || 'bludgeoning' },
                    properties: eqData.properties,
                    range_normal: eqData.range_normal,
                    range_long: eqData.range_long,
                } as unknown as SerializedItem;
              });

            const context: DerivationContext = {
              stats: (actor.stats || {}) as EntityStats, // Mapped type
              attributes: (actor.stats || {}) as EntityStats, // Aliased in new structure
              proficiencyBonus: 2, 
              level: 1, // Default
              equipment: equipmentList,
            };

            const allActions: RuntimeAction[] = [];

            context.equipment.forEach((item) => {
              allActions.push(...ActionHydrator.hydrateFromEquipment(item, context));
            });

            // Hydrate Spells
            if (actor.spellbook) {
              (actor.spellbook as SpellEntry[]).forEach((entry) => {
                if (entry.spell) {
                if (entry.spell) {
                   // Ensure compatibility with SerializedItem or ActionHydrator expectations
                  allActions.push(ActionHydrator.hydrateFromSpell(entry.spell as unknown as SerializedItem, context));
                }
                }
              });
            }

            // Map to GraphQL Schema
            return allActions.map((a: RuntimeAction) => ({
              id: a.id,
              name: a.name,
              type: a.cost?.actionType || 'action', 
              sourceType: a.sourceType,
              sourceId: a.sourceId,
              description: a.description,
              img: a.img,
              cost: a.cost,
              range: a.range ? (a.range.type === 'ranged' ? `${a.range.value} ft` : a.range.type) : undefined,
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

            const [entities, items] = await Promise.all([
              !showAllItems
                ? strapi.documents('api::entity.entity').findMany({
                    filters: {
                      $or: [
                        // If specific flags are set, respect them, otherwise strict search
                        showAllMonsters ? { type: 'monster' } : null,
                        showAllCharacters ? { type: 'player' } : null,
                        // General search
                        (!showAllMonsters && !showAllCharacters) ? { name: { $contains: query } } : null
                      ].filter(Boolean) as Record<string, unknown>[], // filtered nulls
                    },
                    fields: ['name', 'documentId', 'type'],
                    limit: 50,
                    locale: 'en',
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
              `[Resolver] Found ${(entities || []).length} entities, ${(items || []).length} items`
            );

            return [
              ...(entities || []).map((e: { documentId: string; name: string; type: string }) => ({
                id: e.documentId,
                name: e.name,
                type: e.type?.toLowerCase() || 'entity', // 'monster', 'player'
              })),
              ...(items || []).map((i: { documentId: string; name: string; type: string }) => ({
                id: i.documentId,
                name: i.name,
                type: 'item',
                subtype: i.type,
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
          } else {
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
          const results = await Promise.all(
            chunks.map(async (c: { x: number; y: number }) => {
              return service.getChunk(c.x, c.y, config);
            })
          );

          return results;
        },
        gameView: async (_parent, args, context) => {
          const { roomId } = args;
          const { user } = context.state;
          if (!user) throw new Error('Unauthorized');

          // Fetch Room with populations
          // We need deep populate for entities and players
          const room = await strapi.documents('api::room.room').findOne({
            documentId: roomId,
            populate: {
              world: true,
              dmSettings: true,
              players: {
                populate: {
                  character: true,
                  user: true,
                },
              },
              entity_sheets: {
                populate: {
                  position: true,
                  stats: true,
                  inventory: { populate: '*' }, // Ensure inventory is ready for entity view
                  appearance: true,
                },
              },
            },
          });

          if (!room) throw new Error('Room not found');

          // Determine Myself
          const myselfPlayer = (room.players || []).find((p) => p.user?.documentId === user.documentId);
          let myself = null;
          if (myselfPlayer?.character?.documentId) {
            const rawMyself = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
              documentId: myselfPlayer.character.documentId,
              populate: {
                inventory: { populate: '*' },
                stats: true,
                spellbook: { populate: '*' },
              },
            });

            // Phase 3.2: Resolver Validation
            if (rawMyself) {
              const parseResult = EntitySheetSchema.safeParse(rawMyself);
              if (!parseResult.success) {
                strapi.log.warn(
                  `[GameView] EntitySheet ${rawMyself.documentId} failed Zod validation`,
                  parseResult.error.format()
                );
              }
              myself = rawMyself;
            }
          }

          // Active Turn
          const turns = await strapi.documents('api::turn.turn').findMany({
            filters: { room: { documentId: roomId } },
            sort: 'turnNumber:desc',
            limit: 1,
            populate: ['messages'], // Maybe populate relevant turn data
          });
          const activeTurn = turns.length > 0 ? turns[0] : null;

          // Visible Entities
          let visibleEntities = room.entity_sheets || [];

          if (myself && myself.position) {
            try {
              const visibilityService = strapi.service('api::game.visibility-service');
              if (visibilityService) {
                visibleEntities = visibilityService.cullEntities(myself.position, visibleEntities);
              }
            } catch (e) {
              strapi.log.warn('[Resolver] Failed to load visibility service, defaulting to full view', e);
            }
          }

          const messages = await strapi.documents('api::message.message').findMany({
            filters: { room: { documentId: roomId } },
            sort: 'timestamp:desc', // or asc
            limit: 50,
            populate: ['recipient', 'sender'],
          });

          return {
            room,
            activeTurn,
            myself,
            visibleEntities,
            messages: messages.reverse(), // Return in chrono order if desired, or keep desc
          };
        },
        getTimeFrame: async (_parent, args, _context) => {
          // Placeholder for Phase 4.2
          const { id } = args;
          // Assuming TimeFrame is just a Turn snapshot or specific model
          // Returning JSON for now as defined in query
          const turn = await strapi.documents('api::turn.turn').findOne({ documentId: id, populate: '*' });
          return turn;
        },
        getAgentLogs: async (_parent, args, _context) => {
          const { roomId } = args;
          strapi.log.info(`[Resolver] getAgentLogs hit for Room ${roomId}`);

          try {
            // Fetch recent events. We can filter by type if needed (e.g., 'agent:*')
            // but for now we return general activity.
            const events = await strapi.documents('api::game-event.game-event').findMany({
              filters: { room: { documentId: roomId } },
              sort: 'sequenceId:desc',
              limit: 50,
            });

            return events.map((e) => ({
              id: e.documentId,
              type: e.type,
              payload: e.payload,
              actorId: e.actorId,
              sequenceId: e.sequenceId,
              timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
            }));
          } catch (e) {
            strapi.log.error(`[Resolver] Error fetching agent logs:`, e);
            return [];
          }
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
