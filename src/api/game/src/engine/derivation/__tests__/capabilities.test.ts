import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deriveSpeed, deriveActions } from '@daicer/engine/derivation/capabilities';
import { DerivationContext } from '@daicer/engine/derivation/types';
import { ActionHydrator } from '@daicer/engine/derivation/ActionHydrator';

// Mock ActionHydrator
vi.mock('../ActionHydrator', () => ({
  ActionHydrator: {
    hydrateFromEquipment: vi.fn(),
    hydrateFromSpell: vi.fn(),
  },
}));

const createMockContext = (overrides: Partial<DerivationContext> = {}): DerivationContext => ({
  stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  attributes: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  proficiencyBonus: 2,
  equipment: [],
  spells: [],
  innateActions: [],
  race: { speed: 30 },
  level: 1, // Fix: Added missing required property
  ...overrides,
});

describe('capabilities', () => {
  // lower case to match file export style if needed, or Capitalized
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deriveSpeed', () => {
    it('should return default speed 30 if no race provided (or partial implementation)', () => {
      // Implementation default: { walk: 30 }
      const context = createMockContext({ race: undefined });
      const speed = deriveSpeed(context);
      expect(speed.walk).toBe(30);
    });

    it('should use race speed (number)', () => {
      const context = createMockContext({ race: { speed: 25 } as any });
      const speed = deriveSpeed(context);
      expect(speed.walk).toBe(25);
    });

    it('should use race speed (object)', () => {
      const context = createMockContext({ race: { speed: { walk: 40, fly: 60 } } as any });
      const speed = deriveSpeed(context);
      expect(speed.walk).toBe(40);
      expect(speed.fly).toBe(60);
    });

    it('should apply heavy armor penalty if strength is too low', () => {
      const heavyArmor = {
        name: 'Plate',
        isEquipped: true,
        str_minimum: 15,
        equipment_category: { slug: 'heavy-armor' },
      };
      const context = createMockContext({
        attributes: { strength: 10 } as any, // 10 < 15
        equipment: [heavyArmor] as any,
      });

      // Base 30 - 10 = 20
      const speed = deriveSpeed(context);
      expect(speed.walk).toBe(20);
    });

    it('should NOT apply penalty if strength is sufficient', () => {
      const heavyArmor = {
        name: 'Plate',
        isEquipped: true,
        str_minimum: 13,
        equipment_category: { slug: 'heavy-armor' },
      };
      const context = createMockContext({
        attributes: { strength: 14 } as any, // 14 >= 13
        equipment: [heavyArmor] as any,
      });

      const speed = deriveSpeed(context);
      expect(speed.walk).toBe(30);
    });
  });

  describe('deriveActions', () => {
    it('should return Unarmed Strike if no equipment or innate actions', () => {
      const context = createMockContext();
      const actions = deriveActions(context);

      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('action-unarmed');
      // Str 10 -> Mod 0
      expect(actions[0].attack?.bonus).toBe(2); // 0 + 2 (Prof from context mock)
    });

    it('should include innate actions', () => {
      const innate = [{ id: 'breath-weapon', name: 'Fire Breath' }] as any;
      const context = createMockContext({ innateActions: innate });
      const actions = deriveActions(context);

      expect(actions).toContainEqual(innate[0]);
    });

    it('should hydrate equipped items', () => {
      const sword = { name: 'Sword', isEquipped: true };
      const mockAction = { id: 'w_sword', name: 'Sword' };

      (ActionHydrator.hydrateFromEquipment as any).mockReturnValue([mockAction]);

      const context = createMockContext({ equipment: [sword] as any });
      const actions = deriveActions(context);

      expect(ActionHydrator.hydrateFromEquipment).toHaveBeenCalledWith(sword, context);
      expect(actions).toContain(mockAction);
      // Unarmed strike is fallback ONLY if empty. Now we have a sword, so no unarmed?
      // Logic says: "if (actions.length === 0)".
      // So yes, Unarmed is removed if you have weapons. (Standard 5e actually allows Unarmed always, but code says fallback)
      expect(actions).toHaveLength(1);
    });

    it('should ignore unequipped items', () => {
      const sword = { name: 'Sword', isEquipped: false };
      const context = createMockContext({ equipment: [sword] as any });
      const actions = deriveActions(context);

      expect(ActionHydrator.hydrateFromEquipment).not.toHaveBeenCalled();
      expect(actions[0].id).toBe('action-unarmed');
    });

    it('should hydrate spells', () => {
      const fireball = { name: 'Fireball' };
      const mockAction = { id: 's_fireball', name: 'Fireball' };

      (ActionHydrator.hydrateFromSpell as any).mockReturnValue(mockAction);

      const context = createMockContext({ spells: [fireball] as any });
      const actions = deriveActions(context);

      expect(ActionHydrator.hydrateFromSpell).toHaveBeenCalledWith(fireball, context);
      expect(actions).toContain(mockAction);
    });
  });
});
