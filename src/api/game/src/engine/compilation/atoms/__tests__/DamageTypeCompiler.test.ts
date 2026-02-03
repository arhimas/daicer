import { describe, it, expect } from 'vitest';
import { DamageTypeCompiler } from '@daicer/engine/compilation/atoms/DamageTypeCompiler';

describe('DamageTypeCompiler', () => {
  const compiler = new DamageTypeCompiler();

  it('should pass for valid damage types', async () => {
    const validData = { slug: 'fire' };
    const result = await compiler.compile(validData);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
  });

  it('should handle prefixed slugs', async () => {
    const validData = { slug: 'damage-type.cold' };
    const result = await compiler.compile(validData);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
  });

  it('should fail for missing slug', async () => {
    const result = await compiler.compile({});

    expect(result.success).toBe(false);
    expect(result.status).toBe('Invalid');
    expect(result.error).toContain('Missing slug');
  });

  it('should fail for invalid damage types', async () => {
    const invalidData = { slug: 'emotional' };
    const result = await compiler.compile(invalidData);

    expect(result.success).toBe(false);
    expect(result.status).toBe('Invalid');
    expect(result.error).toContain('Invalid DamageType');
  });
});
