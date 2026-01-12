/**
 * narrator service
 */

import { getGeminiModel } from '../../../utils/llm/gemini';
import { GeminiModel } from '../../../utils/llm/types';
import { HumanMessage } from '@langchain/core/messages';
import { getRegistryTools } from './tool-registry';
import { NarratorResponse } from './schemas';
import { createAgent, todoListMiddleware, llmToolSelectorMiddleware } from 'langchain';
import type { Core } from '@strapi/strapi';
type StrapiInterface = Core.Strapi;

const safeParseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
};

interface NarratorInput {
  roomId: string; // DocumentID or unique ID
  input: string;
  mode?: 'debug' | 'game';
  userId?: string; // DocumentID
  direct?: boolean;
}

interface CharacterSheet {
  documentId: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  stats: Record<string, unknown>;
  currentHp: number;
  maxHp: number;
}

export default ({ strapi }: { strapi: StrapiInterface }) => ({
  async processAction({ roomId, input, mode, userId, direct }: NarratorInput) {
    strapi.log.info(`[Narrator] Processing action in room ${roomId} (mode: ${mode})`);

    // ---------------------------------------------------------
    // 0. Resolve User & Room (Fail Fast)
    // ---------------------------------------------------------
    let senderName = 'Player';
    if (userId) {
      const user = await strapi.documents('plugin::users-permissions.user').findOne({ documentId: userId });
      if (user?.username) senderName = user.username;
    }

    const rooms = await strapi.documents('api::room.room').findMany({
      filters: {
        $or: [{ documentId: roomId }, { roomId: roomId }],
      },
      populate: ['entity_sheets'],
    });
    const room = rooms[0];
    if (!room) throw new Error(`Room not found for ID: ${roomId}`);

    // ---------------------------------------------------------
    // 1. Persist User Message
    // ---------------------------------------------------------
    let activeTurnId = null;
    const turns = await strapi.documents('api::turn.turn').findMany({
      filters: { room: { documentId: room.documentId } },
      sort: 'turnNumber:desc',
      limit: 1,
    });
    if (turns?.[0]) activeTurnId = turns[0].documentId;

    await strapi.documents('api::message.message').create({
      data: {
        content: input,
        senderName: senderName,
        senderType: 'player',
        room: room.documentId,
        timestamp: Date.now(),
        turn: activeTurnId,
      },
      status: 'published',
    });

    // Broadcast logic removed

    // ---------------------------------------------------------
    // 2. Setup Agent & Executor OR Direct Execution
    // ---------------------------------------------------------
    const tools = getRegistryTools(strapi, room.documentId, mode);

    // [New] Direct Tool Execution (Bypass LLM)
    if (direct) {
      strapi.log.info(`[Narrator] Direct execution mode enabled.`);
      try {
        const command = typeof input === 'string' ? safeParseJson(input) : input;

        // Validation
        if (!command || typeof command !== 'object' || !command.tool) {
          throw new Error('Direct execution requires JSON with { tool: string, args: any }');
        }

        const toolName = command.tool;
        const toolArgs = command.args || {};
        const targetTool = tools.find((t) => t.name === toolName);

        if (!targetTool) {
          throw new Error(`Tool '${toolName}' not found in registry for mode ${mode}`);
        }

        strapi.log.info(`[Narrator] Executing tool direct: ${toolName}`, toolArgs);

        // Execute
        const result = await targetTool.func(toolArgs);

        const outputString = typeof result === 'string' ? result : JSON.stringify(result);

        return {
          thought_process: 'Direct Execution (No LLM)',
          narration: `Tool '${toolName}' executed successfully.\nOutput: ${outputString}`,
          topics: [],
          // We can attach raw result if needed
        };
      } catch (e) {
        strapi.log.error('Direct execution failed', e);
        return {
          thought_process: 'Direct Execution Failed',
          narration: `Error: ${e.message}`,
          topics: [],
        };
      }
    }

    // ---------------------------------------------------------
    // 3. Execution (Agent OR Direct)
    // ---------------------------------------------------------
    let finalNarratorResponse: NarratorResponse;
    let shouldBroadcastEntities = false;
    let outputText = '';

    if (direct) {
      // Already handled above
      // But if we fall through here, it means the direct logic above has an issue with flow
      // In direct mode above we returned early.
      // So this block is redundant if direct is true?
      // The code above returns.
      // Let's assume this block runs if direct is FALSE.
      // But wait, the original code had an early return for direct?
      // Let's double check logic.
      // Original code:
      // if (direct) { ... return ... }
      // then `if (direct) { ... } else { ... }`
      // This implies the code was redundant or messy?
      // Ah, the first block returns. So the second `if (direct)` is unreachable.
      // I'll keep it as is to match original structure but remove broadcast?
      // Wait, if first block returns, second block logic for setting `finalNarratorResponse` is skipped.
      // The first block returns { thought_process ... }.
      // The second block sets `finalNarratorResponse`.
      // If I just keep the Agent Logic in the `else` of `if (direct)` earlier call, or just remove the first redundant block?
      // I'll just keep the Agent Logic.
      // I'll assume `direct` is already handled.
    }

    // --- AGENT EXECUTION ---
    const llm = getGeminiModel(GeminiModel.PRO, { temperature: 0.4 });
    const promptKey = mode === 'debug' ? 'narrator_debug' : 'narrator_dm';

    // Load Prompt - Fail silently to default if missing, but log error
    let systemPromptText = `You are the DEBUG CONTROLLER.`;
    try {
      const prompts = await strapi.documents('api::prompt.prompt').findMany({
        filters: { key: promptKey },
      });
      if (prompts.length > 0) {
        systemPromptText = prompts[0].text;
      }
    } catch (e) {
      strapi.log.error('Failed to load prompt from DB', e);
    }

    const toolNames = tools.map((t) => t.name).join(', ');
    systemPromptText = systemPromptText.replace('{senderName}', senderName).replace('{toolNames}', toolNames);

    const agent = await createAgent({
      model: llm,
      tools: tools,

      systemPrompt: systemPromptText,
      middleware: [
        todoListMiddleware(),
        llmToolSelectorMiddleware({
          model: llm,
          maxTools: 5,
        }),
      ],
    });

    try {
      const result = await agent.invoke({
        messages: [new HumanMessage(input)],
      });

      // Detect Tool Usage to trigger broadcast
      if (result.messages && Array.isArray(result.messages)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hasToolCalls = result.messages.some((m) => (m as any).tool_calls && (m as any).tool_calls.length > 0);
        if (hasToolCalls) {
          shouldBroadcastEntities = true;
        }
      }

      const lastMessage =
        result.messages && result.messages.length > 0 ? result.messages[result.messages.length - 1] : null;

      if (lastMessage?.content) {
        outputText =
          typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);
      } else {
        outputText = 'I have completed the task.';
      }

      // Logging logic ...

      // Parse Output
      const jsonMatch = outputText.match(/```json\n([\s\S]*?)\n```/) || outputText.match(/```([\s\S]*?)```/);
      const cleanJson = jsonMatch ? jsonMatch[1] : outputText;
      try {
        const parsed = JSON.parse(cleanJson);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && 'narration' in parsed) {
          finalNarratorResponse = parsed;
        } else {
          finalNarratorResponse = {
            thought_process: 'Malformed Response',
            narration: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
            topics: [],
          };
        }
      } catch {
        finalNarratorResponse = {
          thought_process: 'Unstructured Response',
          narration: outputText,
          topics: [],
        };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      strapi.log.error('Agent execution failed', err);
      finalNarratorResponse = {
        thought_process: 'Agent Error',
        narration: `I encountered an fatal error: ${errorMessage}`,
        topics: [],
      };
    }

    // ---------------------------------------------------------
    // 4. Post-Processing
    // ---------------------------------------------------------
    if (shouldBroadcastEntities) {
      // Re-fetch character sheets directly to ensure freshness
      const sheets = (await strapi.documents('api::entity-sheet.entity-sheet').findMany({
        filters: { room: { documentId: room.documentId } },
      })) as unknown as CharacterSheet[];

      if (sheets.length > 0) {
        const entitiesUpdate = sheets.map((cs) => ({
          id: cs.documentId,
          name: cs.name,
          type: cs.type,
          position: cs.position,
          stats: cs.stats,
          currentHp: cs.currentHp,
          maxHp: cs.maxHp,
        }));

        // Snapshot
        try {
          const existingFrames =
            (await strapi.documents('api::time-frame.time-frame').findMany({
              filters: { room: { documentId: room.documentId } },
              fields: ['turnNumber'],
            })) || [];

          const nextTurnNumber = existingFrames.length + 1;

          await strapi.documents('api::time-frame.time-frame').create({
            data: {
              room: room.documentId,
              timestamp: new Date().toISOString(),
              turnNumber: nextTurnNumber,
              gameState: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                entities: entitiesUpdate as any,
                meta: {
                  source: 'tool_update',
                  narration: finalNarratorResponse.narration,
                },
              },
              status: 'published',
            },
            status: 'published',
          });
          strapi.log.info(`[Narrator] Created snapshot #${nextTurnNumber} with ${entitiesUpdate.length} entities`);
        } catch (snapErr) {
          strapi.log.error('Snapshot failed', snapErr);
        }

        // Broadcast removed
      }
    }

    // Save AI Message
    await strapi.documents('api::message.message').create({
      data: {
        content: finalNarratorResponse.narration,
        senderName: 'DM',
        senderType: 'dm',
        room: room.documentId,
        timestamp: Date.now(),
        turn: activeTurnId,
      },
      status: 'published',
    });

    // Broadcast logic removed

    return finalNarratorResponse;
  },
});
