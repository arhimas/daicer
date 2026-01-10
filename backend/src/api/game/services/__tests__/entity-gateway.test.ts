import { describe, it, expect, vi, beforeEach } from 'vitest';
import gatewayFactory from '../entity-gateway';
import { ZodError } from 'zod';

const mockFindOne = vi.fn();
const mockAdapt = vi.fn();

const globalStrapi = {
  entityService: {
    findOne: mockFindOne,
  },
  service: (name: string) => {
    if (name === 'api::game.entity-adapter') return { adapt: mockAdapt };
    return {};
  },
  // Mock factory requirement
  contentType: vi.fn().mockReturnValue({ attributes: {} }),
} as any;

describe('EntityGateway', () => {
  let gateway: any;

  beforeEach(() => {
    vi.clearAllMocks();
    gateway = gatewayFactory({ strapi: globalStrapi });
  });

  it('should return valid entity when data is correct', async () => {
    const mockSheet = { id: 'doc-1' };
    mockFindOne.mockResolvedValue(mockSheet);

    // Adapter returns valid raw object
    // NOTE: We need to match the Schema STRICTLY.
    // Schema expects 'stats', 'hp', 'maxHp', 'armorClass', 'speed', 'position'...
    mockAdapt.mockReturnValue({
      id: 'doc-1',
      name: 'Valid Hero',
      type: 'player',
      position: { x: 0, y: 0, z: 0 },
      hp: 10,
      maxHp: 20,
      armorClass: 15,
      speed: { walk: 30 },
      stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      actions: [],
      features: [],
      conditions: [],
      resistances: [],
      immunities: [],
      vulnerabilities: [],
      color: '#fff',
      visionRadius: 30,
    });

    const result = await gateway.fetchEntity('doc-1');
    expect(result.name).toBe('Valid Hero');
    expect(result.level).toBe(1); // Default check
  });

  it('should throw ZodError if required fields are missing', async () => {
    const mockSheet = { id: 'doc-bad' };
    mockFindOne.mockResolvedValue(mockSheet);

    // Adapter returns BROKEN object (missing hp)
    mockAdapt.mockReturnValue({
      id: 'doc-bad',
      name: 'Broken Hero',
      type: 'player',
      // hp missing
      maxHp: 20,
      // armorClass missing
      speed: 30, // Schema allows number transform
      stats: { strength: 10 }, // Missing other stats? Schema defaults?
      // My StatBlockSchema had defaults! So partial stats might pass?
      // Let's check StatBlockSchema: all fields have .default(10). So empty object {} is valid stats!
    });

    await expect(gateway.fetchEntity('doc-bad')).rejects.toThrow(ZodError);
  });
});
