
import { calculateAC, calculateHP } from '../defenses';
import { DerivationContext } from '../types';

describe('Defenses Derivation', () => {
    const baseStats = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        passivePerception: 10,
        initiativeBonus: 0
    };

    const mockContext: DerivationContext = {
        stats: baseStats,
        attributes: baseStats,
        proficiencyBonus: 2,
        level: 1,
        equipment: []
    };

    describe('calculateAC', () => {
        it('should return 10 + Dex for unarmored', () => {
           // Dex 10 -> +0 -> 10
           expect(calculateAC(mockContext)).toBe(10);

           const dexCtx = { ...mockContext, attributes: { ...baseStats, dexterity: 14 } }; // +2
           expect(calculateAC(dexCtx)).toBe(12);
        });

        it('should handle Light Armor', () => {
            // Leather: 11 AC + Dex
            const item: any = { 
                equipment_category: { slug: 'light-armor' }, 
                armor_class_base: 11,
                armor_class_dex_bonus: true
            };
            const ctx = { ...mockContext, equipment: [item], attributes: { ...baseStats, dexterity: 14 } }; // +2
            expect(calculateAC(ctx)).toBe(13); // 11 + 2
        });

        it('should cap Dex for Medium Armor', () => {
             // Half-Plate: 15 AC + Dex (max 2)
            const item: any = { 
                equipment_category: { slug: 'medium-armor' }, 
                armor_class_base: 15
            };
            // Dex 16 -> +3
            const ctx = { ...mockContext, equipment: [item], attributes: { ...baseStats, dexterity: 16 } }; 
            expect(calculateAC(ctx)).toBe(17); // 15 + 2 (capped)
        });

        it('should ignore Dex for Heavy Armor', () => {
            // Plate: 18 AC
           const item: any = { 
               equipment_category: { slug: 'heavy-armor' }, 
               armor_class_base: 18
           };
           // Dex 16 -> +3
           const ctx = { ...mockContext, equipment: [item], attributes: { ...baseStats, dexterity: 16 } }; 
           expect(calculateAC(ctx)).toBe(18); // 18 + 0
       });

       it('should add Shield bonus', () => {
           const shield: any = { equipment_category: { slug: 'shield' }, armor_class_base: 2 };
           const ctx = { ...mockContext, equipment: [shield] };
           expect(calculateAC(ctx)).toBe(12); // 10 + 2
       });
    });

    describe('calculateHP', () => {
        it('should calculate Level 1 HP correctly', () => {
           // Hit Die 10 (Fighter). Con 14 (+2).
           // Res: 10 + 2 = 12.
           const ctx = { ...mockContext, attributes: { ...baseStats, constitution: 14 }, hitDie: 10, level: 1 };
           expect(calculateHP(ctx)).toBe(12);
        });

        it('should calculate Level 5 HP correctly (Average)', () => {
            // Hit Die 8 (Cleric). Con 14 (+2).
            // Avg(8) = 5.
            // Lvl 1: 8 + 2 = 10.
            // Lvl 2-5: (5 + 2) * 4 = 28.
            // Total: 38.
            const ctx = { ...mockContext, attributes: { ...baseStats, constitution: 14 }, hitDie: 8, level: 5 };
            expect(calculateHP(ctx)).toBe(38);
         });

         it('should fallback if no hitDie', () => {
             const ctx = { ...mockContext, hitDie: undefined, level: 1 };
             // 10 + 0 * 1 = 10
             expect(calculateHP(ctx)).toBe(10);
         });
    });
});
