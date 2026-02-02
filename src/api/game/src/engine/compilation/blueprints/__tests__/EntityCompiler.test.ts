import { describe, it, expect } from 'vitest';
import { EntityCompiler } from '../EntityCompiler';

describe('EntityCompiler', () => {
  const compiler = new EntityCompiler();

  it('should pass for valid entity', async () => {
    const validData = {
      slug: 'goblin',
      name: 'Goblin',
      level: 1,
      stats: {
        strength: 8,
        dexterity: 14,
        constitution: 10,
        intelligence: 10,
        wisdom: 8,
        charisma: 8,
      },
    };
    const result = await compiler.compile(validData);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
  });

  it('should fail for missing stats', async () => {
    const invalidData = {
      slug: 'blob',
      name: 'Blob',
      level: 1,
      // No stats
    };
    const result = await compiler.compile(invalidData);

    expect(result.status).toBe('Invalid');
    expect(result.error).toContain('Missing Stats Component');
  });

  it('should warn for missing action type', async () => {
    const warningData = {
      slug: 'hero',
      name: 'Hero',
      level: 1,
      stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      actions: [
        { slug: 'punch', type: undefined }
      ]
    };
    const result = await compiler.compile(warningData);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Warning');
    expect(result.logs.some(l => l.level === 'warn' && l.message.includes('missing type'))).toBe(true);
  });
});
