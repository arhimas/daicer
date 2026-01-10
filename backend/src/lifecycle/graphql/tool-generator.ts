import { z } from 'zod';
import type { Core } from '@strapi/strapi';

export const generateToolGraphQL = (strapi: Core.Strapi) => {
  const toolRegistry = strapi.service('api::agent.tool-registry');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tools = (toolRegistry as any).getTools();

  let toolTypeDefs = `
    type AgentToolParameter {
      name: String!
      type: String!
      description: String
      required: Boolean
    }

    type AgentToolDefinition {
      name: String!
      description: String!
      parameters: JSON # JSON Schema of the parameters
    }

    extend type Query {
      getAgentTools: [AgentToolDefinition]!
    }
  `;

  const toolResolvers = {
    Mutation: {},
    Query: {
      getAgentTools: () => {
        return tools.map((t) => {
          // Generate JSON Schema for the tool (simplified)
          // In a real scenario, use zod-to-json-schema
          const shape = t.schema instanceof z.ZodObject ? t.schema.shape : {};
          return {
            name: t.name,
            description: t.description,
            parameters: {
              type: 'object',
              properties: Object.keys(shape).reduce((acc, key) => {
                return { ...acc, [key]: { type: 'string' } }; // Simplified for now
              }, {}),
            },
          };
        });
      },
    },
  };

  tools.forEach((tool) => {
    const camelName = toCamelCase(tool.name);
    const inputTypeName = `Tool${capitalize(camelName)}Input`;

    // Generate Input Type SDL
    const inputFields = zodToSDLFields(tool.schema);
    toolTypeDefs += `
      input ${inputTypeName} {
        ${inputFields}
      }
      
      extend type Mutation {
        ${camelName}(payload: ${inputTypeName}!): JSON
      }
    `;

    // Generate Resolver
    toolResolvers.Mutation[camelName] = async (_parent, args, context) => {
      const { payload } = args;
      const { user } = context.state;
      // Default to room from payload if present, or context?
      // ToolRegistry wrappers expected (roomId, payload, user)
      // We need roomId from payload usually.

      // Extract roomId if it exists in payload (it usually does for our tools)
      // If not, we might fail or expect it elsewhere.
      // All our current tools (perform_attack, etc) need context.
      // For now, assume payload has standard fields or we pass context.

      // HACK: Most engine tools need a Room ID.
      // If the payload doesn't have it, we can't run.
      // But the Zod schema might not enforce it if it's implicit?
      // Actually our schemas in ToolRegistry don't have roomId, it's passed as arg 1.
      // The GraphQL mutation MUST accept roomId if it's not in the payload.
      // Let's UPDATE the mutation signature to accept roomId explicitly.

      throw new Error('Tool Execution via GraphQL requires specific RoomID handling logic to be finalized.');
    };
  });

  return { typeDefs: toolTypeDefs, resolvers: toolResolvers };
};

// --- Helpers ---

function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function zodToSDLFields(schema: z.ZodSchema): string {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    return Object.entries(shape)
      .map(([key, value]) => {
        const type = getGraphQLType(value as z.ZodTypeAny);
        return `${key}: ${type}`;
      })
      .join('\n');
  }
  return '';
}

function getGraphQLType(zodType: z.ZodTypeAny): string {
  if (zodType instanceof z.ZodString) return 'String';
  if (zodType instanceof z.ZodNumber) return 'Float'; // or Int
  if (zodType instanceof z.ZodBoolean) return 'Boolean';
  // Simplified array (only primitives for now or need recursive type generation which contributes to SDL)
  if (zodType instanceof z.ZodArray) {
    // If array of objects, we need to generate a new Input Type name...
    // This is getting complex for a single pass.
    // For Phase 1 of this, let's Stick to JSON for complex payloads if nested?
    // Or map basic arrays.
    return '[JSON]';
  }
  if (zodType instanceof z.ZodObject) return 'JSON';
  if (zodType instanceof z.ZodEnum) return 'String'; // Enums as strings for simplicity
  if (zodType instanceof z.ZodOptional) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inner = getGraphQLType(zodType._def.innerType as z.ZodTypeAny);
    return inner.replace('!', ''); // Remove non-null if present
  }
  return 'JSON'; // Fallback
}
