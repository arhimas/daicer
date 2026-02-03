import { describe, it, expect } from 'vitest';
import { ConditionCompiler } from '@daicer/engine/compilation/atoms/ConditionCompiler';
// ConditionType removed as unused

// Mock the conditions enum if needed, or rely on real one.
// Assuming ConditionType has at least 'blinded' or similar standard 5e conditions.
// We can check the actual enum if test fails, but standard D&D conditions are safe bets.

describe('ConditionCompiler', () => {
  const compiler = new ConditionCompiler();

  it('should pass for valid conditions', async () => {
    // We assume 'blinded' exists in ConditionType.
    // If not, we might need to view api/game/src/engine/rules/conditions.ts
    // Safe bet: The code uses Object.values(ConditionType).
    // Let's use 'blinded' and see.
    const validData = { slug: 'blinded' };
    const result = await compiler.compile(validData);

    // If 'blinded' is not in enum, this will fail and we fix it.
    // But logic-wise the test is correct.
    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
  });

  it('should handle prefixed slugs', async () => {
    const validData = { slug: 'status-effect.invisible' };
    const result = await compiler.compile(validData);

    // Assuming invisible is valid
    expect(result.success).toBe(true);
  });

  it('should fail for missing slug', async () => {
    const result = await compiler.compile({});

    expect(result.success).toBe(false);
    expect(result.status).toBe('Invalid');
    expect(result.error).toContain('Missing slug');
  });

  it('should fail for unknown conditions', async () => {
    const invalidData = { slug: 'super-happy' };
    const result = await compiler.compile(invalidData);

    expect(result.success).toBe(false);
    expect(result.status).toBe('Invalid');
    expect(result.error).toContain('Unknown Condition');
  });
});
