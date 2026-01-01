import { describe, it, expect } from 'vitest';
import characterLifecycles from '../content-types/character/lifecycles';

describe('Character Lifecycles', () => {
  describe('validateEquipmentSlots', () => {
    const { beforeCreate, beforeUpdate } = characterLifecycles;

    const runValidation = async (equipment: unknown[]) => {
      const event = { params: { data: { equipment } } };
      await beforeCreate(event as unknown);
    };

    it('should allow valid equipment set', async () => {
      await expect(
        runValidation([
          { slot: 'head', name: 'Helm' },
          { slot: 'body', name: 'Armor' },
        ])
      ).resolves.not.toThrow();
    });

    it('should detect duplicate slots', async () => {
      await expect(
        runValidation([
          { slot: 'ring', name: 'Ring 1' },
          { slot: 'ring', name: 'Ring 2' },
        ])
      ).rejects.toThrow('more than one item equipped in the ring slot');
    });

    it('should ignore backpack items', async () => {
      await expect(
        runValidation([
          { slot: 'backpack', name: 'Potion' },
          { slot: 'backpack', name: 'Rope' },
        ])
      ).resolves.not.toThrow();
    });

    it('should ignore items without slot', async () => {
      await expect(runValidation([{ name: 'Mystery Item' }])).resolves.not.toThrow();
    });

    it('should apply same logic on update', async () => {
      const event = {
        params: {
          data: {
            equipment: [
              { slot: 'head', name: 'H1' },
              { slot: 'head', name: 'H2' },
            ],
          },
        },
      };
      await expect(beforeUpdate(event as unknown)).rejects.toThrow();
    });
  });
});
