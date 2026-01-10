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

import { factories } from '@strapi/strapi';
import { EngineCommand } from '../schemas/commands';
import { GameEvent } from '../schemas/events';
import { ActionResult, StateDiff } from './action-engine';
import type { UID } from '@strapi/types';

interface TurnInput {
  type: 'command' | 'text';
  agentId?: string; // Who is acting
  command?: EngineCommand;
  text?: string;
}

export default factories.createCoreService('api::game.turn-pipeline', ({ strapi }) => ({
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
        } else if (input.type === 'text') {
          // Placeholder for "Say" command or Intent Parsing
          // commands.push(await intentParser.parse(input.text, input.agentId));
          strapi.log.warn('[TurnPipeline] Text input interpretation not yet implemented:', input.text);
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
      // Transactional application (if possible, or sequential)

      // A. Apply State Changes
      for (const update of allDiffs.updates) {
        await strapi.documents(update.collection as UID.ContentType).update({
          documentId: update.documentId,
          data: update.data,
        });
      }

      // B. Create Events
      const createdEvents = [];
      for (const event of allEvents) {
        const e = await strapi.documents('api::game-event.game-event').create({
          data: event as unknown as Record<string, unknown>,
        });
        createdEvents.push(e);
      }

      // C. Create Turn Record
      // We should link these events to a Turn.
      // For now, simple Turn creation.
      const turn = await strapi.documents('api::turn.turn').create({
        data: {
          room: roomId,
          events: createdEvents.map((e) => e.documentId),
          timestamp: new Date().toISOString(),
          // summary: ... (Generated in Narration phase)
        },
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
      // const narration = await strapi.service('api::game.narrator').narrateTurn(createdEvents);
      // await strapi.documents('api::turn.turn').update({ documentId: turn.documentId, data: { summary: narration } });

      // 5. BROADCAST PHASE - REMOVED
      // const gameBroadcaster = strapi.service('api::game.game-broadcaster');
      // gameBroadcaster.broadcastTurnComplete...

      return { success: true, turnId: turn.documentId };
    } finally {
      // 6. UNLOCK
      await lockService.release(roomId, holderId);
    }
  },
}));
