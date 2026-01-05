/**
 * tool-executor service
 */

// Regex to parse tool calls like: tool_name(arg1="val", arg2=123, arg3='{"a":1}')
const TOOL_REGEX = /^([a-zA-Z0-9_]+)\((.*)\)$/s;

// Helper implementation functions defined outside the exported object to avoid 'this' context issues
const executeSummonMonster = async (strapi, roomId: string, args: any) => {
  const { blueprintId, position } = args;
  if (!blueprintId) throw new Error('Missing blueprintId');

  let x, y, z;
  if (typeof position === 'object') {
    x = position.x;
    y = position.y;
    z = position.z ?? 0;
  } else if (args.x !== undefined && args.y !== undefined) {
    x = args.x;
    y = args.y;
    z = args.z ?? 0;
  } else {
    throw new Error('Missing position');
  }

  // Check template existence
  const template = await strapi.documents('api::monster.monster').findOne({ documentId: blueprintId });
  if (!template) throw new Error(`Monster template ${blueprintId} not found`);

  const spawnService = strapi.service('api::game.spawn-service');
  const instance = await spawnService.spawnMonster(roomId, blueprintId, { x, y, z });

  // Events & Broadcast
  await strapi.service('api::game.game-broadcaster').broadcastRoomEntities(roomId);

  await strapi.service('api::game-event.game-event').logEvent(roomId, 'SPAWN_ENTITY', {
    entityId: instance.documentId,
    templateId: blueprintId,
    position: { x, y, z },
    name: instance.name,
  });

  return `Spawned ${instance.name} at ${x},${y},${z}`;
};

const executeSummonCharacter = async (strapi, roomId: string, args: any) => {
  const { blueprintId, position, ownerId } = args;
  if (!blueprintId) throw new Error('Missing blueprintId');

  let x, y, z;
  if (typeof position === 'object') {
    x = position.x;
    y = position.y;
    z = position.z ?? 0;
  } else if (args.x !== undefined && args.y !== undefined) {
    x = args.x;
    y = args.y;
    z = args.z ?? 0;
  } else {
    throw new Error('Missing position');
  }

  const spawnService = strapi.service('api::game.spawn-service');
  // Pass ownerId if present, otherwise it spawns as an NPC
  const instance = await spawnService.spawnCharacter(roomId, blueprintId, { x, y, z }, ownerId);

  // Events & Broadcast
  await strapi.service('api::game.game-broadcaster').broadcastRoomEntities(roomId);

  await strapi.service('api::game-event.game-event').logEvent(roomId, 'SPAWN_ENTITY', {
    entityId: instance.documentId,
    templateId: blueprintId,
    position: { x, y, z },
    name: instance.name,
  });

  return `Spawned ${instance.name} at ${x},${y},${z}`;
};

const executeMove = async (strapi, roomId: string, args: any) => {
  throw new Error('Direct Move not implemented yet.');
};

const executeAttack = async (strapi, roomId: string, args: any) => {
  throw new Error('Direct Attack not implemented yet.');
};

const executeGetMapImage = async (strapi, roomId: string, args: any) => {
  throw new Error('Direct Map Image not implemented yet.');
};

export default ({ strapi }) => ({
  /**
   * Execute a tool string directly, bypassing LLM parsing.
   * @param roomId
   * @param toolString
   */
  async execute(roomId: string, toolString: string) {
    strapi.log.info(`[ToolExecutor] Executing: ${toolString}`);

    // 1. Parse Tool String
    const match = toolString.trim().match(TOOL_REGEX);
    if (!match) {
      throw new Error(`Invalid tool command format. Expected: name(args...). Got: ${toolString}`);
    }

    const toolName = match[1];
    const argsString = match[2];

    const args: Record<string, any> = {};

    // Simple parser for key=value pairs.
    // Handles quotes strings "..." and JSON objects '...' or {...}
    const argPattern = /([a-zA-Z0-9_]+)=((?:"[^"]*")|(?:'[^']*')|(?:\{[^}]*\})|(?:\[[^\]]*\])|(?:[^,]+))/g;

    let argMatch;
    while ((argMatch = argPattern.exec(argsString)) !== null) {
      const key = argMatch[1];
      let val = argMatch[2].trim();

      // Unquote
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      // Try Parse JSON
      if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
        try {
          args[key] = JSON.parse(val);
        } catch (e) {
          // Keep as string
        }
      } else if (!isNaN(Number(val))) {
        args[key] = Number(val);
      } else if (val === 'true') {
        args[key] = true;
      } else if (val === 'false') {
        args[key] = false;
      } else {
        args[key] = val;
      }
    }

    strapi.log.debug(`[ToolExecutor] Parsed Args:`, args);

    // 2. Map Tool Name & Args to Implementation
    try {
      if (toolName === 'spawn_entity') {
        if (args.type === 'monster') {
          return await executeSummonMonster(strapi, roomId, args);
        } else if (args.type === 'player' || args.type === 'npc') {
          return await executeSummonCharacter(strapi, roomId, args);
        }
      } else if (toolName === 'move_entity') {
        return await executeMove(strapi, roomId, args);
      } else if (toolName === 'perform_attack') {
        return await executeAttack(strapi, roomId, args);
      } else if (toolName === 'get_map_image') {
        return await executeGetMapImage(strapi, roomId, args);
      }

      throw new Error(`Unknown or unsupported direct tool: ${toolName}`);
    } catch (err) {
      strapi.log.error('[ToolExecutor] Execution Error:', err);
      throw err;
    }
  },
});
