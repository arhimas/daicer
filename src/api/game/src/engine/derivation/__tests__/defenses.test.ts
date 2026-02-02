import { describe, it, expect } from 'vitest';
import { calculateAC, calculateHP } from '../defenses';
import { DerivationContext } from '../types';

describe('Defenses Derivation', () => {
    const baseContext = {
        attributes: { dexterity: 10, constitution: 10 },
        equipment: [],
        level: 1,
    } as unknown as DerivationContext;

    describe('calculateAC', () => {
        it('should return 10 + Dex for unarmored', () => {
            const ctx = { ...baseContext, attributes: { ...baseContext.attributes, dexterity: 14 } }; // +2
            expect(calculateAC(ctx as any)).toBe(12);
        });

        it('should use armor base AC', () => {
            const ctx = {
                ...baseContext,
                equipment: [{ 
                    name: 'Leather Armor', 
                    equipment_category: { slug: 'light-armor' }, 
                    armor_class_base: 11, 
                    armor_class_dex_bonus: true 
                }]
            };
            // AC 11 + 0 (Dex 10) = 11
            expect(calculateAC(ctx as any)).toBe(11);
        });

        it('should cap Dex for medium armor', () => {
            const ctx = {
                attributes: { dexterity: 16 }, // +3
                equipment: [{ 
                    name: 'Hide Armor', 
                    equipment_category: { slug: 'medium-armor' }, 
                    armor_class_base: 12 
                }]
            };
            // AC 12 + min(3, 2) = 14
            expect(calculateAC(ctx as any)).toBe(14);
        });

        it('should ignore Dex for heavy armor', () => {
            const ctx = {
                attributes: { dexterity: 16 }, // +3
                equipment: [{ 
                    name: 'Plate', 
                    equipment_category: { slug: 'heavy-armor' }, 
                    armor_class_base: 18 
                }]
            };
            expect(calculateAC(ctx as any)).toBe(18);
        });

        it('should add shield bonus', () => {
             const ctx = {
                attributes: { dexterity: 10 },
                equipment: [
                    { name: 'Shield', equipment_category: { slug: 'shield' }, armor_class_base: 2 }
                ]
            };
            // 10 + 0 + 2 = 12
            expect(calculateAC(ctx as any)).toBe(12);
        });
    });

    describe('calculateHP', () => {
        it('should calc level 1 HP', () => {
            const ctx = {
                attributes: { constitution: 14 }, // +2
                hitDie: '1d10',
                level: 1
            };
            // 10 + 2 = 12
            expect(calculateHP(ctx as any)).toBe(12);
        });

        it('should calc higher level HP', () => {
            const ctx = {
                attributes: { constitution: 14 }, // +2
                hitDie: '1d10', // max 10, avg 6
                level: 3
            };
            // Lvl 1: 12
            // Lvl 2-3: (6 + 2) * 2 = 16
            // Total: 28
            expect(calculateHP(ctx as any)).toBe(28);
        });

        it('should handle numeric hitDie', () => {
             const ctx = {
                attributes: { constitution: 10 },
                hitDie: 8,
                level: 1
            };
            expect(calculateHP(ctx as any)).toBe(8);
        });
    });
});
