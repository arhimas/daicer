/**
 * Turn Pipeline Service
 * The Orchestrator for the "Sandwich" Architecture.
 *
 * Flow:
 * 1. Intent Phase: Collect inputs, Parse text -> Commands.
 * 2. Resolution Phase: ActionEngine.dispatch(dryRun=true) -> Results (Events, Diffs).
 * 3. Persistence Phase: Apply Diffs, Save Events/Turn.
 * 4. Narration Phase: Narrator describes the Events.
 * 5. Broadcast Phase: Send updates to clients.
 */

import { Core } from '@strapi/strapi';
import { EngineCommand, MoveCommand } from '../schemas/commands';
import { GameEvent } from '../schemas/events';
import { ActionResult, StateDiff } from './action-engine';

interface TurnInput {
  type: 'command' | 'text';
  agentId?: string; // Who is acting
  command?: EngineCommand;
  text?: string;
}

// Helper to parse text actions like "MOVE:x,y,z"
const parseTextAction = (text: string, actorId: string): EngineCommand | null => {
  if (text.startsWith('MOVE:')) {
    const parts = text.replace('MOVE:', '').split(',');
    if (parts.length >= 2) {
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      const z = parts.length > 2 ? Number(parts[2]) : 0;
      return {
        type: 'MOVE',
        timestamp: Date.now(),
        payload: {
          actorId,
          targetPosition: { x, y, z },
          path: [], // Will be calculated by ActionEngine
          mode: 'walk',
        },
      } as MoveCommand;
    }
  }
  return null;
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Orchestrates the complete Turn Lifecycle ("Sandwich" Architecture).
   * Intent -> Resolution -> Persistence -> Narration -> Broadcast.
   * Uses lock services to prevent race conditions.
   *
   * @param roomId - The room context.
   * @param inputs - Raw inputs (text or commands).
   * @returns processing result.
   */
  async processTurn(roomId: string, inputs: TurnInput[]) {
    const lockService = strapi.service('api::game.lock-service');
    const holderId = `pipeline-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // 0. LOCK PHASE - Pessimistic Locking
    const acquired = await lockService.acquire(roomId, holderId);
    if (!acquired) {
      strapi.log.warn(`[TurnPipeline] Room ${roomId} is locked. Rejecting concurrent turn request.`);
      throw new Error('Room is currently processing another turn. Please wait.');
    }

    try {
      // const ctx: PipelineContext = { roomId, timestamp: Date.now() };
      strapi.log.info(`[TurnPipeline] Processing execution for Room ${roomId} with ${inputs.length} inputs`);

      // 1. INTENT PHASE
      // Convert all text inputs to Commands (using LLM or Rule-based)
      // For now, we assume inputs are already Commands or simple text we skip/log.
      // TODO: Integrate IntentParser here.

      const commands: EngineCommand[] = [];
      for (const input of inputs) {
        if (input.type === 'command' && input.command) {
          commands.push(input.command);
        } else if (input.type === 'text' && input.text && input.agentId) {
          // Parse Text Action
          const parsed = parseTextAction(input.text, input.agentId);
          if (parsed) {
            commands.push(parsed);
          } else {
            strapi.log.warn('[TurnPipeline] Unknown text input:', input.text);
          }
        }
      }

      if (commands.length === 0) return { success: true, message: 'No executable commands.' };

      // 2. RESOLUTION PHASE (Pure Logic)
      // We use the ActionEngine in pure mode.
      const actionEngine = strapi.service('api::game.action-engine');

      // We expect actionEngine to return `ActionResult[]`
    const results = await actionEngine.dispatch(roomId, commands, true); // dryRun=true

      // Aggregate Diffs and Events
      const allEvents: GameEvent[] = [];
      const allDiffs: StateDiff = { updates: [], creates: [], deletes: [] };

      for (const res of results as ActionResult[]) {
        if (res.success) {
          allEvents.push(...res.events);
          allDiffs.updates.push(...res.stateDiff.updates);
          allDiffs.creates.push(...res.stateDiff.creates);
          allDiffs.deletes.push(...res.stateDiff.deletes);
        } else {
          strapi.log.warn('[TurnPipeline] Command Failed:', res.message);
          // We might want to persist "Failed Action" events?
        }
      }

      // 3. PERSISTENCE PHASE
      // Transactional application (Atomic Commit)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdEvents: any[] = [];

      const turnId = await strapi.db.transaction(async (_trx) => {
        // A. Apply State Changes
        for (const update of allDiffs.updates) {
          await strapi.db.query(update.collection).update({
            where: { documentId: update.documentId },
            data: update.data,
          });
        }

        // B. Create Events
        for (const event of allEvents) {
          const e = await strapi.documents('api::game-event.game-event').create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: event as any,
          });
          createdEvents.push(e);
        }

        // C. Create Turn Record
        const turn = await strapi.documents('api::turn.turn').create({
          data: {
            room: roomId,
              events: createdEvents.map((e) => e.documentId), // Events removed from Turn schema, but putting in metadata or ignoring if schema ignores.
              // We'll cast to ANY to bypass strict checks if schema is missing field but we want to try.
              // Actually, best to just put in metadata as planned.
              metadata: {
                events: createdEvents.map((e) => e.documentId)
              },
              actions: commands as unknown as Record<string, unknown>,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
        });

        return turn.documentId;
      });

      // D. Create TimeFrame Snapshot
      // This supports the "Replay" requirement by capturing the state AFTER the turn.
      // We need to fetch the "Active State" of potential entities in the room to snapshot them.
      // For now, we'll snapshot the 'computedActions' or similar from ActiveState if available,
      // or just a placeholder if deriving state is expensive.
      // Ideally, we snapshot: Room Description, Entity Locations, HP, etc. (ActiveState).

      // Let's assume we want to snapshot simple robust data for now.
      // We'll query valid entities in the room.
      const entitiesInRoom = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
        filters: {
          room: { documentId: roomId },
        },
        populate: ['stats'], // populate stats if needed, or just basic fields are mostly on root now
      });

      const characterSnapshots = entitiesInRoom.map((e) => ({
        name: e.name,
        documentId: e.documentId,
        hp: e.currentHp,
        maxHp: e.maxHp,
        ac: e.ac || 10,
        condition: 'normal', // TODO: track conditions via components
      }));

      await strapi.documents('api::time-frame.time-frame').create({
        data: {
          turnNumber: -1, // TODO: Maintain a turn counter on Room?
          timestamp: new Date().toISOString(),
          room: roomId,
          gameState: {
            overview: 'Snapshot after Turn execution',
            entities: characterSnapshots,
            // Add map state/entropy here if needed
          },
          events: createdEvents.map((e) => e.documentId),
        },
      });

      // 4. NARRATION PHASE
      // Call Narrator with the LIST of Events.
      try {
        const room = await strapi.documents('api::room.room').findOne({
          documentId: roomId,
          populate: ['world', 'dmSettings', 'players', 'players.character'],
        });

        // Fetch simplified entities for Narrative Context
        // Re-using entitiesInRoom from Step 3D might be stale if Diffs removed them, but acceptable for now.
        // Or we assume `entitiesInRoom` (State Before) + Events is enough.
        // Actually best to re-fetch or apply diffs memory-side.
        // For simplicity, we re-fetch entities to get current status.
        const currentEntities = await strapi.documents('api::entity-sheet.entity-sheet').findMany({
          filters: { room: { documentId: roomId } },
          populate: ['stats', 'computedActions'],
        });

        // Map to Narrative Engine format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const narrEntities = currentEntities.map((e: any) => ({
          id: e.documentId,
          name: e.name,
          type: e.type || 'character',
          hp: e.currentHp,
          maxHp: e.maxHp,
          armorClass: e.ac || 10,
          stats: e.stats || {},
          actions: e.computedActions || [],
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const narrPlayers = (room.players || []).map((p: any) => ({
          ...p,
          character: p.character, // Ensure structure
        }));

        const narration = await strapi.service('api::game.narrative-engine').generateNarrativeResponse(
          roomId,
          room.world?.description || 'A dark room.',
          [], // Messages - TODO: Fetch recent messages if needed
          narrPlayers,
          narrEntities,
          room.world?.language || 'en',
          { ...room.world, ...room.dmSettings },
          undefined, // worldConditions
          undefined, // streamId
          undefined // mapImage - TODO: Generate Map Image here if desired
        );

        if (narration && narration.overall_summary) {
          await strapi.documents('api::turn.turn').update({
            documentId: turnId, // turnId is returned from transaction
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: { summary: narration.overall_summary } as any,
          });

          // Create DM Message so it appears in Chat
          await strapi.documents('api::message.message').create({
            data: {
              content: narration.overall_summary,
              senderName: 'Dungeon Master',
              senderType: 'dm',
              room: roomId,
              turn: turnId,
              timestamp: Date.now().toString(),
              // Assuming 'room', 'turn' are relations.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          });
        }
      } catch (err) {
        strapi.log.error('[TurnPipeline] Narration Failed:', err);
      }

      // 5. BROADCAST PHASE - Polling handles this.

      return { success: true, turnId: turnId };
    } finally {
      // 6. UNLOCK
      await lockService.release(roomId, holderId);
    }
  },

  /**
   * Helper to fetch pending actions from Room and process them.
   */
  async processRoomTurn(roomId: string) {
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
      populate: ['players', 'players.character'],
    });

    if (!room) throw new Error('Room not found');

    const inputs: TurnInput[] = [];
    const players = room.players || [];

    for (const p of players) {
      if (p.action) {
        // Try to parse as JSON Command
        try {
          const json = JSON.parse(p.action);
          if (json.type) {
            inputs.push({ type: 'command', agentId: p.character?.documentId, command: json });
            continue; // Handled
          }
        } catch {
          // Not JSON
        }
        // Fallback to text
        inputs.push({ type: 'text', agentId: p.character?.documentId, text: p.action });
      }
    }

    if (inputs.length === 0) return { success: true, message: 'No actions pending.' };

    const result = await this.processTurn(roomId, inputs);

    // Clear Actions (Post-Processing)
    // We do this here because processTurn is generic/stateless regarding "Pending Actions" concept.
    // Ideally processTurn handles this if it knows about the inputs, but cleaner to separate.
    if (result.success) {
      const updatedPlayers = players.map((p) => ({ ...p, action: null, isReady: false }));
      await strapi.documents('api::room.room').update({
        documentId: roomId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { players: updatedPlayers } as any,
      });
    }

    return result;
  },
});
