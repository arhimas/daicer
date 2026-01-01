import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// We just test the schema validation logic for payloads
// Replicating the schema logic from perform-action.ts slightly or importing it?
// Since perform-action defines the schema inside the file and doesn't export it separately from the tool...
// We can instantiate the tool and get the schema.

import { performActionTool } from '../perform-action';

describe('Perform Action Tool Payloads', () => {
  const mockContext = { strapi: (globalThis as any).strapi } as any;
  const tool = performActionTool(mockContext);
  const schema = tool.schema as z.ZodObject<any>;

  const commandTypes = ['ATTACK', 'SKILL_CHECK', 'CAST_SPELL', 'INTERACT', 'LONG_REST', 'MODIFY_TERRAIN'];

  it.each(commandTypes)('should accept valid payload for %s', (type) => {
    const input = {
      commandType: type,
      payload: JSON.stringify({ someKey: 'someValue' }), // The tool just checks string JSON
    };
    expect(schema.safeParse(input).success).toBe(true);
  });

  it('should reject invalid command types', () => {
    const input = {
      commandType: 'DANCE_OFF',
      payload: '{}',
    };
    expect(schema.safeParse(input).success).toBe(false);
  });

  // Since actual payload shape validation happens inside the tool execution logic (via casting usually)
  // or via specific Engine schemas, the Tool Schema just validates input string.
  // We can add more specific Engine Schema validity tests if we imported Engine schemas.
  // For now, testing the tool wrapper inputs.

  it('should reject non-string payload if passed raw from some agent', () => {
    const input = {
      commandType: 'ATTACK',
      payload: { target: '123' }, // Schema expects stringified JSON
    };
    // Zod might coerce? No, z.string()
    expect(schema.safeParse(input).success).toBe(false);
  });
});
