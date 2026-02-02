import { describe, it, expect, vi, afterEach } from 'vitest';
import { EquipmentCompiler } from '../EquipmentCompiler';
import { ActionHydrator } from '../../../derivation/ActionHydrator';

// Mock ActionHydrator
vi.mock('../../../derivation/ActionHydrator', () => ({
  ActionHydrator: {
    hydrateFromEquipment: vi.fn(),
  },
}));

vi.mock('../../../derivation/types', () => ({
  createValidationContext: vi.fn().mockReturnValue({}),
}));

describe('EquipmentCompiler', () => {
  const compiler = new EquipmentCompiler();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should pass for simple item', async () => {
    const data = { slug: 'rope', name: 'Rope', type: 'gear' };
    const result = await compiler.compile(data);

    expect(result.success).toBe(true);
    expect(result.status).toBe('Valid');
  });

  it('should attempt hydration for weapons', async () => {
    const data = { 
      slug: 'sword', 
      name: 'Sword', 
      type: 'equipment', 
      equipment_category: { slug: 'martial-weapon' } 
    };

    // Mock successful hydration
    vi.mocked(ActionHydrator.hydrateFromEquipment).mockReturnValue([{ name: 'Slash', effects: [] }]);

    const result = await compiler.compile(data);

    expect(result.success).toBe(true);
    expect(ActionHydrator.hydrateFromEquipment).toHaveBeenCalled();
    expect(result.logs.some(l => l.message.includes('Hydrated 1 action'))).toBe(true);
  });

  it('should log error if hydration fails', async () => {
    const data = { 
      slug: 'bad-sword', 
      name: 'Bad Sword', 
      equipment_category: { slug: 'martial-weapon' } 
    };

    // Mock throw
    vi.mocked(ActionHydrator.hydrateFromEquipment).mockImplementation(() => {
      throw new Error('Parse error');
    });

    const result = await compiler.compile(data);

    expect(result.success).toBe(false); // logError sets success false
    expect(result.status).toBe('Invalid');
    expect(result.error).toContain('Weapon Hydration Crash');
  });
});
