/**
 * ⚠️ DOCUMENTATION MANDATE: Update JSDoc & README with ANY change.
 * Keep documentation synchronized with code at all times.
 */
import type { EntropyState } from '@daicer/engine/entropy';
import type { Player, Creature, WorldSettings, Chunk, Language } from '@daicer/engine/types';
// Local definition to avoid missing shared export
interface Message {
  sender: string;
  text: string;
}

export default ({ strapi }) => ({
  /**
   * Legacy Turn Processor (Phase 1).
   * Routes deterministic logic and generates map images.
   * Being replaced by the new Pipeline Service.
   */
  async processTurn(
    roomId: string,
    worldDescription: string,
    messages: Message[],
    players: Player[],
    // creatures argument removed/deprecated
    language: Language = 'en',
    settings?: WorldSettings,
    worldConditions?: unknown[],
    mapContext?: string,
    streamId?: string,
    chunk?: Chunk
  ) {
    const narrativeEngine = strapi.service('api::game.narrative-engine');
    const turnPersistence = strapi.service('api::game.turn-persistence');
    // const gameBroadcaster = strapi.service('api::game.game-broadcaster'); // REMOVED
    const actionEngine = strapi.service('api::game.action-engine');
    const ledger = strapi.service('api::game.game-ledger');

    // --- Entropy System ---
    const { EntropySystem } = await import('../src/engine/entropy');
    // Use roomId as seed if code not available immediately, or fetch room code
    // Assuming worldConditions arg is actually the EntropyState JSON
    const entropySys = new EntropySystem(roomId, worldConditions as unknown as EntropyState);

    // Advance 1 turn (using 0 or placeholder if turn number not explicit yet)
    // We can fetch last turn number if critical, but for now we accept sequential logic
    const entropyChange = entropySys.advanceTurn(1, Date.now());

    if (entropyChange && entropyChange.newEvent) {
      // Log Event
      await ledger.logEvent(roomId, {
        type: 'ENTROPY_CHANGE',
        payload: entropyChange as Record<string, unknown>,
        actorId: 'system',
        meta: { visibility: entropyChange.newEvent?.visibility || 'dm' },
      });

      // Update DB State immediately so Narrative sees it?
      // Narrative uses the passed objects. We should update the object we pass to Narrative.
      // But Narrative Engine might expect 'worldConditions'.
      // We also need to persist state to Room.
      await strapi.documents('api::room.room').update({
        documentId: roomId,
        data: { entropyState: entropySys.state },
      });
    }

    if (entropyChange) {
      // logic unchanged
    }

    // 1. Broadcast Processing Start -> DB Update
    // gameBroadcaster.startProcessing(roomId);
    await strapi.documents('api::room.room').update({
      documentId: roomId,
      data: { isProcessing: true },
    });

    // 2. Execute Deterministic Turn (Movement, Collision, Exploration)
    // Parse actions from players (strings) into structured commands
    const deterministicActions = players
      .filter((p) => p.action)
      .map((p) => {
        if (!p.action) return null;
        // Parse "MOVE:x,y,z"
        if (p.action.startsWith('MOVE:')) {
          const parts = p.action.replace('MOVE:', '').split(',');
          if (parts.length >= 2) {
            const x = Number(parts[0]);
            const y = Number(parts[1]);
            const z = parts.length > 2 ? Number(parts[2]) : 0;
            return {
              type: 'move',
              entityId: p.characterSheet?.documentId,
              payload: { x, y, z },
            };
          }
        }
        // Fallback or other commands could be parsed here
        return null;
      })
      .filter((a) => a !== null);

    await strapi.service('api::game.turn-processing').executeDeterministicTurn(roomId, deterministicActions);

    // 3. Generate Map Image with NEW State
    let mapImage: Buffer | undefined;
    let mapImageId: string | undefined;

    if (chunk) {
      try {
        const { generateMapImage } = await import('./map-visualization');

        // Fetch Fresh Room Data (to get updated entity positions and exploredTiles)
        const roomEntity = await strapi.documents('api::room.room').findOne({
          documentId: roomId,
          populate: [
            'entity_sheets',
            'entity_sheets.monster',
            'entity_sheets.character',
            'entity_sheets.character.stats',
          ], // Populate Blueprint for Adapter
        });

        const exploredTiles = new Set<string>((roomEntity?.exploredTiles as string[]) || []);

        // Calculate center based on first player or default
        const firstPlayerSheet = (roomEntity.entity_sheets as unknown as Record<string, unknown>[])?.[0];
        const center = (firstPlayerSheet?.position as { x: number; y: number; z: number }) || { x: 0, y: 0, z: 0 };

        // Re-construct players list with updated positions for visualization
        // Unify all sheets (players + monsters)
        const updatedEntities = ((roomEntity.entity_sheets as Record<string, unknown>[]) || []).map((s) => ({
          id: s.documentId,
          name: s.name,
          position: s.position,
          hp: s.currentHp,
          maxHp: s.maxHp,
          type: s.type || 'player',
        }));

        // Map Renderer likely expects explicit players vs creatures arrays?
        // For now, let's split them based on type for the legacy signature of generateMapImage
        const updatedPlayers = updatedEntities.filter((e) => e.type === 'player');

        const creaturesDummy: unknown[] = [];
        mapImage = await generateMapImage(
          chunk,
          updatedPlayers as unknown as Player[],
          creaturesDummy as unknown as Creature[],
          exploredTiles,
          center
        );

        // 4. Upload Map Image to Strapi
        if (mapImage) {
          const uploadService = strapi.plugin('upload').service('upload');
          const uploadedFile = await uploadService.upload({
            data: {
              refId: roomEntity.id,
              ref: 'api::room.room', // Temporary association or just orphan?
              // Actually we want to associate it with the TURN, but the turn doesn't exist yet.
              // We'll upload it as an orphan first, then link it.
              field: 'contextImage',
            },
            files: {
              name: `map_turn_${Date.now()}.png`,
              type: 'image/png',
              size: mapImage.length,
              buffer: mapImage,
            },
          });
          // Upload usually returns an array or object depending on version, assuming object or array [0]
          const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;
          mapImageId = file.id;
        }
      } catch (e) {
        strapi.log.warn('Failed to generate/upload DM map context:', e);
      }
    }

    // 5a. Adapt Entities for Narrative (Direct Hydration)
    // const entityAdapter = strapi.service('api::game.entity-adapter'); // Removed
    const allSheets =
      ((
        await strapi.documents('api::room.room').findOne({
          documentId: roomId,
          populate: [
            'entity_sheets',
            'entity_sheets.monster',
            'entity_sheets.character',
            'entity_sheets.character.stats',
            'entity_sheets.computedActions', // Ensure we get these
          ],
        })
      ).entity_sheets as unknown[]) || [];

    const unifiedEntities = allSheets.map((s: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sheet = s as any; // Cast to any for property access until properly typed
      return {
        id: sheet.documentId,
        name: sheet.name,
        type: sheet.type || 'character',
        hp: sheet.currentHp || sheet.maxHp,
        maxHp: sheet.maxHp,
        armorClass: sheet.armorClass || sheet.ac || 10,
        stats: sheet.stats || {},
        actions: sheet.computedActions || sheet.actions || [],
        // Minimal needed for Narrative
      };
    });

    // 5. Generate Narrative (with new Map Image)
    const response = await narrativeEngine.generateNarrativeResponse(
      roomId,
      worldDescription,
      messages,
      players,
      unifiedEntities,

      language,
      settings,
      worldConditions,
      mapContext,
      streamId,
      mapImage
    );

    // 6. Persist Turn
    const persistenceResult = await turnPersistence.persistTurn(
      roomId,
      response.overall_summary,
      players.filter((p) => p.action).map((p) => ({ user: p.userId, action: p.action })),
      'group',
      {
        model: 'llm',
        ragUsed: !!response.metadata?.ragContext,
        contextImage: mapImageId, // Pass the image ID to persistence
      }
    );

    const { turn, room } = persistenceResult;

    // Link image if we have one (if persistTurn didn't handle it in metadata, we might need a separate update if schema expects relation)
    // The Turn schema has 'contextImage' relation. persistTurn usually takes 'metadata' json.
    // We should probably update the turn entity directly to link the relation.
    if (mapImageId) {
      await strapi.documents('api::turn.turn').update({
        documentId: turn.documentId,
        data: {
          contextImage: mapImageId,
        },
      });
    }

    // 7. Clear Actions
    await turnPersistence.clearPlayerActions(room.documentId, players);

    // 8. Broadcast Updates -> REMOVED
    // gameBroadcaster.broadcast... removed.
    // Frontend Polls.

    // 9. Processing Complete -> DB Update
    await strapi.documents('api::room.room').update({
      documentId: roomId,
      data: { isProcessing: false },
    });

    // 10. Dispatch Deterministic Commands (God Mode Integration)
    if (response.commands && Array.isArray(response.commands) && response.commands.length > 0) {
      strapi.log.info(`[God Mode] Dispatching ${response.commands.length} commands`);
      await actionEngine.dispatch(roomId, response.commands);
    }

    return {
      ...response,
      metadata: {
        ragContext: response.metadata?.ragContext,
      },
    };
  },

  async executeDeterministicTurn(roomId: string, actions: unknown[]) {
    const turnPersistence = strapi.service('api::game.turn-persistence');
    // const gameBroadcaster = strapi.service('api::game.game-broadcaster'); // REMOVED
    const spawnService = strapi.service('api::game.spawn-service');

    // ... lines 301-460 unchanged (process Actions, persist Turn) ...
    // Note: I will just replace the broadcaster parts since I can't "skip" inside replacement easily without context.
    // I need to be careful. The previous tool call covered processTurn. This is a separate method.
    // I will replace `executeDeterministicTurn` carefully.

    // 1. Fetch Room
    const room = await strapi.documents('api::room.room').findOne({
      documentId: roomId,
      populate: ['entity_sheets', 'world'],
    });

    if (!room) throw new Error('Room not found');

    // 2. Process Actions
    const processedActions = [];
    const movedEntityIds = new Set<string>();

    const allEntities = [
      ...(room.entity_sheets || []).map((s: Record<string, unknown>) => ({
        id: s.documentId || s.id,
        pos: s.position,
      })),
    ];

    type AnyAction = {
      type: string;
      entityId?: string;
      payload?: {
        x?: number;
        y?: number;
        z?: number;
        id?: string;
        entityType?: string;
        position?: { x: number; y: number; z: number };
        // Combat props
        actorId?: string;
        targetId?: string;
        weaponId?: string;
        actionId?: string;
      };
    };

    for (const rawAction of actions) {
      const action = rawAction as AnyAction;

      if (action.type === 'move') {
        const sheet = room.entity_sheets?.find(
          (s: Record<string, unknown>) => s.documentId === action.entityId || s.id === action.entityId
        );

        if (sheet) {
          // Collision Check
          const targetX = Math.round(action.payload?.x || 0);
          const targetY = Math.round(action.payload?.y || 0);
          const isOccupied = allEntities.some(
            (e) =>
              e.id !== (sheet.documentId || sheet.id) && // Ignore self
              e.pos &&
              Math.round(e.pos.x) === targetX &&
              Math.round(e.pos.y) === targetY
          );

          if (isOccupied) {
            strapi.log.warn(`[Move] Collision detected at ${targetX},${targetY} for ${sheet.name}`);
            continue; // Skip invalid move
          }

          if (action.payload?.x !== undefined && action.payload?.y !== undefined) {
            await turnPersistence.updateCharacterPosition(
              sheet.documentId,
              action.payload.x,
              action.payload.y,
              action.payload.z || 0
            );
          }
          movedEntityIds.add(sheet.documentId);
          processedActions.push(action);

          // Update local entity list for subsequent checks in same turn
          const entityRef = allEntities.find((e) => e.id === (sheet.documentId || sheet.id));
          if (entityRef && action.payload) {
            entityRef.pos = { x: targetX, y: targetY, z: action.payload.z || 0 };
          }

          // Exploration Update
          try {
            const VISION_RADIUS = 8;
            const CHUNK_SIZE = 16;
            const currentExplored = new Set((room.exploredTiles as string[]) || []);
            const currentExploredChunks = new Set((room.exploredChunks as string[]) || []);
            let explorationChanged = false;
            let chunksChanged = false;

            for (let dy = -VISION_RADIUS; dy <= VISION_RADIUS; dy++) {
              for (let dx = -VISION_RADIUS; dx <= VISION_RADIUS; dx++) {
                if (Math.sqrt(dx * dx + dy * dy) <= VISION_RADIUS) {
                  const wx = targetX + dx;
                  const wy = targetY + dy;
                  const key = `${wx},${wy}`;
                  if (!currentExplored.has(key)) {
                    currentExplored.add(key);
                    explorationChanged = true;

                    // Chunk Exploration
                    const cx = Math.floor(wx / CHUNK_SIZE);
                    const cy = Math.floor(wy / CHUNK_SIZE);
                    const chunkKey = `${cx},${cy}`;
                    if (!currentExploredChunks.has(chunkKey)) {
                      // Found a new chunk!
                      // Trigger Spawning
                      try {
                        const voxelEngine = strapi.service('api::voxel-engine.voxel-engine');
                        // Fetch (or gen) chunk to get biome
                        // We need world config. Assuming room.world is populated or we fetch it.
                        // If not, we might fallback.
                        const config =
                          room.world ||
                          (
                            await strapi
                              .documents('api::room.room')
                              .findOne({ documentId: roomId, populate: ['world'] })
                          ).world;
                        const chunk = await voxelEngine.getChunk(cx, cy, config);

                        const centerTile = chunk.tiles[3]?.[8]?.[8];
                        const biome = centerTile?.biome || 'plains';

                        strapi.log.info(
                          `[TurnProcessing] New Chunk Discovered: ${chunkKey} (${biome}). Triggering Spawn.`
                        );

                        const biomeSpawnService = strapi.service('api::game.biome-spawn-service');
                        await biomeSpawnService.populateChunk(cx, cy, biome, roomId);

                        currentExploredChunks.add(chunkKey);
                        chunksChanged = true;
                      } catch (err) {
                        strapi.log.error(`[TurnProcessing] Failed to spawn biome entities for ${chunkKey}`, err);
                      }
                    }
                  }
                }
              }
            }

            if (explorationChanged || chunksChanged) {
              await strapi.documents('api::room.room').update({
                documentId: roomId,
                data: {
                  exploredTiles: Array.from(currentExplored),
                  exploredChunks: Array.from(currentExploredChunks),
                } as unknown,
              });
            }
          } catch (e) {
            strapi.log.error('Exploration update failed', e);
          }
        }
      } else if (action.type === 'spawn') {
        try {
          if (action.payload?.entityType === 'monster') {
            await spawnService.spawnMonster(roomId, action.payload.id, action.payload.position);
          } else if (action.payload?.entityType === 'character') {
            await spawnService.spawnCharacter(roomId, action.payload.id, action.payload.position);
          }
          processedActions.push(action);
        } catch (err) {
          strapi.log.error('Failed to process spawn action', err);
        }
      } else if (action.type === 'attack') {
        // Delegate to Action Engine to ensure proper rules processing
        // We map our loose payload to strict Engine Command
        const cmd = {
          type: 'ATTACK',
          id: `${Date.now()}`,
          timestamp: Date.now(),
          payload: {
            actorId: action.entityId || action.payload?.actorId,
            targetId: action.payload?.targetId,
            weaponId: action.payload?.weaponId || action.payload?.actionId,
          },
        };

        // We use the action engine to dispatch, but this creates a SEPARATE turn entity logic in current implementation.
        // To avoid double-turns if mixed with Move, strict 'executeDeterministicTurn' usually handles one 'batch'.
        // Ideally we'd unify, but for reliability fix now, delegating is safest path to working code.
        try {
          await strapi.service('api::game.action-engine').dispatch(roomId, [cmd]);
          processedActions.push(action);
        } catch (e) {
          strapi.log.error('Failed to dispatch attack', e);
        }
      }
    }

    // 3. Persist Turn (Re-fetching room/snapshots handled inside persistTurn logic or similar helper if refactored fully,
    // but here we used logic inline previously. Let's use persistTurn but we need snapshots of UPDATED state.)
    // Actually, `persistTurn` fetches the room again. So it should capture the updated state!
    const persistenceResult = await turnPersistence.persistTurn(
      roomId,
      `Deterministic Turn: ${processedActions.length} actions executed.`,
      processedActions,
      'engine',
      { model: 'engine' }
    );

    const { turn } = persistenceResult;

    // 4. Broadcast Updates - REMOVED
    // gameBroadcaster.broadcastTurnComplete... removed.
    // gameBroadcaster.broadcastEntitiesUpdate... removed.

    return { success: true, turnId: turn.documentId };
  },

  async submitAction(
    roomId: string,
    action: string,
    user: Record<string, unknown>,
    mode?: 'debug' | 'game',
    direct?: boolean
  ) {
    // 0. Handle Debug Mode (Immediate Execution)
    if (mode === 'debug') {
      return strapi.service('api::narrator.narrator').processAction({
        roomId,
        input: action,
        mode: 'debug',
        userId: user?.documentId || user?.id,
        direct,
      });
    }

    // const gameBroadcaster = strapi.service('api::game.game-broadcaster'); // REMOVED

    // 1. Fetch Room and Player
    const rooms = await strapi.documents('api::room.room').findMany({
      filters: { roomId },
      populate: ['players'],
    });

    if (!rooms || rooms.length === 0) throw new Error('Room not found');
    const room = rooms[0] as unknown as { documentId: string; roomId: string; players: Player[] };
    const players = room.players || [];

    // 2. Find Player for User
    const playerIndex = players.findIndex(
      (p: Player) => p.user?.documentId === user.documentId || p.user?.id === user.id
    );
    if (playerIndex === -1) throw new Error('User is not a player in this room');

    // 3. Update Action
    players[playerIndex].action = action;
    players[playerIndex].isReady = true;

    await strapi.documents('api::room.room').update({
      documentId: room.documentId,
      data: {
        players: players,
      } as unknown as Record<string, unknown>,
    });

    // 4. Broadcast Update - REMOVED
    // gameBroadcaster.broadcastGameUpdate(room.roomId, room.documentId, { players });

    return { success: true };
  },
});
