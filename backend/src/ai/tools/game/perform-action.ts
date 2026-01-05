import { z } from 'zod';
import { createDaicerTool, StrapiContext } from '../tool-factory';
import { ActionDispatcher, GameState, Command, WorldSettings, Player } from '@daicer/engine';
import { RoomWithPopulations } from '../../../lifecycle/socket/types';
import EntityAdapter from '../../../api/game/services/entity-adapter';

// Define Input Schema
const PerformActionSchema = z.object({
  commandType: z.enum(['ATTACK', 'SKILL_CHECK', 'CAST_SPELL', 'INTERACT', 'LONG_REST', 'MODIFY_TERRAIN', 'ROLL_SAVE']),
  payload: z
    .string()
    .describe(
      'JSON string payload matching the specific command schema in @daicer/engine. REQUIRED: "actorId" for the entity acting. Example: "{"actorId": "...", "targetId": "..."}"'
    ),
});

export const performActionTool = (context: StrapiContext) => {
  return createDaicerTool(
    {
      name: 'perform_action',
      description:
        'Dispatch a deterministic engine command. Types: ATTACK, SKILL_CHECK, CAST_SPELL, INTERACT, LONG_REST, MODIFY_TERRAIN. Payload must match engine schema. ALWAYS use "actorId" for the acting entity.',
      schema: PerformActionSchema,
      func: async (input, ctx) => {
        try {
          const { strapi, roomDocumentId } = ctx;

          // 1. Load Room State
          const roomRaw = await strapi.documents('api::room.room').findOne({
            documentId: roomDocumentId,
            populate: {
              entity_sheets: {
                populate: {
                  structuredActions: {
                    populate: '*',
                  },
                  stats: true,
                  inventory: true,
                  character: {
                    populate: {
                      race: true,
                      classes: {
                        populate: {
                          class: true,
                          subclass: true,
                        },
                      },
                    },
                  },
                  monster: {
                    populate: {
                      stats: true,
                      equipment: true,
                    },
                  },
                },
              },
              players: {
                populate: {
                  user: true,
                  character: {
                    populate: {
                      classes: {
                        populate: {
                          class: true,
                          subclass: true,
                        },
                      },
                      stats: true,
                      equipment: true,
                      race: true,
                    },
                  },
                },
              },
            },
          });

          if (!roomRaw) throw new Error(`Room ${roomDocumentId} not found`);

          const room = roomRaw as unknown as RoomWithPopulations;
          const adapter = EntityAdapter();
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
            entities: entities.map((e) => adapter.adapt(e)),
          };

          const dispatcher = new ActionDispatcher();

          // 3. Construct Command
          let parsedPayload: Record<string, unknown> = {};
          try {
            parsedPayload = typeof input.payload === 'string' ? JSON.parse(input.payload) : input.payload;

            // Normalization: Map common LLM hallucinations to 'actorId'
            const payloadAny = parsedPayload as Record<string, string | undefined>;
            if (payloadAny.attackerId && !payloadAny.actorId) parsedPayload.actorId = payloadAny.attackerId;
            if (payloadAny.casterId && !payloadAny.actorId) parsedPayload.actorId = payloadAny.casterId;
            if (payloadAny.performerId && !payloadAny.actorId) parsedPayload.actorId = payloadAny.performerId;

            // Normalization: Map skill/stat/ability -> attribute (for SKILL_CHECK)
            if (input.commandType === 'SKILL_CHECK' || input.commandType === 'ROLL_SAVE') {
              if (payloadAny.skill && !payloadAny.attribute) parsedPayload.attribute = payloadAny.skill;
              if (payloadAny.stat && !payloadAny.attribute) parsedPayload.attribute = payloadAny.stat;
              if (payloadAny.ability && !payloadAny.attribute) parsedPayload.attribute = payloadAny.ability;
            }
            // Normalization: Resolve actionName to actionId for ATTACK
            if (
              input.commandType === 'ATTACK' &&
              (parsedPayload as any).actionName &&
              !(parsedPayload as any).weaponId
            ) {
              const actorId = parsedPayload.actorId || (parsedPayload as any).attackerId;
              const actor = state.entities.find((e) => e.id === actorId);
              if (actor) {
                const targetName = (parsedPayload as any).actionName;
                // Case insensitive match
                const foundAction = actor.actions.find((a) => a.name.toLowerCase() === targetName.toLowerCase());
                if (foundAction && foundAction.id) {
                  strapi.log.info(`[Tool:PerformAction] Resolved actionName "${targetName}" to ID "${foundAction.id}"`);
                  parsedPayload.weaponId = foundAction.id;
                } else {
                  strapi.log.warn(
                    `[Tool:PerformAction] Could not resolve actionName "${targetName}" for actor ${actorId} (Action Found: ${!!foundAction}, ID: ${foundAction?.id})`
                  );
                }
              }
            }
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
            events: result.events,
            trace: result.events.find((e) => e.type === 'ATTACK_RESULT' || e.type === 'SKILL_CHECK_RESULT')?.payload,
          };
        } catch (error) {
          console.error('[PERFORM ACTION DIAGNOSTICS]', error); // Direct output for Test Trace
          ctx.strapi.log.error(`[Tool:PerformAction] Engine Exception:`, error);
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
