import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { Core } from '@strapi/strapi';

/**
 * Retrieves and adapts tools from the central Tool Registry.
 *
 * @param strapi - Strapi instance.
 * @param roomDocumentId - Contextual Room ID for tool execution.
 * @param _mode - Execution mode (game/debug).
 * @returns Array of LangChain DynamicStructuredTools.
 */
export const getRegistryTools = (strapi: Core.Strapi, roomDocumentId: string, _mode: 'game' | 'debug' = 'game') => {
  const tools: DynamicStructuredTool[] = [];

  // Fetch Centralized Tools
  const registry = strapi.service('api::agent.tool-registry');
  const definitions = registry.getTools(); // Returns ToolDefinition[]

  for (const def of definitions) {
    // Adapter
    const tool = new DynamicStructuredTool({
      name: def.name,
      description: def.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: def.schema as z.ZodObject<any>, // Cast required for LangChain strictness
      func: async (input) => {
        try {
          // Pass roomDocumentId and null user (system/agent context)
          const result = await def.handler(roomDocumentId, input, null);

          if (typeof result === 'string') return result;
          if (typeof result === 'object') return JSON.stringify(result);
          return String(result);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          console.error(`Tool ${def.name} execution failed:`, err);
          return `Error: ${err.message || 'Unknown error'}`;
        }
      },
    });

    tools.push(tool);
  }

  return tools;
};
