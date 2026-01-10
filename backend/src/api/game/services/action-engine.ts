import { ActionDispatcher, GameState, Command } from '../../../engine';

export default ({ strapi }) => ({
  async dispatch(roomId: string, commands: Command[]) {
    const dispatcher = new ActionDispatcher();
    const results = [];

    // 1. Fetch Hydrated State
    // We need a robust way to get GameState. For now, we'll fetch Room + basic relations.
    // In a real ECS loop, we'd cache this or have a state manager.
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
      populate: [
        'players',
        'players.character',
        'entity_sheets',
        'entity_sheets.monster',
        'entity_sheets.monster.structuredActions',
        'entity_sheets.monster.features',
        'entity_sheets.character',
        'entity_sheets.character.stats',
        'entity_sheets.position', // Critical for correct entity placement
      ],
    });

    if (!room) throw new Error(`Room ${roomId} not found`);

    // Map Strapi relations to Engine GameState
    // This is a partial mapping for now
    // Adapt Entities
    const entityAdapter = strapi.service('api::game.entity-adapter');
    const unifiedEntities = (room.entity_sheets || []).map((s) => entityAdapter.adapt(s));

    const initialState: GameState = {
      room: { id: room.documentId, ...room },
      world: {}, // TODO: Fetch Voxel world if needed for Move checks
      entities: unifiedEntities,
      players: room.players || [],
      settings: room.settings || {},
    };

    // 2. Dispatch Commands
    for (const cmd of commands) {
      try {
        const result = dispatcher.dispatch(initialState, cmd);
        results.push(result);

        if (result.success) {
          // 3. Apply Side Effects / Persistence
          // This is where the "Engine -> DB" sync happens
          await this.persistResult(roomId, result);
        }
      } catch (e) {
        strapi.log.error('Action Dispatch Failed', e);
        results.push({ success: false, message: e.message, events: [] });
      }
    }

    return results;
  },

  async persistResult(roomId: string, result: import('../../../engine').ActionResult) {
    // 1. Apply Immediate Updates (Entity Sync)
    for (const event of result.events) {
      if (event.type === 'ENTITY_MOVED') {
        const { entityId, to } = event.payload;
        await strapi.documents('api::entity-sheet.entity-sheet').update({
          documentId: entityId,
          data: { position: to },
        });
      }

      if (event.type === 'ATTACK_RESULT') {
        const { targetId, damage } = event.payload;
        if (damage > 0 && targetId) {
          // Fetch current sheet to apply damage accurately
          // (Optimization: we could trust the Engine result if it returns new HP, but event only has damage)
          const targetSheet = await strapi.documents('api::entity-sheet.entity-sheet').findOne({
            documentId: targetId,
            fields: ['currentHp', 'maxHp'],
          });

          if (targetSheet) {
            const newHp = Math.max(0, (targetSheet.currentHp || 0) - damage);
            await strapi.documents('api::entity-sheet.entity-sheet').update({
              documentId: targetId,
              data: { currentHp: newHp },
            });
          }
        }
      }

      if (event.type === 'SPELL_CAST') {
        // TODO: Decrement spell slots if needed.
        // Requires logic to know which slot level was used.
        // For now, we log the event.
      }

      // Handle LONG_REST (HP Recovery)
      if (event.type === 'LONG_REST_COMPLETED') {
        // We might want to reset HP for all chars in room?
        // Engine event payload doesn't list all IDs?
        // Dispatcher usually handles loop.
        // If Dispatcher emits generic "Rest Completed", we might need to iterate here or trust Engine events per actor?
        // Current Dispatcher logic iterates and updates memory state.
        // We should probably rely on Dispatcher emitting unique events for each heal OR
        // iterate room players here.
        // For reliability, let's reset all players in room.
        const room = await strapi.documents('api::room.room').findOne({
          documentId: roomId,
          populate: ['entity_sheets'],
        });

        const sheets = room.entity_sheets || [];
        for (const sheet of sheets) {
          if (sheet.type === 'player' || sheet.type === 'npc') {
            // Monsters don't usually long rest?
            await strapi.documents('api::entity-sheet.entity-sheet').update({
              documentId: sheet.documentId,
              data: { currentHp: sheet.maxHp },
            });
          }
        }
      }
    }

    // 2. SOTA Persistence: Create TimeFrame (Turn)
    // We treat this execution as a discrete "Turn" or "TimeStep".

    // Find latest turn number
    const lastTurnHandles = await strapi.documents('api::time-frame.time-frame').findMany({
      filters: { room: { documentId: roomId } },
      sort: 'turnNumber:desc',
      limit: 1,
      fields: ['turnNumber'],
    });
    const nextTurnNumber = (lastTurnHandles[0]?.turnNumber || 0) + 1;
    const now = Date.now();

    // 2b. Create Game Event Entities
    const createdEventIds: string[] = [];

    for (const event of result.events) {
      const gEvent = await strapi.documents('api::game-event.game-event').create({
        data: {
          type: event.type,
          payload: event.payload,
          timestamp: now, // Schema expects biginteger
          room: roomId,
          turn_number: nextTurnNumber, // Schema: turn_number
          actor: event.payload.actorId || event.payload.entityId || null, // Schema: actor
        },
        status: 'published',
      });
      createdEventIds.push(gEvent.documentId);
    }

    // Create TimeFrame with State Diff AND Relation linkage
    const timeFrame = await strapi.documents('api::time-frame.time-frame').create({
      data: {
        turnNumber: nextTurnNumber,
        timestamp: new Date().toISOString(),
        room: roomId,
        gameState: { events: result.events }, // Keep JSON for quick client diffs
        events: createdEventIds, // Link to queryable entities
      },
      status: 'published',
    });

    // 3. Create System Message for Log
    const logContent =
      result.events.map((e) => `[${e.type}] ${JSON.stringify(e.payload)}`).join('\n') || 'Action executed.';

    await strapi.documents('api::message.message').create({
      data: {
        content: logContent,
        senderName: 'System',
        senderType: 'system',
        room: roomId,
        turn: timeFrame.documentId,
        timestamp: now,
      },
      status: 'published',
    });

    // 4. Broadcast
    const { streamManager } = await import('../../../utils/llm/stream-manager');
    streamManager.broadcast(roomId, 'engine:events', {
      events: result.events,
      turnId: timeFrame.documentId,
    });
  },
});
