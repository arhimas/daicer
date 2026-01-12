import { Core } from '@strapi/strapi';

// Regex to parse tool calls like: tool_name(arg1="val", arg2=123, arg3='{"a":1}')
const TOOL_REGEX = /^([a-zA-Z0-9_]+)\((.*)\)$/s;

// Helper implementation functions defined outside the exported object to avoid 'this' context issues
// Helper implementation functions defined outside the exported object to avoid 'this' context issues

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Execute a tool string directly, bypassing LLM parsing.
   * @param roomId
   * @param toolString
   */
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

    const args: Record<string, string | number | boolean | object | null> = {};

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
        } catch {
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

    // 2. DELEGATE TO TOOL REGISTRY (Unified Path)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolRegistry = strapi.service('api::agent.tool-registry') as any;

      // Check availability first to give better error messages
      if (!toolRegistry.hasTool(toolName)) {
        throw new Error(`Tool '${toolName}' is not registered in the system.`);
      }

      // Execute via Registry (which handles validation and handler invocation)
      return await toolRegistry.execute(toolName, roomId, args, { id: 'system-executor' });
    } catch (err) {
      strapi.log.error('[ToolExecutor] Execution Error:', err);
      throw err;
    }
  },
});
