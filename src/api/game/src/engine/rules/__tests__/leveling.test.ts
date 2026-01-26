import { describe, it, expect } from 'vitest';
import { resolveLevelUp, getLevelFromXP } from '../leveling';
import { EntitySheet } from '../../types';
import { RuleSet, ClassDefinition } from '../../types/rules';

describe('Leveling Rules', () => {

    const mockRules: RuleSet = {
        xp_table: [0, 300, 900, 2700, 6500],
        proficiency_table: { "1": 2, "2": 2, "3": 2, "4": 2, "5": 3 },
        spell_slots_full: [],
        spell_slots_half: [],
        ability_caps: { default: 20 }
    } as any; // Partial mock is sufficient for pure function testing

    const mockClass: ClassDefinition = {
        name: 'Fighter',
        hit_die: '1d10',
        progression: [
            { level: 1, features: [] },
            { level: 2, features: [{ name: 'Action Surge', documentId: 'f1' }] },
            { level: 3, features: [{ name: 'Martial Archetype', documentId: 'f2' }] }
        ]
    } as any;

    const createSheet = (level: number, xp: number): EntitySheet => ({
        level,
        experience: xp,
        attributes: { Constitution: 14 }, // +2 mod
        maxHp: 12, // Level 1 Fighter: 10 + 2
        hp: 12,
        hitDice: { die: '1d10', total: 1, current: 1 },
        proficiencyBonus: 2,
        features: [],
        spellbook: undefined // Non-caster
    } as any);

    describe('getLevelFromXP', () => {
        it('should return correct level bracket', () => {
            expect(getLevelFromXP(0, mockRules)).toBe(1);
            expect(getLevelFromXP(299, mockRules)).toBe(1);
            expect(getLevelFromXP(300, mockRules)).toBe(2);
            expect(getLevelFromXP(500, mockRules)).toBe(2);
            expect(getLevelFromXP(900, mockRules)).toBe(3);
            expect(getLevelFromXP(10000, mockRules)).toBe(5); // Cap at max index + 1
        });
    });

    describe('resolveLevelUp', () => {
        it('should increment level and proficiency', () => {
            const sheet = createSheet(1, 300);
            const next = resolveLevelUp(sheet, mockClass, mockRules);
            
            expect(next.level).toBe(2);
            // Proficiency table: 2 at lvl 2
            expect(next.proficiencyBonus).toBe(2); 
            
            // HP: Avg(1d10) = 6. +2 Con = 8.
            expect(next.maxHp).toBe(12 + 8); 
            expect(next.hp).toBe(12 + 8);
            
            // Hit Die
            expect(next.hitDice.total).toBe(2);
        });

        it('should add new features', () => {
            const sheet = createSheet(1, 300);
            const next = resolveLevelUp(sheet, mockClass, mockRules);
            
            // Lvl 2 adds Action Surge
            expect(next.features).toHaveLength(1);
            expect(next.features[0].name).toBe('Action Surge');
        });

        it('should prevent levelling past cap', () => {
            const sheet = createSheet(20, 999999);
            const next = resolveLevelUp(sheet, mockClass, mockRules);
            expect(next.level).toBe(20);
        });

        it('should update spell slots (Wizard Mock)', () => {
            const wizardClass: ClassDefinition = {
                name: 'Wizard',
                hit_die: '1d6',
                progression: [
                    { level: 2, spell_slots: [3] } // Level 2: 3 lvl 1 slots
                ]
            } as any;
            
            const sheet = createSheet(1, 300);
            sheet.spellbook = { slots: [{ level: 1, current: 2, max: 2 }] } as any; // Initial: 2 slots

            const next = resolveLevelUp(sheet, wizardClass, mockRules);
            
            expect(next.spellbook?.slots[0].max).toBe(3);
            expect(next.spellbook?.slots[0].current).toBe(3); // Regained + Added capacity
        });
    });
});
