import { describe, it, expect, vi, afterEach } from 'vitest';
import { SpellCompiler } from '@daicer/engine/compilation/molecules/SpellCompiler';
import { ActionHydrator } from '@daicer/engine/derivation/ActionHydrator';

// Mock ActionHydrator
vi.mock('../../../derivation/ActionHydrator', () => ({
  ActionHydrator: {
    hydrateFromSpell: vi.fn(),
  },
}));

vi.mock('../../../derivation/types', () => ({
  createValidationContext: vi.fn().mockReturnValue({}),
}));

describe('SpellCompiler', () => {
  const compiler = new SpellCompiler();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass valid spell', async () => {
    const data = { slug: 'fireball', school: 'evocation', level: 3 };

    // Mock hydration
    vi.mocked(ActionHydrator.hydrateFromSpell).mockReturnValue({
      name: 'Fireball',
      effects: [{ type: 'damage', dice: '8d6' }],
    } as any);

    const result = await compiler.compile(data);

    expect(result.success).toBe(true);
    expect(ActionHydrator.hydrateFromSpell).toHaveBeenCalled();
    expect(result.logs.some((l) => l.message.includes('Successfully Hydrated'))).toBe(true);
  });

  it('should warn if hydration returns null', async () => {
    const data = { slug: 'fizzle', school: 'evocation', level: 1 };
    vi.mocked(ActionHydrator.hydrateFromSpell).mockReturnValue(null as any);

    const result = await compiler.compile(data);

    expect(result.success).toBe(false); // logError called
    expect(result.error).toContain('Hydration returned null');
  });

  it('should warn on missing dice in damage effect', async () => {
    const data = { slug: 'weird-spell', school: 'weird', level: 1 };
    vi.mocked(ActionHydrator.hydrateFromSpell).mockReturnValue({
      name: 'Weird',
      effects: [{ type: 'damage' }], // Missing dice/flat
    } as any);

    const result = await compiler.compile(data);

    expect(result.status).toBe('Warning');
    expect(result.logs.some((l) => l.level === 'warn' && l.message.includes('has no dice'))).toBe(true);
  });
});
