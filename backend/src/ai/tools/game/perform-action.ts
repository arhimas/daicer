import { z } from 'zod';
import { createDaicerTool, StrapiContext } from '../tool-factory';
import {
  ActionDispatcher,
  GameState,
  Entity,
  Command,
  EntityStats,
  EntitySheet,
  WorldSettings,
  Player,
  Role,
} from '@daicer/engine';
import { RoomWithPopulations } from '../../../lifecycle/socket/types';

// Define Input Schema
const PerformActionSchema = z.object({
  commandType: z.enum(['ATTACK', 'SKILL_CHECK', 'CAST_SPELL', 'INTERACT', 'LONG_REST', 'MODIFY_TERRAIN']),
  payload: z
    .string()
    .describe(
      'JSON string payload matching the specific command schema in @daicer/engine. Example: "{"targetId": "..."}"'
    ),
});

export const performActionTool = (context: StrapiContext) => {
  return createDaicerTool(
    {
      name: 'perform_action',
      description:
        'Dispatch a deterministic engine command. Types: ATTACK, SKILL_CHECK, CAST_SPELL, INTERACT, LONG_REST, MODIFY_TERRAIN. Payload must match engine schema.',
      schema: PerformActionSchema,
      func: async (input, ctx) => {
        try {
          const { strapi, roomDocumentId } = ctx;

          // 1. Load Room State
          const roomRaw = await strapi.documents('api::room.room').findOne({
            documentId: roomDocumentId,
            populate: ['entity_sheets', 'players', 'players.user', 'players.character'],
          });

          if (!roomRaw) throw new Error(`Room ${roomDocumentId} not found`);

          const room = roomRaw as unknown as RoomWithPopulations;
          const entities = room.entity_sheets || [];

          // 2. Initialize Dispatcher with Room State
          const state: GameState = {
            room: { ...room, players: undefined, messages: undefined } as unknown as Partial<
              import('@daicer/engine').Room
            >,
            world: {}, // Voxel world unavailable in tool context, passed as generic object matching 'unknown'
            settings: (room.config as WorldSettings) || {
              seed: 'default',
              theme: 'medieval',
              worldType: 'terra',
              worldSize: 'medium',
              setting: 'fantasy',
              tone: 'neutral',
              worldBackground: '',
              dmStyle: { verbosity: 3, detail: 3, engagement: 3, narrative: 3, customDirectives: '' },
              dmSystemPrompt: '',
              playerCount: 4,
              adventureLength: 'medium',
              difficulty: 'medium',
              startingLevel: 1,
              attributePointBudget: 27,
              language: 'en',
            },
            players: (room.players || []).map(
              (p): Player => ({
                id: String(p.documentId),
                name: p.user?.username || 'Unknown',
                role: 'player', // Default to player
                userId: String(p.user?.documentId || p.user?.id || 'unknown'),
                action: null,
                isReady: true,
                joinedAt: Date.now(),
                character: null,
              })
            ),
            entities: entities.map(
              (e): Entity => ({
                id: e.documentId,
                position: e.position,
                stats: e.stats as EntityStats, // Validated on write
                type: (['player', 'npc', 'monster', 'object'].includes(e.type) ? e.type : 'monster') as Entity['type'],
                name: e.name,
                hp: e.currentHp,
                maxHp: e.maxHp,
                ac: e.ac || 10,
                speed: e.speed || 30,
                actions: [],
                features: [],
                color: '#fff',
                visionRadius: 10,
                sheet: e as unknown as EntitySheet, // e is a Strapi EntitySheet, which mirrors Engine EntitySheet. Cast is safe(ish).
              })
            ),
          };

          const dispatcher = new ActionDispatcher();

          // 3. Construct Command
          let parsedPayload = {};
          try {
            parsedPayload = typeof input.payload === 'string' ? JSON.parse(input.payload) : input.payload;
          } catch (e) {
            throw new Error(`Invalid JSON payload: ${e instanceof Error ? e.message : String(e)}`);
          }

          // Debug available entities
          strapi.log.info(
            `[Tool:PerformAction] Room Entities: ${state.entities.map((e) => `${e.id} (${e.type})`).join(', ')}`
          );
          strapi.log.info(`[Tool:PerformAction] Target ActorId: ${(parsedPayload as { actorId?: string }).actorId}`);

          const command = {
            type: input.commandType,
            payload: parsedPayload,
            timestamp: Date.now(),
          } as Command; // Explicit cast to Command Union

          // 4. Dispatch
          strapi.log.info(`[Tool:PerformAction] Dispatching ${input.commandType}`, parsedPayload);

          const result = dispatcher.dispatch(state, command);

          // 5. Broadcast Events
          if (result.events.length > 0) {
            const { streamManager } = await import('../../../utils/llm/stream-manager');
            streamManager.broadcast(roomDocumentId, 'game:events', { events: result.events });
          }

          if (!result.success) {
            strapi.log.warn(`[Tool:PerformAction] Engine Rejected: ${result.message}`);
          }

          return {
            success: result.success,
            message: result.message,
            trace: result.events.find((e) => e.type === 'ATTACK_RESULT' || e.type === 'SKILL_CHECK_RESULT')?.payload,
          };
        } catch (error) {
          strapi.log.error(`[Tool:PerformAction] Engine Exception:`, error);
          return {
            success: false,
            message: `Engine Crash: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
      },
    },
    context
  );
};
