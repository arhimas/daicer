import { describe, it, expect } from 'vitest';
import { FeatureCompiler } from '@daicer/engine/compilation/molecules/FeatureCompiler';

describe('FeatureCompiler', () => {
  const compiler = new FeatureCompiler();

  it('should pass valid feature', async () => {
    const data = { slug: 'sneak-attack', name: 'Sneak Attack' };
    const result = await compiler.compile(data);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
  });

  it('should fail missing slug', async () => {
    const result = await compiler.compile({});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing slug');
  });

  it('should fail missing name', async () => {
    const result = await compiler.compile({ slug: 'nameless' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing Name');
  });
});
